import json
import pickle
import pandas as pd
import numpy as np
import os
from os import TMP_MAX, path
import math
def SumPfOther(i,listPfBonus):
    sumPfPrec=0
    for j in range(i-1):
        sumPfPrec+=listPfBonus[j]
    return sumPfPrec
#-------------------------------------------
src = "./ages-cost/"
arcBonus=90

for dirpath, dirnames, files in os.walk(src):
    print(files,"\n")

    for namef in files:

        pathFile=src+namef
        print("File:",namef)

        fDs=open(pathFile)
        data=json.load(fDs)

        listGe_it=data[0]["GE_it"]
        listGe_en=data[0]["GE_en"]
        print("List of GE en:",listGe_en)
        print("List of GE it:",listGe_it)
        print("++++++++++++++++++++++++++++++++++++++++++++")

        for Ge_it,Ge_en in zip(listGe_it,listGe_en):

            listInfoGe=[]
            
            info={}
            info={"Ge_en" : Ge_en,"Ge_it":Ge_it}
            listInfoGe.append(info)
            
            print("---------------------------------")
            print("GE it: ",Ge_it," GE en: ",Ge_en)
            lvl=0

            for item in data[1:]:

                lvl+=1
                print("Lvl: ",lvl)
                
                cost=item["cost"]
                print("Costo: ",cost)
                
                i=0
                listPf=[]
                for pos in item["reward"]:
                    i+=1
                    listPf.append(pos["fp"])
                    print("Pos",i,": ",pos["fp"])

                i=0
                listPfBonus=[]
                for pos in item["reward"]:
                    i+=1
                    pf_bonus=math.ceil(pos["fp"]*(1+arcBonus/100))
                    listPfBonus.append(pf_bonus)
                    print("Pos",i," Arc 90: ",pf_bonus)

                i=0
                listPfCover=[]
                for pos in item["reward"]:
                    i+=1
                    pf_cover=item["cost"]-(SumPfOther(i,listPfBonus)+2*listPfBonus[i-1])

                    #pf cover < 0 nessuna copertura
                    if(pf_cover<0):
                        pf_cover=0

                    #pf cover < pf cover della pos precedente => si prende la precedente
                    if i!=1 and pf_cover <listPfCover[i-2]:
                        pf_cover=listPfCover[i-2]

                    listPfCover.append(pf_cover)
                    print("Pf X Cover Pos",i,": ",pf_cover)
                
                #Obj Json
                info={}
                info["Lvl"]=lvl
                info["Cost"]=cost
                info["Reward"]=listPf
                info["RewardWithArc90"]=listPfBonus
                info["CoverWithArc90"]=listPfCover

                listInfoGe.append(info)
                print("---------------------------------")
            nameList=Ge_it.split(" ")
            tmpName=""
            for word in nameList:
                tmpName+=word+"_"
            tmpName=tmpName[:-1].lower()
            nameFile='./GeJson/'+tmpName+'.json'
            if path.exists(nameFile):
                print("File "+nameFile+" già esistente")
            else:
                with open(nameFile, 'a+') as file:
                    json.dump(listInfoGe, file,indent=4)

        fDs.close()

