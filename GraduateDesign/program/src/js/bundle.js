(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _weibovis = require('./weibovis.js');

var _layout = require('./layout.js');

var _verticalTab = require('./vertical-tab.js');

var _taxiVis = require('./taxiVis.js');

var _poivis = require('./poivis.js');

var iniObj = {
    'weibo': 0,
    'poi': 0,
    'taxi': 0
};

(0, _weibovis.weiboTextMap)("map");
iniObj.weibo = 1;

/**
 * 左侧栏响应函数
 * @param  {[obj]} event [事件]
 * @return {[null]}       [null]
 */
function toolTapClick(event) {
    switch (event.target.id) {
        case "weibo-vis":
            if (!iniObj.weibo) {
                (0, _weibovis.weiboTextMap)("map");
                iniObj.weibo = 1;
            }
            break;
        case "poi-vis":
            if (!iniObj.poi) {
                (0, _poivis.poiVisMap)('bdmap');
                iniObj.poi = 1;
            }
            break;
        case "taxi-vis":
            if (!iniObj.taxi) {
                (0, _taxiVis.taxiVisChart)('bdmap-t');
                iniObj.taxi = 1;
            }
            break;
    }
}
//初始化左侧栏
(0, _verticalTab.verticalTap)("tool-container", toolTapClick);
//初始化主窗口布局
(0, _layout.layoutIni)();

//初始化主图
// var source=new ol.source.OSM();
// var baseLayer=new ol.layer.Tile({
//     source:source
// });
// var attribution = new ol.control.Attribution({
//     collapsible: false
//   });
// var ol_map=new ol.Map({
//     layers:[baseLayer],
//     target: 'map',
//     controls: ol.control.defaults({ attribution: false }).extend([attribution]),
//     view: new ol.View({
//       center: ol.proj.fromLonLat([116.5, 39.92]),
//       zoom: 10
//     })
//  });

},{"./layout.js":2,"./poivis.js":3,"./taxiVis.js":4,"./vertical-tab.js":5,"./weibovis.js":6}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
function layoutIni() {
	var clientHeight = document.body.clientHeight;
	var headerHeight = $("header").height();
	var mainHeight = clientHeight - headerHeight - 15;
	$("#main").height(mainHeight);
}

exports.layoutIni = layoutIni;

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
function poiVisMap(domId) {
	var map = initMap(domId);
	$.get("http://202.114.123.53/zx/weibo/getWeiboData.php", { 'city': '武汉' }).then(function (data) {
		data = JSON.parse(data);
		var points = [];
		var heatMapPoint = [];
		for (var x in data) {
			var item = data[x];
			var lat = item.geo.coordinates[0];
			var lon = item.geo.coordinates[1];
			points.push([lat, lon]);
			heatMapPoint.push([lat, lon, 100.0]);
		}

		var heatMap = createHeatMap(heatMapPoint);
		map.addLayer(heatMap);

		var cluster = createCluster(points);

		createClusterLens(cluster, map, 'zoomlens');

		map.on('zoomend', function (e) {
			var current_level = e.target.getZoom();
			console.log(current_level);
			if (current_level <= 12) {
				map.addLayer(heatMap);
				map.removeLayer(cluster);
			} else if (current_level > 12) {
				map.removeLayer(heatMap);
				map.addLayer(cluster);
			} else if (current_level > 15) {
				map.removeLayer(heatMap);
				map.removeLayer(cluster);
			}
		});
	});
}

/**
 * 初始化地图
 * @param  {[string]} domId [地图容器dom id]
 * @return {[obj]}       [地图对象]
 */
function initMap(domId) {
	L.mapbox.accessToken = 'pk.eyJ1IjoiZG9uZ2xpbmdlIiwiYSI6Ik1VbXI1TkkifQ.7ROsya7Q8kZ-ky9OmhKTvg';
	var map = L.mapbox.map(domId, 'mapbox.light').setView([30.608623, 114.274462], 11);
	return map;
}

