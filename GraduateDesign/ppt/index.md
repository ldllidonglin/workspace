title: 网络VGI数据可视化方法研究
speaker: 李冬琳
url: localhost:202/
files: /css/main.css,/js/zoom.js
theme: dark

[slide]
    # <font size="20px;">网络VGI数据可视化方法研究</font>
<div style="position:absolute;bottom:0px;right:0px;">
  <div style="text-align:left;margin-bottom:10px;">答辩人：李冬琳</div>
  <div>指导老师：李精忠</div>
</div>
[slide]
# Contents  {:&.content}
* 研究背景 {:&.moveIn}
* 研究目的 
* 研究内容
* 研究结果
[slide]
# 研究背景 {:&.flexbox.vleft}
- <font color="#FBA83D" size = "6px">VGI数据</font> {:&.moveIn}  
 VGI即自愿者地理信息，VGI数据指的是通过在线协作的方式创造的各种地理信息数据。是web2.0
 时代由用户创建内容这一概念与地理信息相结合的产物。随着互联网的发展，VGI数据迎来爆发式增长。
 比如OpenStreetMap.org项目，其目前的数据集已超过<strong>400G</strong>，用户已经
 超过<strong>150万</strong>，各种居民点、道路、 注记等要素的个数已经超过<strong>1亿</strong>。
 浪微博用户已经超过<strong>2.2亿</strong>，每天有超过<strong>5000万</strong>的用
 户会在在微博平台上发布微博。
[slide]
# 研究背景 {:&.flexbox.vleft}
- <font color="#FBA83D" size = "6px">VGI数据特点</font> {:&.moveIn}  
 + 时效性高
 + 获取成本低
 + 信息丰富
 + 数据种类多
 + 分布范围广
 + ...  
VGI数据分为空间特征数据、时间特征数据、语义特征数据。分别选取POI数据、出租车轨迹数据、
微博数据作为实验对象，进行可视化方法研究。

[slide]
# 研究背景 {:&.flexbox.vleft}
- <font color="#FBA83D" size = "6px">大数据时代</font> {:&.moveIn}  
   随着信息技术的飞速发展，传感网、互联网、通信网、行业网等网络系统构成的<strong>泛在网络</strong>产生了海量的带有地理空间信息的数据，这些数据背后隐藏的信息才是真正的价值 
- <font color="#FBA83D" size = "6px">当前数据挖掘的两个维度</font>
 + <font color="#4590a3" size = "5px">从机器和计算机的角度</font> {:&.moveIn}  
   强调机器的计算能力和人工智能，以各种高性能处理算法、智能搜索与挖掘算法等为主要研究内容，也是当前数据挖掘研究领域的主流。
 + <font color="#4590a3" size = "5px">从人作为分析的主题和需求主体的角度</font>  
   强调基于人机交互的、符合人的认知规律的分析方法,意图将人所具备的、机器并不擅长的认知能力融入分析过程中，可视分析是主要代表。
[slide]
# 研究背景 {:&.flexbox.vleft}

* ## <font color="#FBA83D" size = "6px">可视化</font>  {:&.zoomIn}
可视化是一种将数据（特别是多维数据）以转换为人的视觉可以直接感受的具体计算机图形图像的方式显示的计算机技术。人类从外界获得的信息约有 80%以上来自于视觉系统当大数据以直观的可视化的图形形式展示在分析者面前时，分析者往往能够一眼洞悉数据背后隐藏的信息并转化知识以及智慧 
* <div  style="display:flex;list-style:none">
<img src="/img/Facebook.png" style="flex:1;height:300px">
<img src="/img/engt.png" style="flex:1;margin-left:10px;height:300px">
</div>
<div style="display:flex">
<span style="flex:1;" class="img-item">Facebook全球用户的好友关系</span>
<span style="flex:1;margin-left:10px;" class="img-item">英国交通事故发生地点可视化</span>
</div>