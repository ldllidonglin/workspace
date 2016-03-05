
function weiboTextMap(domId){
    var map = initMap(domId);
    $.get("data/idf.txt",function(data){
        var split_array=data.split("\n");
        var idfArray=[];
        for(var i=0;i<split_array.length;i++){
            var item=split_array[i].split(" ");
            idfArray[item[0]]=parseInt(item[1]);
        }
        getWeiboData("北京",map,idfArray);

    });
}

/**
 * 初始化地图
 * @param  {[string]} domId [地图容器dom id]
 * @return {[obj]}       [地图对象]
 */
function initMap(domId){
    L.mapbox.accessToken = 'pk.eyJ1IjoiZG9uZ2xpbmdlIiwiYSI6Ik1VbXI1TkkifQ.7ROsya7Q8kZ-ky9OmhKTvg';
    var map = L.mapbox.map(domId, 'mapbox.light')
        .setView([30.608623,114.274462], 11);
    return map;
}

/**
 * 获取微博数据
 * @param  {[string]} city     [城市名]
 * @param  {[obj]} map      [地图对象]
 * @param  {[string]} idfArray [idf的数组]
 * @return {[null]}          [无]
 */
function getWeiboData (city,map,idfArray) {
    $.get('http://202.114.123.53/zx/weibo/getWeiboData.php',{'city':'武汉'}).then(function(data){
        handleWeiboData(event.target.responseText,map,idfArray);
    });
	
}

/**
 * 获取微博数据 回调函数
 * @param  {[Array]} data     [微博数据:[{text:..,geo:..},{}]]
 * @param  {[Object]} map      [leaflet地图对象]
 * @param  {[Array]} idfArray [idf数据]
 * @return {[null]}          [null]
 */
function handleWeiboData(data,map,idfArray){
	data=JSON.parse(data);
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
		var item=data[x];
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
    //绑定tooltip
    markers.on("clustermouseover",showWeiboDetail);
    markers.on("clustermouseout",hideWeiboDetail)
    map.addLayer(markers);
}



function showWeiboDetail(e){

	var tooltip = $("#tooltip");
	var tooltip_content = $("#tooltip-content");
    var centerText = e.layer._icon.textContent;
    var point = e.target._map.latLngToContainerPoint(e.latlng);

    //获取当前的markers
    var currentMarkers = e.layer.getAllChildMarkers();

	tooltip.css("left",point.x+$("#map")[0].offsetLeft);
	tooltip_content.css("width",'200px');
	tooltip.css("width",'205px');
	
    //如果point在下方，为避免出现tips超出主图区域，故让tips左下角定位在center
    if($("#map").height()-point.y<=250){
        tooltip.css("top",point.y-250);
    }else{
        tooltip.css("top",point.y);
    }
	
	tooltip_content.empty();

	var related_weibo_num=0;
	tooltip.show();
    var centerReg = new RegExp(centerText,'g');
    //填充内容并高亮关键字
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
    //如果内容高度超出范围，设定具体高度出现overflow，否则tips的高度就是内容的实际高度
    if(text_item[0].offsetTop>190){
        tooltip.css("height",'245px');
        tooltip_content.css("height",'200px');
    }else{
        tooltip.css("height",'');
        tooltip_content.css("height",'');
    }

   	$("#tooltip-header").html("共" + related_weibo_num + "条相关微博");

}
function hideWeiboDetail(e){
    $("#tooltip").hide();
}

var wordsAndValue = [];
var wordsOnly = [];
var valueOnly = [];


//实现分词并统计个数
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
    //把中文分开
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
            if (substr.length <= 1)   //不取单个字的词
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
 * 获得字符串的子串
 * @param  {string} str 需要处理的字符串
 * @param  {int} maxLength 一次处理的最长长度
 * @return {array} result 子串组成的数组 
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
export { weiboTextMap };