function createCluster(data) {
	var markers = new L.MarkerClusterGroup({
		showCoverageOnHover: false,
		zoomToBoundsOnClick: false,
		iconCreateFunction: function iconCreateFunction(cluster) {
			console.log(cluster.getAllChildMarkers());
			return L.divIcon({ html: '<b>' + 11 + '</b>' });
		}
	});
	for (var i = 0, length = data.length; i < length; i++) {
		var latlng = new L.LatLng(data[i][0], data[i][1]);
		var marker = L.marker(latlng, {
			icon: L.mapbox.marker.icon({ 'marker-symbol': 'post', 'marker-color': '0044FF' }),
			title: '1'
		});
		markers.addLayer(marker);
	}

	return markers;
}

/**
 * 创建cluster的lens
 * @param  {MarkerClusterGroup} cluster  [需要创建lens的MarkerClusterGroup]
 * @param  {L.Map} map      [主图的map对象]
 * @param  {string} lendomId [lens的domId]
 * @return {null}          [description]
 */
function createClusterLens(cluster, map, lendomId) {
	//初始化zoommap
	var zoommap = L.mapbox.map('zoommap', 'mapbox.streets', {
		fadeAnimation: false,
		zoomControl: false,
		attributionControl: false
	});

	var oldLayer = [];;
	var zl = document.getElementById(lendomId);
	cluster.on('clustermouseover', function (e) {

		var point = map.latLngToContainerPoint(e.latlng);

		//获取当前的markers
		var clickMarkers = e.layer.getAllChildMarkers();
		//移除lens中的marker
		for (var m in oldLayer) {
			var marker = oldLayer[m];
			zoommap.removeLayer(marker);
		}
		oldLayer = [];
		//把当前的marker加入lens、oldLayer以备删除
		for (var m in clickMarkers) {
			var marker = clickMarkers[m];
			var latlng = marker._latlng;
			var zoomMarker = L.marker(latlng, {
				icon: L.mapbox.marker.icon({ 'marker-symbol': 'post', 'marker-color': '0044FF' })
			});
			zoomMarker.addTo(zoommap);
			oldLayer.push(zoomMarker);
		}
		//移动lens
		zl.style.top = point.y - 100 + 'px';
		zl.style.left = point.x - 100 + 'px';
		//设置zoommap的显示区域
		zoommap.setView(e.latlng, map.getZoom() + 1, true);
	});
}

function createHeatMap(data) {
	var heat = L.heatLayer(data, { radius: 25 });
	return heat;
}
exports.poiVisMap = poiVisMap;

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
function taxiVisChart(domId) {
	var myChart = echarts.init(document.getElementById(domId));
	myChart.showLoading();
	$.get("http://202.114.123.53/zx/taxi/getGeojson.php", { 'city': '武汉市' }).then(function (data) {

		//注册map
		echarts.registerMap('wuhan', JSON.parse(data));

		$.get("http://202.114.123.53/zx/taxi/getAllOdDataM.php").then(function (data) {
			var taxi_data = JSON.parse(data);

			var draw_data = {};

			//统计轨迹
			for (var i = 0, length = taxi_data.length; i < length; i++) {
				var start_point = taxi_data[i];

				if (start_point.state !== 0) {
					continue;
				}

				if (i >= length - 1) {
					break;
				}
				var end_point = taxi_data[i + 1];
				if (start_point.district === '' || end_point.district === '') {
					continue;
				}
				if (draw_data[start_point.district]) {
					if (draw_data[start_point.district][end_point.district]) {
						draw_data[start_point.district][end_point.district] += 1;
					} else {
						draw_data[start_point.district][end_point.district] = 1;
					}
				} else {
					draw_data[start_point.district] = {};
				}

				i++;
			}
			console.log(draw_data);
			taxiEchartsMap(draw_data, myChart);
		});
	});
}

