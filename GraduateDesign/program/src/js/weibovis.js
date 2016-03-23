/**
 * the class of weibo-text-map
 */
class WeiboTextMap {
    constructor(domId){
        this.domId = domId;
        $("#"+domId).show();
        var map = initMap(domId);
        initWeiboTextMap(map);
    }
    show(){
        $("#"+this.domId).show();
    }
    hide(){
        $("#"+this.domId).hide();
    }
}
/**
 * initialize WeiboTextMap
 * @param  {[Object]} map [map Object]
 * @return {[null]}     [null]
 */
async function initWeiboTextMap(map){
    const IDF = await getIdfData();
    var weibo_data = await getWeiboData("武汉");
    getWeiboTextCluster(weibo_data,map,IDF);
}
/**
 * get data by URL
 * @param  {[string]} url [api's uri]
 * @return {[Object]}     [promise Object]
 */
function getData(url){
    var promise = new Promise(function(resolve, reject){
        var client = new XMLHttpRequest();
        client.open("GET", url);
        client.onreadystatechange = handler;
        client.send();

        function handler() {
          if(this.status === 500){
            alert("数据加载出错，请刷新浏览器");
          }
          if ( this.readyState !== 4 ) {
            return;
          }
          if (this.status === 200) {
            resolve(this.response);
          } else {
            reject(new Error(this.statusText));
          }

        };
    });
    return promise;
}

/**
 * get the idf-dat by /data/idf.txt
 * @return {[Object]} [Promise Object]
 */
function getIdfData(){
    return getData("data/idf.txt");
}
/**
 * map initialize
 * @param  {[string]} domId [map container dom id]
 * @return {[obj]}       [map object]
 */
function initMap(domId){
    L.mapbox.accessToken = 'pk.eyJ1IjoiZG9uZ2xpbmdlIiwiYSI6Ik1VbXI1TkkifQ.7ROsya7Q8kZ-ky9OmhKTvg';
    var layer = L.mapbox.tileLayer('mapbox.streets');
    var layer_satelite = L.mapbox.tileLayer('mapbox.streets-satellite');
    var map = L.mapbox.map(domId).setView([30.590623,114.274462], 11).addLayer(layer);
    
    //append the title of map
    var container = document.getElementById(domId);
    var width = container.clientWidth;
    var title = document.createElement("div");
    title.style.position = "absolute";
    title.style.left = (width/2 - 183) +"px";
    title.style.fontSize = "24px";
    title.style.color = "chocolate";
    title.style.marginTop = "10px";
    title.textContent = "武汉近24小时微博聚合可视化结果"
    container.appendChild(title);

    return map;
}
/**
 * the class of 3d-map of weibo-event
 */
class  Event3DMap{
    constructor(domId){
        this.domId = domId;
        $("#"+domId).show();
        var container = document.getElementById(domId);
        var globe = new DAT.Globe(container);
        $.get("http://202.114.123.53/zx/aqi/getAQICityList.php")
        .then(function(data){
            data = JSON.parse(data);
            var mapdata=[];
            mapdata['1990']=[];
            for(var i in data){
                var city=data[i];
                mapdata['1990'].push(city.lat);
                mapdata['1990'].push(city.lon);
                mapdata['1990'].push(Math.random()-0.6);
            }
            globe.addData( mapdata['1990'], {format: 'magnitude', name: '1990'} );
            // Create the geometry
            globe.createPoints();
            // Begin animation
            globe.animate();
        });
    }
    hide(){
        $("#"+this.domId).hide();
    }
    show(){
        $("#"+this.domId).show();
    }
}

/**
 * get the weibo-data
 * @param  {[string]} city     [name of city]
 * @return {[Promise]}          [promise object]
 */
function getWeiboData (city) {
    return getData('http://202.114.123.53/zx/weibo/getWeiboData.php?city='+city);
}

/**
 * get the weibo-text-cluster-map
 * @param  {[Array]} data     [weibo-data:[{text:..,geo:..},{}]]
 * @param  {[Object]} map      [leaflet map object]
 * @param  {[Array]} idfArray [idf-data]
 * @return {[null]}          [null]
 */
