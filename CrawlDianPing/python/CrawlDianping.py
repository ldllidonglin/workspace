# -*- coding: UTF-8 -*-
from bs4 import BeautifulSoup
import re,requests,time

pageIndex=1
tempTag=1
def main():
    global pageIndex
    with open("D:/Test/python/pageIndex.txt","r") as c:
         pageIndex=int(c.readline())
    getAllPort()

#美食入口，获取所有分区链接
def getAllPort():
    entrance="http://www.dianping.com/search/category/1/10/"
    headers={'User-Agent':'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36','Cookie':'navCtgScroll=0; showNav=#nav-tab|0|0; navCtgScroll=0; showNav=#nav-tab|0|0; _hc.v="\"28c48835-807a-422e-ba61-ad744498f777.1450593856\""; __utma=1.196682546.1450594182.1450594182.1452605452.2; __utmz=1.1452605452.2.2.utmcsr=gufensoso.com|utmccn=(referral)|utmcmd=referral|utmcct=/search/; PHOENIX_ID=0a018986-152531ce5a3-13cb4e7; s_ViewType=10; JSESSIONID=6FAF186D727AFC4CD60107EBA6D2D2D4; aburl=1; cy=1; cye=shanghai'}
    proxies={'http':"117.175.193.42:8123" ,
            "https": "http://10.10.1.10:1080"}
    response = requests.get(entrance,headers=headers)
    datasoup=BeautifulSoup(response.text,"html.parser",from_encoding='gb2312')
    regions=datasoup.find('div',id='J_nt_items').findAll('a')
    for region in regions:
        url='http://www.dianping.com'+region['href']
        getList(url)

# 获取选定了分区的页面
def getList(url):
    headers={'User-Agent':'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36','Cookie':'showNav=#nav-tab|0|0; navCtgScroll=0; navCtgScroll=0; showNav=#nav-tab|0|0; _hc.v="\"28c48835-807a-422e-ba61-ad744498f777.1450593856\""; __utma=1.196682546.1450594182.1450594182.1452605452.2; __utmz=1.1452605452.2.2.utmcsr=gufensoso.com|utmccn=(referral)|utmcmd=referral|utmcct=/search/; PHOENIX_ID=0a018986-152531ce5a3-13cb4e7; s_ViewType=10; JSESSIONID=2253E3DD5E72430473A45342361F6501; aburl=1; cy=1; cye=shanghai'}
    response = requests.get(url,headers=headers)
    datasoup=BeautifulSoup(response.text,"html.parser",from_encoding='gb2312')
    categories=datasoup.find('div',id='classfy').findAll('a')
    for category in categories:
        url='http://www.dianping.com'+category['href']
        global tempTag
        tempTag+=1
        if tempTag>pageIndex:
            getDataPage(url)
            with open("D:/Test/python/pageIndex.txt","w") as c:
                c.write(str(tempTag))


#选定了分区、分类后的页面
def getDataPage(url):
    print url
    time.sleep(3)

    headers={'User-Agent':'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36','Cookie':'_hc.v="\"28c48835-807a-422e-ba61-ad744498f777.1450593856\""; __utma=1.196682546.1450594182.1450594182.1452605452.2; __utmz=1.1452605452.2.2.utmcsr=gufensoso.com|utmccn=(referral)|utmcmd=referral|utmcct=/search/; PHOENIX_ID=0a018986-152531ce5a3-13cb4e7; s_ViewType=10; JSESSIONID=4EC8AED78395F655AC28D74CF5128DB5; aburl=1; cy=1; cye=shanghai'}
    response = requests.get(url,headers=headers)
    datasoup=BeautifulSoup(response.text,"html.parser",from_encoding='gb2312')
    shoplist=datasoup.findAll('div',class_='txt')
    for shop in shoplist:
        getInfo(shop)
    #翻页
    page=datasoup.find('div',class_='page')
    if page is not None:
        nextpage=page.find('a',{'class':'next'})
        if nextpage is not None:
            nextpageurl='http://www.dianping.com'+nextpage['href']
            getDataPage(nextpageurl)

request_count=1;
#获取解析页面中的单条信息，获取店铺地址
def getInfo(shop):
    time.sleep(5)
    outFilePath='D:/Test/python/shanghai0120.csv'
    headinfo=shop.find('div',class_='tit').findAll('a')
    url='http://www.dianping.com'+headinfo[0]['href']
    global request_count
    request_count+=1
    if request_count%10==0:
        time.sleep(20)
    getDetailInfo(url,outFilePath)

#店铺详情页
def getDetailInfo(url,outFilePath):
    print url
    headers={'User-Agent':'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36','Cookie':'_hc.v="\"28c48835-807a-422e-ba61-ad744498f777.1450593856\""; __utma=1.196682546.1450594182.1450594182.1452605452.2; __utmz=1.1452605452.2.2.utmcsr=gufensoso.com|utmccn=(referral)|utmcmd=referral|utmcct=/search/; PHOENIX_ID=0a018986-152531ce5a3-13cb4e7; s_ViewType=10; JSESSIONID=4EC8AED78395F655AC28D74CF5128DB5; aburl=1; cy=1; cye=shanghai'}
    response = requests.get(url,headers=headers)
    datasoup=BeautifulSoup(response.text,"html.parser",from_encoding='gb2312')
    datasoup=datasoup.find('div',class_='body-content clearfix')
    if datasoup is None:
        return
    print 'data'
    # 头部信息
    #店名
    name=datasoup.find("h1",{"class":"shop-name"}).text.encode('utf-8')
    name=name.split('\n')[1]
    #总店分店
    branch='总店'
    if datasoup.find('a',{'class':'branch J-branch'}):
        branch='分店'
    branch=branch.decode('utf-8').encode('utf-8')
    briefinfo=datasoup.find('div',{'class':'brief-info'})
    if briefinfo is None:
        return
    #商户星级
    level= briefinfo.find('span',class_="mid-rank-stars")['title'].encode('utf-8')
    # 点评数
    infos=briefinfo.findAll('span',class_='item')
    if(len(infos)==5):
        commentnum=infos[0].text[:-3].encode('utf-8')
        # 人均消费
        avgCost=infos[1].text[3:-1].encode('utf-8')
        # 口味
        taste=infos[2].text[3:].encode('utf-8')
        # 环境
        env=infos[3].text[3:].encode('utf-8')
        #服务
        service=infos[4].text[3:].encode('utf-8')
    elif(len(infos)==4):
        commentnum='0'.decode('utf-8').encode('utf-8')
        # 人均消费
        avgCost=infos[0].text[3:-1].encode('utf-8')
        # 口味
        taste=infos[1].text[3:].encode('utf-8')
        # 环境
        env=infos[2].text[3:].encode('utf-8')
        #服务
        service=infos[3].text[3:].encode('utf-8')
        print service
    else:
        return
    links = datasoup.find("div",{"class":"breadcrumb"}).findAll('a')
    # 分类
    category=re.sub(r'\s', "", links[len(links)-1].text.encode('utf-8'))
    # 商圈
    businessArea=re.sub(r'\s', "", links[1].text.encode('utf-8'))
    #城市
    city=re.sub(r'\s', "", links[0].text.encode('utf-8'))
    # 地址
    address=datasoup.find("div",{"class":"expand-info address"}).find('span',class_='item').text
    address=re.sub(r'\s', "", address).encode('utf-8')
    data=city+','+name+','+branch+','+level+','+commentnum+','+avgCost+','+taste+','+env+','+service+','+category+','+businessArea+','+address+'\n'
    with open(outFilePath,"a") as c:
        c.write(data)
main()