function taxiEchartsMap(data, myChart) {
	var districtLonLat = {
		"海淀区": [116.299059, 39.966493],
		"朝阳区": [116.479583, 39.963396],
		"东城区": [116.419217, 39.937289],
		"丰台区": [116.29101, 39.86511],
		"通州区": [116.661831, 39.917813],
		"石景山区": [116.22317, 39.9125],
		"门头沟区": [116.107037, 39.948353],
		"西城区": [116.369199, 39.918698],
		"房山区": [116.147856, 39.754701],
		"大兴区": [116.147856, 39.754701],
		"昌平区": [116.237831, 40.227662],
		"顺义区": [116.659819, 40.136379],
		"怀柔区": [116.637972, 40.322782]
	};
	districtLonLat = {
		"江汉区": [114.274462, 30.608623],
		"武昌区": [114.320455, 30.56087],
		"青山区": [114.39275, 30.630875],
		"江岸区": [114.311256, 30.606385],
		"洪山区": [114.349919, 30.506497],
		"汉阳区": [114.221569, 30.56286],
		"东西湖区": [114.140794, 30.627519],
		"硚口区": [114.219557, 30.58848],
		"蔡甸区": [114.03271, 30.589226],
		"黄陂区": [114.375934, 30.889686],
		"江夏区": [114.329941, 30.381085],
		"新洲区": [114.807983, 30.848025],
		"汉南区": [114.193972, 30.479202]
	};
	var option = {
		backgroundColor: '#404a59',
		title: {
			text: '武汉各区之间出租车流动图',
			subtext: '',
			left: 'center',
			textStyle: {
				color: '#fff'
			}
		},
		tooltip: {
			trigger: 'item',
			formatter: function formatter(v) {
				return v.data[0].name + " > " + v.data[1].name;
			}
		},
		legend: {
			orient: 'vertical',
			top: 'bottom',
			left: 'right',
			data: ['洪山区'],
			textStyle: {
				color: '#fff'
			},
			selectedMode: 'single'
		},
		geo: {
			map: 'wuhan',
			label: {
				emphasis: {
					show: false
				}
			},
			roam: true,
			itemStyle: {
				normal: {
					areaColor: '#323c48',
					borderColor: '#404a59'
				},
				emphasis: {
					areaColor: '#2a333d'
				}
			}
		},
		visualMap: [{
			type: 'continuous',
			min: 0,
			max: 50,
			text: ['High', 'Low'],
			realtime: true,
			calculable: true,
			color: ['orangered', 'yellow', 'lightskyblue']
		}],
		series: []
	};
	var series = [];
	var planePath = 'path://M1705.06,1318.313v-89.254l-319.9-221.799l0.073-208.063c0.521-84.662-26.629-121.796-63.961-121.491c-37.332-0.305-64.482,36.829-63.961,121.491l0.073,208.063l-319.9,221.799v89.254l330.343-157.288l12.238,241.308l-134.449,92.931l0.531,42.034l175.125-42.917l175.125,42.917l0.531-42.034l-134.449-92.931l12.238-241.308L1705.06,1318.313z';
	for (var n in data) {
		option.legend.data.push(n);
		var item = data[n];
		var temp_markline_data = [];
		var temp_point_data = [];
		for (var v in item) {
			if (v != n) {
				temp_markline_data.push([{ name: n, coord: districtLonLat[n], value: item[v] }, { name: v, coord: districtLonLat[v], value: item[v] }]);
				temp_point_data.push({ name: v, value: districtLonLat[v].concat([item[v]]) });
			}
		}
		series.push({
			name: n,
			type: 'lines',
			effect: {
				show: true,
				period: 6,
				trailLength: 0,
				symbol: 'arrow',
				symbolSize: 15
			},
			lineStyle: {
				normal: {
					color: '#a6c84c',
					width: 1,
					opacity: 0.4,
					curveness: 0.2
				}
			},
			data: temp_markline_data
		}, {
			name: n,
			type: 'lines',
			zlevel: 1,
			effect: {
				show: true,
				period: 6,
				trailLength: 0.7,
				color: '#fff',
				symbolSize: 3
			},
			lineStyle: {
				normal: {
					color: '#a6c84c',
					width: 0,
					curveness: 0.2
				}
			},
			data: temp_markline_data
		}, {
			name: n,
			type: 'effectScatter',
			coordinateSystem: 'geo',
			zlevel: 2,
			rippleEffect: {
				brushType: 'stroke'
			},
			label: {
				normal: {
					show: true,
					position: 'right',
					formatter: '{b}'
				}
			},
			symbolSize: function symbolSize(val) {
				var size = Math.log(val[2]) * 3;
				return size;
			},
			itemStyle: {
				normal: {
					color: '#a6c84c'
				}
			},
			data: temp_point_data
		});
	}
	option.series = series;
	myChart.setOption(option);
	myChart.hideLoading();
}