function getWeiboTextCluster(data,map,idfData){
    // process the idf-data
    var split_array=idfData.split("\n");
    var idfArray=[];
    for(var i=0;i<split_array.length;i++){
        let item=split_array[i].split(" ");
        idfArray[item[0]]=parseInt(item[1]);
    }

    if(typeof data === 'string'){
        data=JSON.parse(data);
    }
	
    //get the MarkerClusterGroup
    var markers = new L.MarkerClusterGroup({
        showCoverageOnHover: false,
        zoomToBoundsOnClick: false,
        iconCreateFunction: function(cluster) {
            var markers = cluster.getAllChildMarkers();
            var allText = '';
            for(var i=0,length = markers.length;i<length;i++){
                allText += markers[i].options.title;
            }
            var innerTag=wordseg(allText,idfArray);
            var c = ' marker-cluster-';
            if (length < 10) {
                c += 'small';
            } else if (length < 100) {
                c += 'medium';
            } else {
                c += 'large';
            }
            var iconRadius = Math.log(length)*7+30;
            var innerDivWidth = iconRadius*0.8;
            var innerDivMargin = iconRadius*0.1;
            var divString = "<div style='width:"+innerDivWidth+"px;height:"+innerDivWidth+"px;margin-top:"+innerDivMargin+"px;margin-left:"+innerDivMargin+"px;'>";
            divString += "<span style='line-height:"+innerDivWidth+"px;'>" + innerTag + "</span></div>"
            var divOption = {
                html: divString, 
                className: 'marker-cluster' + c, 
                iconSize: new L.Point(iconRadius, iconRadius) 
            }
            return new L.DivIcon(divOption);
        }
    });
    
    //add marker to markers
	for(var x in data){
		let item=data[x];
		var lat=item.geo.coordinates[0];
		var lon=item.geo.coordinates[1];
   		var re=/\[.*\]/g;

   		var text=item.text.replace(re,"");
   		var http_index=text.indexOf("http://");
   		if(http_index!=-1){
   			text=text.substr(0,http_index);
   		}
   		text=text.replace("分享图片","");
		var latlng = new L.LatLng(lat,lon);
        var marker = L.marker(latlng, {
            icon: L.mapbox.marker.icon({'marker-symbol': 'post', 'marker-color': '0044FF'}),
            title:text
        });
        markers.addLayer(marker);

	}
    //bind the tooltip to MarkerClusterGroup
    markers.on("clustermouseover",showWeiboDetail);

    map.addLayer(markers);
    //hide the tooltip when mouse out the cluster or container
    map.on("mouseover",function(e){
        $("#tooltip").hide();
    });
    map.on("mouseout",function(e){
       $("#tooltip").hide();
    });
}
/**
 * show the tooltip of cluster
 * @param  {[Object]} e [mouse event]
 * @return {[null]}   [null]
 */
function showWeiboDetail(e){

	var tooltip = $("#tooltip");
	var tooltip_content = $("#tooltip-content");
    var centerText = e.layer._icon.textContent;
    var map_container = e.target._map._container;
    var point = e.target._map.latLngToContainerPoint(e.latlng);

    //get the current markers of cluster
    var currentMarkers = e.layer.getAllChildMarkers();

	tooltip.css("left",point.x+map_container.offsetLeft);
	tooltip_content.css("width",'200px');
	tooltip.css("width",'205px');
	
    //set the top of tooltip
    if(map_container.clientHeight-point.y<=250){
        tooltip.css("top",point.y-250);
    }else{
        tooltip.css("top",point.y);
    }
	
	tooltip_content.empty();

	var related_weibo_num=0;
	tooltip.show();
    var centerReg = new RegExp(centerText,'g');
    //set the content of tooltip
   	for(var i=0,length = currentMarkers.length;i<length;i++){
   		var marker = currentMarkers[i];
   		var text = marker.options.title;
   		var center_index = text.indexOf(centerText);
   		if(center_index!=-1){
   			related_weibo_num++;
   			text=text.replace(centerReg,"<span class='weibo-center-text'>"+centerText+"</span>")
   			tooltip_content.append("<div class='weibo-text-item'>"+text+"</div>");
   		}
   	}
    var text_item = $('.weibo-text-item:last-child');
    //set the height of tooltip base the content's height
    if(text_item[0].offsetTop>190){
        tooltip.css("height",'245px');
        tooltip_content.css("height",'200px');
    }else{
        tooltip.css("height",'');
        tooltip_content.css("height",'');
    }

   	$("#tooltip-header").html("共" + related_weibo_num + "条相关微博");

}

