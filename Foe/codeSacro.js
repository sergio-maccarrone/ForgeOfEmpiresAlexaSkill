/**
 * Get all data from GB for a specific level
 *
 * @param gb {object} Pointer of Great Building
 * @param currentLevel {number} Current level
 * @param investorPercentage {Array} percentage of investors (Arc)
 * @param defaultParticipation {Array} Default participation used if reward of the place is equal to 0.
 * If null, all default place participation are set to 0.
 * @param ownerPreparation {number} Current preparation of the owner
 * @param yourArcBonus {number} Your arc bonus in [0;Infinity[
 * @return {object}
 */
 function levelInvestment(
    gb,                                                                                     //babele
    currentLevel,                                                                           //1
    investorPercentage,
    defaultParticipation = [],
    ownerPreparation = 0,
    yourArcBonus = 0
  ) {
    const result = {};
    result.cost = gb[currentLevel - 1].cost;                                                 //40
    result.investment = [];                                                                  //[]
    result.otherInvestment = [];                                                             //[]
    const defaultParticipationSum = defaultParticipation.reduce((i, j) => i + j.value, 0);  
    const currentPreparationInvestment = ownerPreparation + defaultParticipationSum;
  
    const remainingDefaultParticipation = JSON.parse(JSON.stringify(defaultParticipation));
    let levelCostReached = false;
    let cumulativeParticipation = 0;
    let maxPreparation = 0;
    let cumulativeInvestment = ownerPreparation + defaultParticipationSum;                  //0 + somma (defaultParticipation)
    let lastPreparation = ownerPreparation;                                                 //0
    let defaultParticipationIndex = 0;
    for (let i = 0; i < gb[currentLevel - 1].reward.length && !levelCostReached; i++) {     //finché i < 5 AND costo livello non raggiunto
      const investment = {
        reward: gb[currentLevel - 1].reward[i].fp,                                          //ricompensa=5
        expectedParticipation: Math.round(gb[currentLevel - 1].reward[i].fp * (1 + investorPercentage[i] / 100)), //partecip = 5 * (1 +  (90 / 100)) = 10
        isInvestorParticipation: false,
        roi: 0,
        snipe: {
          fp: 0,
          roi: 0,
        },
        defaultParticipationIndex: -1,
      };
      let securePlaceYourParticipation = 0;
      let currentPreparation = lastPreparation;
  
      if (remainingDefaultParticipation.length > 0) {
        securePlaceYourParticipation = remainingDefaultParticipation[0].value;
      }
  
      const securePlaceValue = securePlace(
        result.cost, //40
        cumulativeInvestment,//0
        securePlaceYourParticipation,//5
        0,
        investorPercentage[i],//90
        investment.reward//5
      );
      //(40-20-(10-0))/2 + 10 =10
  
      // Compute the participation of the investor
      if (
        securePlaceYourParticipation >= investment.expectedParticipation ||
        (securePlaceValue.fp > 0 && securePlaceYourParticipation >= securePlaceValue.fp)
      ) {
        investment.participation = securePlaceYourParticipation;
        investment.isInvestorParticipation = true;
        investment.roi = investment.expectedParticipation - securePlaceYourParticipation;
        investment.defaultParticipationIndex = defaultParticipationIndex;
        defaultParticipationIndex++;
        remainingDefaultParticipation.shift();
      } else {
        const preparation = investment.expectedParticipation;
        const localCumulativeParticipation =
          cumulativeParticipation + remainingDefaultParticipation.reduce((i, j) => i + j.value, 0);
        const localMaxPreparation = Math.max(maxPreparation, preparation);
        const localCumulativeInvestment = localCumulativeParticipation + localMaxPreparation;
        investment.participation = investment.expectedParticipation;
        if (localCumulativeInvestment >= result.cost) {
          investment.participation += result.cost - localCumulativeInvestment;
        }
      }
  
      let securePlaceOtherParticipation = 0;
      let yourParticipation = 0;
      for (let j = 0; j < remainingDefaultParticipation.length; j++) { // da 0 a j<2
        if (remainingDefaultParticipation[j].isPotentialSniper) {
          if (yourParticipation === 0) {
            yourParticipation = remainingDefaultParticipation[j].value;
          }
          for (let k = j + 1; k < remainingDefaultParticipation.length; k++) {
            securePlaceOtherParticipation += remainingDefaultParticipation[k].value;
          }
          break;
        } else {
          securePlaceOtherParticipation += remainingDefaultParticipation[j].value; //5
        }
      }
      currentPreparation = Math.max(
        0,
        result.cost - (cumulativeParticipation + securePlaceOtherParticipation + 2 * investment.participation)
      ); //max(0, 60 -((0+5)+2*19 )
      //4707 - ((0+1634)+2)
  
      // Compute possible snipe
      const otherParticipation = investment.isInvestorParticipation ? investment.participation : 0;
      investment.snipe = securePlace(
        result.cost,
        currentPreparationInvestment,
        yourParticipation,
        otherParticipation,
        yourArcBonus,
        investment.reward
      );
  
      if (investment.participation === 0) {
        levelCostReached = true;
        continue;
      }
  
      // Compute the cost to secure the place
      if (currentPreparation < lastPreparation) {
        currentPreparation = lastPreparation;
      }
      investment.preparation = currentPreparation;
      lastPreparation = currentPreparation;
      cumulativeParticipation += investment.participation;
      maxPreparation = Math.max(maxPreparation, investment.preparation);
      cumulativeInvestment =
        cumulativeParticipation + maxPreparation + remainingDefaultParticipation.reduce((i, j) => i + j.value, 0);
      investment.cumulativeInvestment = cumulativeInvestment;
      result.investment.push(investment);
  
      if (!levelCostReached && cumulativeInvestment >= result.cost) {
        levelCostReached = true;
      }
    }
  
    result.totalPreparations = Math.max(
      result.investment[result.investment.length - 1].preparation,
      result.cost - cumulativeParticipation - remainingDefaultParticipation.reduce((i, j) => i + j.value, 0)
    );
    result.level = currentLevel;
  
    // In case where level cost has been reached before added first five places, we add missing places
    for (let i = result.investment.length; i < gb[currentLevel - 1].reward.length; i++) {
      result.investment.push({
        reward: gb[currentLevel - 1].reward[i].fp,
        expectedParticipation: Math.round(gb[currentLevel - 1].reward[i].fp * (1 + investorPercentage[i] / 100)),
        preparation: result.totalPreparations,
        isInvestorParticipation: false,
        roi: 0,
        snipe: {
          fp: 0,
          roi: 0,
        },
        defaultParticipationIndex: -1,
      });
      if (remainingDefaultParticipation.length) {
        result.investment[result.investment.length - 1].isInvestorParticipation = true;
        result.investment[result.investment.length - 1].roi =
          result.investment[result.investment.length - 1].expectedParticipation - remainingDefaultParticipation[0].value;
        result.investment[result.investment.length - 1].participation = remainingDefaultParticipation[0].value;
        result.investment[result.investment.length - 1].defaultParticipationIndex = defaultParticipationIndex;
        defaultParticipationIndex++;
        remainingDefaultParticipation.shift();
      }
    }
  
    // Add the remaining investors
    while (remainingDefaultParticipation.length) {
      result.otherInvestment.push({
        reward: 0,
        expectedParticipation: 0,
        preparation: 0,
        participation: remainingDefaultParticipation[0].value,
        defaultParticipationIndex,
        isInvestorParticipation: true,
        snipe: {
          fp: 0,
          roi: 0,
        },
      });
      defaultParticipationIndex++;
      remainingDefaultParticipation.shift();
    }
  
    return result;
  }