exports.taxiVisChart = taxiVisChart;

},{}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
/*
* 垂直滚动标签
@param domId 需要初始化成verticalTap的domId
*/
function verticalTap(domId, fn) {
	//先初始化show or hide
	var activeObj; //当前选中tab
	var items = $("#" + domId).find("> .tool-item");
	items.each(function (index, elem) {
		var constolId = $(elem).attr('data-control');
		if ($(elem).hasClass("active")) {
			$("#" + constolId).show();
			activeObj = $(elem);
		} else {
			$("#" + constolId).hide();
		}
	});

	//如果没有预设active值，则默认第一个是活动tab
	if (!activeObj) {
		var activeItem = items[0];
		activeObj = $(activeItem);
		activeObj.addClass("active");
		var activeId = activeObj.attr("data-control");
		$("#" + activeId).show();
	}

	//点击切换
	$("#" + domId).on("click", function (event) {

		var currentObj = $(event.target);
		if (!currentObj.attr("data-control")) {
			return;
		}
		if (currentObj.hasClass("active")) {
			return;
		}

		//被点击项拉到中间
		var centerScroolTop = ($("#" + domId).height() - currentObj.height()) / 2;
		$("#" + domId).scrollTop(currentObj[0].offsetTop - centerScroolTop);

		//切换操作
		activeObj.removeClass('active');
		$("#" + activeObj.attr("data-control")).hide();

		activeObj = currentObj;
		activeObj.addClass("active");
		var relatedId = activeObj.attr('data-control');
		if (relatedId) {
			$("#" + relatedId).show();
		} else {
			console.log('need data-control attribute');
		}

		//执行绑定的额外的click操作
		fn(event);
	});
}

exports.verticalTap = verticalTap;

},{}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function weiboTextMap(domId) {
    var map = initMap(domId);
    $.get("data/idf.txt", function (data) {
        var split_array = data.split("\n");
        var idfArray = [];
        for (var i = 0; i < split_array.length; i++) {
            var item = split_array[i].split(" ");
            idfArray[item[0]] = parseInt(item[1]);
        }
        getWeiboData("北京", map, idfArray);
    });
}

/**
 * 初始化地图
 * @param  {[string]} domId [地图容器dom id]
 * @return {[obj]}       [地图对象]
 */
function initMap(domId) {
    L.mapbox.accessToken = 'pk.eyJ1IjoiZG9uZ2xpbmdlIiwiYSI6Ik1VbXI1TkkifQ.7ROsya7Q8kZ-ky9OmhKTvg';
    var map = L.mapbox.map(domId, 'mapbox.light').setView([30.608623, 114.274462], 11);
    return map;
}

/**
 * 获取微博数据
 * @param  {[string]} city     [城市名]
 * @param  {[obj]} map      [地图对象]
 * @param  {[string]} idfArray [idf的数组]
 * @return {[null]}          [无]
 */