var wordsAndValue = [];
var wordsOnly = [];
var valueOnly = [];


/**
 * word segment
 * @param  {[String]} allText  [words]
 * @param  {[Array]} idfArray [idf-data ]
 * @return {[Array]}          [[{key:value},...]]
 */
function wordseg(allText,idfArray){
	
    //loaddic();
    var list = [];
    var list1 = [];
    var list2 = [];
    var text = allText;
    var stopWords = ['的', '是', '我', ',','自己','哈哈','今天','北京',
          '啊', '你', '也', '为', '每','人', '着','个', '说', '们', '在','再','它','若','没','有','想', '她', '都', '不', '分','享','客','户','一', '那', '这', '呀', '吧', '些', '很','啦','了','吗','得','怎','什','么','多','少'];
    //console.log(stopWords);
    if (!Array.prototype.forEach) {
        Array.prototype.forEach = function (callback, thisArg) {
            var T, k;
            if (this === null) {
                throw new TypeError(" this is null or not defined");
            }
            var O = Object(this);
            var len = O.length >>> 0; // Hack to convert O.length to a UInt32  
            if ({}.toString.call(callback) != "[object Function]") {
                throw new TypeError(callback + " is not a function");
            }
            if (thisArg) {
                T = thisArg;
            }
            k = 0;
            while (k < len) {
                var kValue;
                if (k in O) {
                    kValue = O[k];
                    callback.call(T, kValue, k, O);
                }
                k++;
            }
        };
    }

    var terms = Object.create(null);
    //console.log(text);
    //segment
    var regexp = /[^\u4E00-\u9FFF\u3400-\u4DBF]+/g;
    text = text.replace(regexp, '\n');
    //console.log(text);
    
    stopWords.forEach(function (stopWord) {
        if (!(/^[\u4E00-\u9FFF\u3400-\u4DBF]+$/).test(stopWord))
            return;
        text = text.replace(new RegExp(stopWord, 'g'), 'a');

    });
    text = text.replace(/a+/g,'\n');
    //console.log(text);
    var chunks = text.split(/\n+/);
    var pendingTerms = Object.create(null);
    chunks.forEach(function processChunk(chunk) {
        if (chunk.length <= 1)
            return;
        var substrings = [];
        //console.log(chunk);
        substrings = getAllSubStrings(chunk, 5);
        //console.log(substrings);
        substrings.forEach(function (substr) {
            if (substr.length <= 1)   //fileter the substring
                return;
            if (!(substr in pendingTerms))
                pendingTerms[substr] = 0;     
            pendingTerms[substr]++;            

        });
    });
    for (var term in pendingTerms) {
        if (!(term in terms))
            terms[term] = 0;

        terms[term] += pendingTerms[term];
    }
    pendingTerms = undefined;

    
    for (term in terms) {
        if (terms[term] < 0)
            continue;
        if(idfArray[term]){
        	terms[term]*=idfArray[term];
        }else{
        	
        }   
        list.push([term, terms[term]]);

    }

    list = list.sort(function (a, b) {
        if (a[1] > b[1]) return -1;
        if (a[1] < b[1]) return 1;
        if (a[0] === b[0])
            return 0;
        var t = ([a[0], b[0]]).sort();
        if (t[0] !== a[0]) return 1;
        return -1;
    });

    for (var i = 0; i < list.length; i++)
    {
        list2.push(list[i][0]);
        list1.push(list[i][1]);
    }

    wordsOnly = list2;
    valueOnly = list1;
   
    return wordsOnly[0];
}

/**
 * get the substring
 * @param  {[String]} str       [parent string]
 * @param  {[Int]} maxLength [the max-length of processed the length of string]
 * @return {[String]}           [substring]
 */
function getAllSubStrings(str, maxLength) {
    if (!str.length)
        return [];

    var result = [];
    var i = Math.min(str.length, maxLength);
    do {
        result.push(str.substr(0, i));
    } while (--i);

    if (str.length > 1)
        result = result.concat(getAllSubStrings(str.substr(1), maxLength)); // 迭代

    return result;
}
export { WeiboTextMap, Event3DMap };