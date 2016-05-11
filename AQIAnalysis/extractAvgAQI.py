# -*- coding: UTF-8 -*-
from pymongo import MongoClient
from bs4 import BeautifulSoup
import urllib2,codecs,re,time
client=MongoClient('mongodb://202.114.123.54:27017/')
db=client.aqi
collection=db['aqi2015b']
def getavgAQI():
  avgaqis=collection.aggregate([
    {
      '$match':{
        'timestamp':{'$gte':1420041600,'$lte':1427731200}
      }
    },
    {
      '$project':{
        'area':1,
        'aqi':1,
        'geo':1,
        'avgaqi':1,
        'co':1,
        'timestamp':1
        }
    },
    {
      '$group': {
          '_id': "$area",
          'avgaqi': { '$avg': "$aqi" },
          'count': { '$sum': 1 },
          'geo':{'$addToSet':'$geo'}
        }
    },
    { 
      '$match': { 
        'count': { '$gt': 0 }
      }
    },{
      '$project':{
        'area':1,
        'aqi':1,
        'geo':1,
        'avgaqi':1,
        'co':1
        }
    }])
  for avgaqi in avgaqis:
    with open('./avgaqis201501.csv','a') as w:
        w.write(avgaqi['_id'].encode("utf-8")+","+str(round(avgaqi['avgaqi']))+","+str(avgaqi['geo'][0][0])+","+str(avgaqi['geo'][0][1])+"\n")

getavgAQI()