function getWeiboData(city, map, idfArray) {
    $.get('http://202.114.123.53/zx/weibo/getWeiboData.php', { 'city': '武汉' }).then(function (data) {
        handleWeiboData(event.target.responseText, map, idfArray);
    });
}

/*
* 数据返回回调函数
*/
function handleWeiboData(data, map, idfArray) {
    data = JSON.parse(data);
    var markers = new L.MarkerClusterGroup({
        showCoverageOnHover: false,
        zoomToBoundsOnClick: false,
        iconCreateFunction: function iconCreateFunction(cluster) {
            var markers = cluster.getAllChildMarkers();
            var allText = '';
            for (var i = 0, length = markers.length; i < length; i++) {
                allText += markers[i].options.title;
            }
            var innerTag = wordseg(allText, idfArray);
            var c = ' marker-cluster-';
            if (length < 10) {
                c += 'small';
            } else if (length < 100) {
                c += 'medium';
            } else {
                c += 'large';
            }
            var iconRadius = Math.log(length) * 7 + 30;
            var innerDivWidth = iconRadius * 0.8;
            var innerDivMargin = iconRadius * 0.1;
            var divString = "<div style='width:" + innerDivWidth + "px;height:" + innerDivWidth + "px;margin-top:" + innerDivMargin + "px;margin-left:" + innerDivMargin + "px;'>";
            divString += "<span style='line-height:" + innerDivWidth + "px;'>" + innerTag + "</span></div>";
            var divOption = {
                html: divString,
                className: 'marker-cluster' + c,
                iconSize: new L.Point(iconRadius, iconRadius)
            };
            return new L.DivIcon(divOption);
        }
    });
    for (var x in data) {
        var item = data[x];
        var lat = item.geo.coordinates[0];
        var lon = item.geo.coordinates[1];
        var re = /\[.*\]/g;

        var text = item.text.replace(re, "");
        var http_index = text.indexOf("http://");
        if (http_index != -1) {
            text = text.substr(0, http_index);
        }
        text = text.replace("分享图片", "");
        var latlng = new L.LatLng(lat, lon);
        var marker = L.marker(latlng, {
            icon: L.mapbox.marker.icon({ 'marker-symbol': 'post', 'marker-color': '0044FF' }),
            title: text
        });
        markers.addLayer(marker);
    }
    map.addLayer(markers);
    // var vectorSource=new ol.source.Vector({
    // 	features:features
    // });
    // // var vectorLayer=new ol.layer.Vector({
    // // 	source:vectorSource
    // // });
    // var styleCache = {};
    // var clusterSource=new ol.source.Cluster({
    // 	distance:100,
    // 	source:vectorSource

    // });
    // var clusterLayer=new ol.layer.Vector({
    // 	source:clusterSource,
    // 	style: function(feature, resolution){
    // 		//console.log(feature);
    // 		//console.log(resolution);
    // 		features=feature.get('features')
    // 		var size = features.length;
    // 		var text='';
    // 		for(var i=0;i<size;i++){
    // 			var fe=features[i]
    // 			text+=fe.get('text');
    // 		}
    // 		var innerTag=wordseg(text,idfArray);

    // 		feature.set('name',innerTag,true);
    //            feature.values_.name = innerTag;

    // 		//console.log(size);
    //    		var style = styleCache[size];
    //    		if(!style){
    //    			style = new ol.style.Style({
    // 		      image: new ol.style.Circle({
    // 		        radius: Math.log(size)*4+15,
    // 		        stroke: new ol.style.Stroke({
    // 		          color: '#fff'
    // 		        }),
    // 		        fill: new ol.style.Fill({
    // 		          color: '#3399CC'
    // 		        })
    // 		      }),
    // 		      text: new ol.style.Text({
    // 		        text: innerTag,
    // 		        fill: new ol.style.Fill({
    // 		          color: '#fff'
    // 		        })
    // 		      }),
    // 		      name:innerTag
    // 		    });
    // 		    styleCache[size]=style;
    //    		}
    // 		return style
    // 	}
    // });

    // map.addLayer(clusterLayer);
    // map.on("pointermove",function(event){
    // 	//console.log(event);
    // 	showWeiboDetail(event.pixel,map,idfArray);
    // },map);

    // var weibo_select_inter=new ol.interaction.Select({
    //     condition: function(evt) {
    //     	console.log(evt);
    //       //return evt.originalEvent.type == 'mousemove' ||
    //           evt.type == 'singleclick';
    //     }
    // });
    // map.addInteraction(weibo_select_inter);
}

