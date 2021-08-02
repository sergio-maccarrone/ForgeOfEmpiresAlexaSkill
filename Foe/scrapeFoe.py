import requests
import json
import pickle
import urllib.request
import pandas as pd
import numpy as np
from urllib.request import urlopen as uRequest
from bs4 import BeautifulSoup 
import pickle
from os import path
req = requests.get("https://foe.tools/it/gb-investment/Observatory")
soup = BeautifulSoup(req.content, 'html.parser')
print(soup)
"""
DfStore="./dfFoe.pkl"  
if path.exists(DfStore):
    print("Df già esistente")
else:
    print("Df in creazione")
    #scrape link of  GE

    req = requests.get("https://foe-assistant.com/en/great-buildings")
    soup = BeautifulSoup(req.content, 'html.parser')
    row=soup.findAll('div', {"class": "card"})
    #link="https://foe-assistant.com"+row[0].a["href"]
    #print("link:",link)
    linkList=[]
    for elem in row:
        link="https://foe-assistant.com"+elem.a["href"]
        linkList.append(link)

    print("---------------------------------------------------")
    print(linkList)
    print("---------------------------------------------------")
    nameList,levelList,postionList,coverageList=[],[],[],[]
    for link in linkList:
        req = requests.get(link)
        soup = BeautifulSoup(req.content, 'html.parser')
        name=soup.find("h1").contents[1]
        
        row=soup.findAll('tr', {"class": "text-right"})
        for livello in row:
            lvl=livello.find("th").contents[0]
            other=livello.find_all("td")

            print(name)
            nameList.append("GE : "+str(name))
            print("Lvl:",lvl)
            levelList.append("Lvl : "+str(lvl))
            index=0
            posList=[]
            covList=[]
            for elem in other[1:]:
                #try perché potrebbe non avere la copertura in tal caso ==0
                
                index+=1
                pf=elem.contents[0].strip().replace(" ","")
                try:
                    pf_cov=elem.contents[1].string
                except:
                    pf_cov=0
                print("Pos: ",index," PF: ", pf, "Per coprire: ",pf_cov)
                posList.append("Pos"+str(index)+":"+str(pf))
                covList.append("Cov_Pos"+str(index)+":"+str(pf_cov))
                if index==5:
                    break
            postionList.append(posList)
            coverageList.append(covList)
    dfFoe=pd.DataFrame()
    dfFoe["Name"]=nameList
    dfFoe["Lvl"]=levelList
    dfFoe["Pf"]=postionList
    dfFoe["CovPf"]=coverageList
    dfFoe.to_pickle(DfStore)
dfFoe = pd.read_pickle(DfStore)


import json
result = dfFoe.to_json(orient="split")
parsed = json.loads(result)
#print(json.dumps(parsed, indent=4) )
with open('foe.json', 'w') as json_file:
    json.dump(parsed,  json_file, indent=4)
"""