function createTextCluster(data, idfArray) {
    var markers = new L.MarkerClusterGroup({
        showCoverageOnHover: false,
        zoomToBoundsOnClick: false,
        iconCreateFunction: function iconCreateFunction(cluster) {
            console.log(cluster.getAllChildMarkers());
            var markers = cluster.getAllChildMarkers();
            var allText = '';
            for (var i = 0, length = markers.length; i < length; i++) {
                allText += markers[i].title;
            }
            var innerTag = wordseg(allText, idfArray);
            var c = ' marker-cluster-';
            if (length < 10) {
                c += 'small';
            } else if (length < 100) {
                c += 'medium';
            } else {
                c += 'large';
            }
            return new L.DivIcon({ html: '<div><span>' + innerTag + '</span></div>', className: 'marker-cluster' + c, iconSize: new L.Point(40, 40) });
        }
    });
    for (var i = 0, length = data.length; i < length; i++) {
        var latlng = new L.LatLng(data[i][0], data[i][1]);
        var marker = L.marker(latlng, {
            icon: L.mapbox.marker.icon({ 'marker-symbol': 'post', 'marker-color': '0044FF' }),
            title: data[i][2]
        });
        markers.addLayer(marker);
    }
    return markers;
}

function showWeiboDetail(pixel, map, idfArray) {
    var tooltip = $("#tooltip");
    var tooltip_content = $("#tooltip-content");
    //console.log($("#map")[0].offsetLeft);

    var feature = map.forEachFeatureAtPixel(pixel, function (featureObj, layer) {
        tooltip.css("left", pixel[0] + $("#map")[0].offsetLeft);
        tooltip_content.css("width", '200px');
        tooltip_content.css("height", '200px');
        tooltip.css("width", '205px');
        tooltip.css("height", '245px');
        tooltip.css("top", pixel[1]);
        tooltip_content.empty();
        var centerText = featureObj.get("name");

        var features = featureObj.get("features");
        var allText = '';
        for (var i = 0; i < features.length; i++) {
            feature = features[i];
            var text = feature.get("text");
            allText += text;
        }

        centerText = wordseg(allText, idfArray);
        console.log(featureObj);
        console.log(centerText);

        var related_weibo_num = 0;
        tooltip.show();
        var feature;
        for (var i = 0; i < features.length; i++) {
            feature = features[i];
            var text = feature.get("text");
            var center_index = text.indexOf(centerText);
            var centerReg = new RegExp(centerText, 'g');
            if (center_index != -1) {
                related_weibo_num++;
                text = text.replace(centerReg, "<span class='weibo-center-text'>" + centerText + "</span>");
                tooltip_content.append("<div class='weibo-text-item'>" + text + "</div>");
            }
        }
        $("#tooltip-header").html("共" + related_weibo_num + "条相关微博");
        return feature;
    });
    if (!feature) {
        tooltip.hide();
    }
    //console.log(feature);
}
// function selectStyleFunction(feature, resolution) {
//   var styles = [new ol.style.Style({
//     image: new ol.style.Circle({
//       radius: feature.get('radius'),
//       fill: invisibleFill
//     })
//   })];
//   var originalFeatures = feature.get('features');
//   var originalFeature;
//   for (var i = originalFeatures.length - 1; i >= 0; --i) {
//     originalFeature = originalFeatures[i];
//     styles.push(createEarthquakeStyle(originalFeature));
//   }
//   return styles;
// }

// function createEarthquakeStyle(feature) {
//   // 2012_Earthquakes_Mag5.kml stores the magnitude of each earthquake in a
//   // standards-violating <magnitude> tag in each Placemark.  We extract it
//   // from the Placemark's name instead.
//   var name = feature.get('name');
//   var magnitude = parseFloat(name.substr(2));
//   var radius = 5 + 20 * (magnitude - 5);

//   return new ol.style.Style({
//     geometry: feature.getGeometry(),
//     image: new ol.style.RegularShape({
//       radius1: radius,
//       radius2: 3,
//       points: 5,
//       angle: Math.PI,
//       fill: earthquakeFill,
//       stroke: earthquakeStroke
//     })
//   });
// }

var wordsAndValue = [];
var wordsOnly = [];
var valueOnly = [];

//实现分词并统计个数
function wordseg(allText, idfArray) {

    //loaddic();
    var list = [];
    var list1 = [];
    var list2 = [];
    var text = allText;
    var stopWords = ['的', '是', '我', ',', '自己', '哈哈', '今天', '北京', '啊', '你', '也', '为', '每', '人', '着', '个', '说', '们', '在', '再', '它', '若', '没', '有', '想', '她', '都', '不', '分', '享', '客', '户', '一', '那', '这', '呀', '吧', '些', '很', '啦', '了', '吗', '得', '怎', '什', '么', '多', '少'];
    //console.log(stopWords);
    if (!Array.prototype.forEach) {
        Array.prototype.forEach = function (callback, thisArg) {
            var T, k;
            if (this === null) {
                throw new TypeError(" this is null or not defined");
            }
            var O = Object(this);
            var len = O.length >>> 0; // Hack to convert O.length to a UInt32 
            if (({}).toString.call(callback) != "[object Function]") {
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
        if (!/^[\u4E00-\u9FFF\u3400-\u4DBF]+$/.test(stopWord)) return;
        text = text.replace(new RegExp(stopWord, 'g'), 'a');
    });
    text = text.replace(/a+/g, '\n');
    //console.log(text);
    var chunks = text.split(/\n+/);
    var pendingTerms = Object.create(null);
    chunks.forEach(function processChunk(chunk) {
        if (chunk.length <= 1) return;
        var substrings = [];
        //console.log(chunk);
        substrings = getAllSubStrings(chunk, 5);
        //console.log(substrings);
        substrings.forEach(function (substr) {
            if (substr.length <= 1) //不取单个字的词
                return;
            if (!(substr in pendingTerms)) pendingTerms[substr] = 0;
            pendingTerms[substr]++;
        });
    });
    for (var term in pendingTerms) {
        if (!(term in terms)) terms[term] = 0;

        terms[term] += pendingTerms[term];
    }
    pendingTerms = undefined;

    for (term in terms) {
        if (terms[term] < 0) continue;
        if (idfArray[term]) {
            terms[term] *= idfArray[term];
        } else {}
        list.push([term, terms[term]]);
    }

    list = list.sort(function (a, b) {
        if (a[1] > b[1]) return -1;
        if (a[1] < b[1]) return 1;
        if (a[0] === b[0]) return 0;
        var t = [a[0], b[0]].sort();
        if (t[0] !== a[0]) return 1;
        return -1;
    });

    for (var i = 0; i < list.length; i++) {
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
    if (!str.length) return [];

    var result = [];
    var i = Math.min(str.length, maxLength);
    do {
        result.push(str.substr(0, i));
    } while (--i);

    if (str.length > 1) result = result.concat(getAllSubStrings(str.substr(1), maxLength)); // 迭代

    return result;
}
exports.weiboTextMap = weiboTextMap;

},{}]},{},[1]);

//# sourceMappingURL=bundle.js.map
