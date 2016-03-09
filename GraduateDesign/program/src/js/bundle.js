(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _weibovis = require('./weibovis.js');

var _layout = require('./layout.js');

var _taxiVis = require('./taxiVis.js');

var _poivis = require('./poivis.js');

//global varible relate to vistap
var INITOBJ = {
    'textmap': 0,
    'eventmap': 0,
    'poimap': 0,
    'taxichart': 0
};

//weibo-vis dropdown-button initialize
$("#textvis-list").on("click", function (e) {
    switch (event.target.id) {
        case "weibo-text-vis":
            cleanMainWindow();
            if (INITOBJ.textmap) {

                INITOBJ.textmap.show();
            } else {
                var text_map = new _weibovis.WeiboTextMap("weibo-text-map");
                INITOBJ.textmap = text_map;
            }
            break;
        case "weibo-event-vis":
            cleanMainWindow();
            if (INITOBJ.eventmap) {

                INITOBJ.eventmap.show();
            } else {
                var event_map = new _weibovis.Event3DMap("weibo-event-map");
                INITOBJ.eventmap = event_map;
            }

            break;
    }
});

//spatial-vis dropdown-button initialize
$("#spatialvis-list").on("click", function (e) {
    switch (event.target.id) {
        case "poi-vis":
            cleanMainWindow();
            if (INITOBJ.poimap) {
                INITOBJ.poimap.show();
            } else {
                var poi_map = new _poivis.PoiVisMap("poi-vis-map");
                INITOBJ.poimap = poi_map;
            }
            break;
    }
});

//time-vis dropdown-button initialize
$("#timevis-list").on("click", function (e) {
    switch (event.target.id) {
        case "trajectory-vis":
            cleanMainWindow();
            if (INITOBJ.taxichart) {

                INITOBJ.taxichart.show();
            } else {
                var taxichart = new _taxiVis.TaxiVisChart("trajectory-vis-container");
                INITOBJ.taxichart = taxichart;
            }
            break;
    }
});

function cleanMainWindow() {
    for (var name in INITOBJ) {
        if (INITOBJ[name]) {
            INITOBJ[name].hide();
        }
    }
}
//main window initialize
(0, _layout.layoutIni)();

},{"./layout.js":2,"./poivis.js":3,"./taxiVis.js":4,"./weibovis.js":5}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
function layoutIni() {
	var clientHeight = document.body.clientHeight;
	var navHeight = $("nav").height();
	var mainHeight = clientHeight - navHeight - 15;
	$("#main").height(mainHeight);
}

exports.layoutIni = layoutIni;

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PoiVisMap = (function () {
	function PoiVisMap(domId) {
		_classCallCheck(this, PoiVisMap);

		this.domId = domId;
		$("#" + domId).show();
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
			console.log(points.length);
			var heatMap = createHeatMap(heatMapPoint);
			map.addLayer(heatMap);

			var cluster = createCluster(points);
			cluster.on('layerremove', function (e) {
				console.log('heat');
			});

			createClusterLens(cluster, map, 'zoomlens');

			map.on('zoomend', function (e) {
				var current_level = e.target.getZoom();
				console.log(current_level);
				if (current_level <= 12) {
					map.addLayer(heatMap);
					map.removeLayer(cluster);
					$('#zoomlens').hide();
				} else if (current_level > 12 && current_level <= 15) {
					map.removeLayer(heatMap);
					map.addLayer(cluster);
				} else if (current_level > 15) {
					map.removeLayer(heatMap);
					map.removeLayer(cluster);
					$('#zoomlens').hide();
				}
			});
		});
	}

	_createClass(PoiVisMap, [{
		key: "show",
		value: function show() {
			$("#" + this.domId).show();
		}
	}, {
		key: "hide",
		value: function hide() {
			$("#" + this.domId).hide();
		}
	}]);

	return PoiVisMap;
})();

function getJSON(url, param) {
	var promise = new Promise(function (resolve, reject) {
		var client = new XMLHttpRequest();
		client.open("GET", url);
		client.onreadystatechange = handler;
		client.responseType = "json";
		client.setRequestHeader("Accept", "application/json");
		client.send(param);

		function handler() {
			if (this.readyState !== 4) {
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
 * initialize the map
 * @param  {[String]} domId [id of map's container]
 * @return {[Object]}       [map]
 */
function initMap(domId) {
	L.mapbox.accessToken = 'pk.eyJ1IjoiZG9uZ2xpbmdlIiwiYSI6Ik1VbXI1TkkifQ.7ROsya7Q8kZ-ky9OmhKTvg';
	var map = L.mapbox.map(domId, 'mapbox.light').setView([30.608623, 114.274462], 11);
	return map;
}

/**
 * create ClusterGroup
 * @param  {[Array]} data [like [[lat1,lon1],[lat2,lon2],...]  ]
 * @return {[Object]}      [MarkerClusterGroup]
 */
function createCluster(data) {
	var markers = new L.MarkerClusterGroup({
		showCoverageOnHover: false,
		zoomToBoundsOnClick: false
	});
	for (var i = 0, length = data.length; i < length; i++) {
		var latlng = new L.LatLng(data[i][0], data[i][1]);
		var marker = L.marker(latlng, {
			icon: L.mapbox.marker.icon({ 'marker-symbol': 'post', 'marker-color': '0044FF' })
		});
		markers.addLayer(marker);
	}

	return markers;
}

/**
 * 创建cluster的lens
 * @param  {Object} cluster  [the cluster Object]
 * @param  {Object} map      [map object]
 * @param  {String} lendomId [lens's container ]
 * @return {null}          [null]
 */
function createClusterLens(cluster, map, lendomId) {
	//初始化zoommap
	var zoommap = L.mapbox.map('zoommap', 'mapbox.streets', {
		fadeAnimation: false,
		zoomControl: false,
		attributionControl: false
	});

	var oldLayer = [];
	var zl = document.getElementById(lendomId);
	cluster.on('clustermouseover', function (e) {

		var point = map.latLngToContainerPoint(e.latlng);
		$(zl).show();
		//获取当前的markers
		var clickMarkers = e.layer.getAllChildMarkers();

		//移除lens中的marker
		for (var m in oldLayer) {
			var old_marker = oldLayer[m];
			zoommap.removeLayer(old_marker);
		}
		oldLayer = [];
		//把当前的marker加入lens、oldLayer以备删除
		for (var i in clickMarkers) {
			var marker = clickMarkers[i];
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

	cluster.on('clusterlayerremove', function (e) {
		console.log(e);
	});
	// var originRemove = cluster.onRemove;
	// cluster.onRemove=function(){
	// 	originRemove();
	// 	console.log('3');
	// }
}
/**
 * create HeatMap
 * @param  {Array} data [like [[lat,lon,value],[lat,lon,value],...] ]
 * @return {[Object]}      [heatLayer]
 */
function createHeatMap(data) {
	var gradient = {
		0.5: '#c7f127',
		0.55: '#daf127',
		0.6: '#f3f73b',
		0.7: '#FBEF0E',
		0.8: '#FFD700',
		0.98: '#f48e1a',
		1: 'red'
	};
	var heat = L.heatLayer(data, { radius: 15, gradient: gradient });
	return heat;
}

exports.PoiVisMap = PoiVisMap;

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var getCharts = (function () {
	var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(domId) {
		var container, rowdiv, passChartDom, flowChartDom, flowChart, passChart, wuhan_map, wuhan_od, result_data;
		return regeneratorRuntime.wrap(function _callee$(_context) {
			while (1) {
				switch (_context.prev = _context.next) {
					case 0:
						container = document.getElementById(domId);
						rowdiv = document.createElement("div");

						rowdiv.className = 'row';
						//Initialize
						passChartDom = document.createElement('div');

						passChartDom.style.width = '500px';
						passChartDom.style.height = '600px';
						passChartDom.id = 'taxi-pass-chart';
						passChartDom.className = 'col s4';
						rowdiv.appendChild(passChartDom);

						flowChartDom = document.createElement('div');

						flowChartDom.style.width = '500px';
						flowChartDom.style.height = '600px';
						flowChartDom.id = 'taxi-flow-chart';
						flowChartDom.className = 'col s4';
						rowdiv.appendChild(flowChartDom);
						container.appendChild(rowdiv);

						flowChart = echarts.getInstanceByDom(flowChartDom);

						if (!flowChart) {
							flowChart = echarts.init(flowChartDom);
						}
						flowChart.showLoading();

						passChart = echarts.getInstanceByDom(passChartDom);

						if (!passChart) {
							passChart = echarts.init(passChartDom);
						}
						passChart.showLoading();
						//get geojson of wuhan
						_context.next = 24;
						return getGeojson("武汉市");

					case 24:
						wuhan_map = _context.sent;

						echarts.registerMap('wuhan', wuhan_map);
						//get od-data of wuhan
						_context.next = 28;
						return getODData();

					case 28:
						wuhan_od = _context.sent;
						result_data = processODData(wuhan_od);

						//get Flowchart

						taxiFlowChart(flowChart, result_data['limes'], result_data['points']);

						//get PassOutChart
						taxiPassOutChart(passChart, result_data['in'], result_data['out'], flowChart);
						return _context.abrupt('return', { 'flowChart': flowChart, 'passChart': passChart });

					case 33:
					case 'end':
						return _context.stop();
				}
			}
		}, _callee, this);
	}));

	return function getCharts(_x) {
		return ref.apply(this, arguments);
	};
})();

var getChartByTime = (function () {
	var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(timestamp) {
		var wuhan_od, result_data, flowChart, passChart;
		return regeneratorRuntime.wrap(function _callee2$(_context2) {
			while (1) {
				switch (_context2.prev = _context2.next) {
					case 0:
						_context2.next = 2;
						return getODData(timestamp);

					case 2:
						wuhan_od = _context2.sent;
						result_data = processODData(wuhan_od);

						console.log(result_data);

						flowChart = echarts.getInstanceByDom(document.getElementById("taxi-flow-chart"));
						passChart = echarts.getInstanceByDom(document.getElementById("taxi-pass-chart"));
						//get Flowchart

						flowChart = taxiFlowChart(flowChart, result_data['limes'], result_data['points']);

						//get PassOutChart

						passChart = taxiPassOutChart(passChart, result_data['in'], result_data['out'], flowChart);

					case 9:
					case 'end':
						return _context2.stop();
				}
			}
		}, _callee2, this);
	}));

	return function getChartByTime(_x2) {
		return ref.apply(this, arguments);
	};
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TaxiVisChart = (function () {
	function TaxiVisChart(domId) {
		_classCallCheck(this, TaxiVisChart);

		this.domId = domId;
		$("#" + domId).show();
		var picker = $('.datepicker').pickadate({
			format: 'yyyy-mm-dd',
			selectMonths: true, // Creates a dropdown to control month
			selectYears: 15, // Creates a dropdown of 15 years to control year
			onClose: function onClose() {
				var select_value = this.get('select');

				getChartByTime(select_value.pick / 1000);
			}
		});

		picker.pickadate('picker').set('select', new Date(2014, 0, 1));
		var chartObj = getCharts(domId);
		this.flowChart = chartObj.flowChart;
		this.passChart = chartObj.passChart;
	}

	_createClass(TaxiVisChart, [{
		key: 'show',
		value: function show() {
			$("#" + this.domId).show();
		}
	}, {
		key: 'hide',
		value: function hide() {
			$("#" + this.domId).hide();
		}
	}]);

	return TaxiVisChart;
})();

function getJSON(url) {
	var promise = new Promise(function (resolve, reject) {
		var client = new XMLHttpRequest();
		client.open("GET", url);
		client.onreadystatechange = handler;
		client.responseType = "json";
		client.setRequestHeader("Accept", "application/json");
		client.send();

		function handler() {
			if (this.readyState !== 4) {
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

function getGeojson(city) {
	return getJSON("http://202.114.123.53/zx/taxi/getGeojson.php?city=" + city);
}

function getODData(timestamp) {
	if (timestamp) {
		return getJSON("http://202.114.123.53/zx/taxi/getAllOdDataM.php?timestamp=" + timestamp);
	} else {
		return getJSON("http://202.114.123.53/zx/taxi/getAllOdDataM.php");
	}
}

function processODData(data) {
	var taxi_data = data;

	var draw_data = {};

	//calculate in/out between two district
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
			draw_data[start_point.district][end_point.district] = 1;
		}

		i++;
	}
	data = draw_data;
	var districtLonLat = {
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
	function getDistrictIn(district) {
		var value = 0;
		for (var name in data) {
			if (name != district) {
				for (var inname in data[name]) {
					if (inname === district) {
						value += data[name][district];
					}
				}
			}
		}
		return value;
	}

	var temp_markline_data = {};
	var temp_point_data = {};
	var taxi_region_in = []; //各区域车辆流入数量
	var taxi_region_out = []; //各区域车辆流出数量
	for (var name in data) {
		var temp_lime = [];
		var temp_point = [];
		var item = data[name];

		var out_num = 0;

		for (var name2 in item) {
			if (name2 != name) {
				out_num += item[name2];
				temp_lime.push([{ name: name, coord: districtLonLat[name], value: item[name2] }, { name: name2, coord: districtLonLat[name2], value: item[name2] }]);
				temp_point.push({ name: name2, value: districtLonLat[name2].concat([item[name2]]) });
			}
		}

		temp_markline_data[name] = temp_lime;
		temp_point_data[name] = temp_point;

		var in_num = getDistrictIn(name);
		taxi_region_in.push(in_num);

		taxi_region_out.push(out_num);
	}
	return {
		"limes": temp_markline_data,
		'points': temp_point_data,
		'in': taxi_region_in,
		'out': taxi_region_out
	};
}

function taxiFlowChart(flowChart, linesData, pointsData) {

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
			data: [],
			textStyle: {
				color: '#fff'
			},
			selectedMode: 'single'
		},
		bmap: {
			center: [114.274462, 30.608623],
			zoom: 11,
			roam: true,
			mapStyle: {
				styleJson: [{
					"featureType": "water",
					"elementType": "all",
					"stylers": {
						"color": "#134f5c"
					}
				}, {
					"featureType": "land",
					"elementType": "all",
					"stylers": {
						"color": "#444444"
					}
				}, {
					"featureType": "boundary",
					"elementType": "geometry",
					"stylers": {
						"color": "#064f85"
					}
				}, {
					"featureType": "railway",
					"elementType": "all",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "highway",
					"elementType": "geometry",
					"stylers": {
						"color": "#3d85c6",
						"lightness": -53
					}
				}, {
					"featureType": "highway",
					"elementType": "geometry.fill",
					"stylers": {
						"color": "#76a5af"
					}
				}, {
					"featureType": "highway",
					"elementType": "labels",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "arterial",
					"elementType": "geometry",
					"stylers": {
						"color": "#33707d"
					}
				}, {
					"featureType": "arterial",
					"elementType": "geometry.fill",
					"stylers": {
						"color": "#45818e",
						"lightness": -56
					}
				}, {
					"featureType": "poi",
					"elementType": "all",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "green",
					"elementType": "all",
					"stylers": {
						"color": "#056197",
						"visibility": "off"
					}
				}, {
					"featureType": "subway",
					"elementType": "all",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "manmade",
					"elementType": "all",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "local",
					"elementType": "all",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "arterial",
					"elementType": "labels",
					"stylers": {
						"visibility": "off"
					}
				}, {
					"featureType": "boundary",
					"elementType": "geometry.fill",
					"stylers": {
						"color": "#029fd4"
					}
				}, {
					"featureType": "building",
					"elementType": "all",
					"stylers": {
						"color": "#1a5787"
					}
				}, {
					"featureType": "label",
					"elementType": "all",
					"stylers": {
						"visibility": "off"
					}
				}]
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
	for (var name in linesData) {
		option.legend.data.push(name);
		var temp_markline_data = linesData[name];
		var temp_point_data = pointsData[name];
		series.push({
			name: name,
			type: 'lines',
			coordinateSystem: 'bmap',
			effect: {
				show: true,
				period: 6,
				trailLength: 0,
				symbol: 'arrow',
				symbolSize: 15
			},
			lineStyle: {
				normal: {
					width: 1,
					opacity: 0.4,
					curveness: 0.2
				}
			},
			data: temp_markline_data
		}, {
			name: name,
			type: 'lines',
			coordinateSystem: 'bmap',
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
					width: 1,
					curveness: 0.2
				}
			},
			data: temp_markline_data
		}, {
			name: name,
			type: 'effectScatter',
			coordinateSystem: 'bmap',
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
	flowChart.setOption(option);
	console.log(option);
	flowChart.hideLoading();
	return flowChart;
}

function taxiPassOutChart(passChart, inData, outData, flowChart) {
	var option = {
		title: {
			text: '武汉各区出租车流入流出',
			subtext: '',
			left: 'left',
			bottom: '15%',
			textStyle: {
				color: '#070716'
			}
		},
		tooltip: {
			trigger: 'axis',
			axisPointer: { // 坐标轴指示器，坐标轴触发有效
				type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
			}
		},
		legend: {
			left: 'right',
			data: ['流入', '流出']
		},
		grid: {
			left: '3%',
			right: '4%',
			bottom: '3%',
			containLabel: true
		},
		xAxis: [{
			type: 'category',
			data: []
		}],
		yAxis: [{
			type: 'value'
		}],
		series: []
	};
	option.series.push({
		name: '流入',
		type: 'bar',
		stack: '流动',
		data: inData
	}, {
		name: '流出',
		type: 'bar',
		stack: '流动',
		data: outData
	});
	var flowOption = flowChart.getOption();
	option.xAxis[0].data = flowChart.getOption().legend[0].data;

	passChart.setOption(option);

	passChart.on("click", function (e) {
		flowChart.dispatchAction({
			'type': 'legendSelect',
			'name': e.name
		});
	});
	passChart.hideLoading();
}
// var districtLonLat = {
// 	"海淀区":[116.299059,39.966493],
// 	"朝阳区":[116.479583,39.963396],
// 	"东城区":[116.419217,39.937289],
// 	"丰台区":[116.29101,39.86511],
// 	"通州区":[116.661831,39.917813],
// 	"石景山区":[116.22317,39.9125],
// 	"门头沟区":[116.107037,39.948353],
// 	"西城区":[116.369199,39.918698],
// 	"房山区":[116.147856,39.754701],
// 	"大兴区":[116.147856,39.754701],
// 	"昌平区":[116.237831,40.227662],
// 	"顺义区":[116.659819,40.136379],
// 	"怀柔区":[116.637972,40.322782]
// };

exports.TaxiVisChart = TaxiVisChart;

},{}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var initWeiboTextMap = (function () {
    var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(map) {
        var IDF, weibo_data;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return getIdfData();

                    case 2:
                        IDF = _context.sent;
                        _context.next = 5;
                        return getWeiboData("武汉");

                    case 5:
                        weibo_data = _context.sent;

                        getWeiboTextCluster(weibo_data, map, IDF);

                    case 7:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function initWeiboTextMap(_x) {
        return ref.apply(this, arguments);
    };
})();

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WeiboTextMap = (function () {
    function WeiboTextMap(domId) {
        _classCallCheck(this, WeiboTextMap);

        this.domId = domId;
        $("#" + domId).show();
        var map = initMap(domId);
        initWeiboTextMap(map);
    }

    _createClass(WeiboTextMap, [{
        key: "show",
        value: function show() {
            $("#" + this.domId).show();
        }
    }, {
        key: "hide",
        value: function hide() {
            $("#" + this.domId).hide();
        }
    }]);

    return WeiboTextMap;
})();

function getData(url) {
    var promise = new Promise(function (resolve, reject) {
        var client = new XMLHttpRequest();
        client.open("GET", url);
        client.onreadystatechange = handler;
        client.send();

        function handler() {
            if (this.readyState !== 4) {
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

function getIdfData() {
    return getData("data/idf.txt");
}
/**
 * map initialize
 * @param  {[string]} domId [map container dom id]
 * @return {[obj]}       [map object]
 */
function initMap(domId) {
    L.mapbox.accessToken = 'pk.eyJ1IjoiZG9uZ2xpbmdlIiwiYSI6Ik1VbXI1TkkifQ.7ROsya7Q8kZ-ky9OmhKTvg';
    var layer = L.mapbox.tileLayer('mapbox.streets');
    var layer_satelite = L.mapbox.tileLayer('mapbox.streets-satellite');
    var map = L.mapbox.map(domId).setView([30.608623, 114.274462], 11).addLayer(layer);

    return map;
}

var Event3DMap = (function () {
    function Event3DMap(domId) {
        _classCallCheck(this, Event3DMap);

        this.domId = domId;
        $("#" + domId).show();
        var container = document.getElementById(domId);
        var globe = new DAT.Globe(container);
        $.get("http://202.114.123.53/zx/aqi/getAQICityList.php").then(function (data) {
            data = JSON.parse(data);
            var mapdata = [];
            mapdata['1990'] = [];
            for (var i in data) {
                var city = data[i];
                mapdata['1990'].push(city.lat);
                mapdata['1990'].push(city.lon);
                mapdata['1990'].push(Math.random() - 0.6);
            }
            globe.addData(mapdata['1990'], { format: 'magnitude', name: '1990' });
            // Create the geometry
            globe.createPoints();
            // Begin animation
            globe.animate();
        });
    }

    _createClass(Event3DMap, [{
        key: "hide",
        value: function hide() {
            $("#" + this.domId).hide();
        }
    }, {
        key: "show",
        value: function show() {
            $("#" + this.domId).show();
        }
    }]);

    return Event3DMap;
})();

/**
 * 获取微博数据
 * @param  {[string]} city     [城市名]
 * @param  {[obj]} map      [地图对象]
 * @param  {[string]} idfArray [idf的数组]
 * @return {[null]}          [无]
 */

function getWeiboData(city) {
    return getData('http://202.114.123.53/zx/weibo/getWeiboData.php?city=' + city);
}

/**
 * 获取微博数据 回调函数
 * @param  {[Array]} data     [微博数据:[{text:..,geo:..},{}]]
 * @param  {[Object]} map      [leaflet地图对象]
 * @param  {[Array]} idfArray [idf数据]
 * @return {[null]}          [null]
 */
function getWeiboTextCluster(data, map, idfData) {
    // process the idf-data
    var split_array = idfData.split("\n");
    var idfArray = [];
    console.log(typeof data === "undefined" ? "undefined" : _typeof(data));
    for (var i = 0; i < split_array.length; i++) {
        var item = split_array[i].split(" ");
        idfArray[item[0]] = parseInt(item[1]);
    }

    if (typeof data === 'string') {
        data = JSON.parse(data);
    }

    //get the MarkerClusterGroup
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

    //add marker to markers
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
    //bind the tooltip to MarkerClusterGroup
    markers.on("clustermouseover", showWeiboDetail);

    map.addLayer(markers);
    //hide the tooltip when mouse out the cluster or container
    map.on("mouseover", function (e) {
        $("#tooltip").hide();
    });
    map.on("mouseout", function (e) {
        $("#tooltip").hide();
    });
}

function showWeiboDetail(e) {

    var tooltip = $("#tooltip");
    var tooltip_content = $("#tooltip-content");
    var centerText = e.layer._icon.textContent;
    var map_container = e.target._map._container;
    var point = e.target._map.latLngToContainerPoint(e.latlng);

    //获取当前的markers
    var currentMarkers = e.layer.getAllChildMarkers();

    tooltip.css("left", point.x + map_container.offsetLeft);
    tooltip_content.css("width", '200px');
    tooltip.css("width", '205px');

    //如果point在下方，为避免出现tips超出主图区域，故让tips左下角定位在center
    if (map_container.clientHeight - point.y <= 250) {
        tooltip.css("top", point.y - 250);
    } else {
        tooltip.css("top", point.y);
    }

    tooltip_content.empty();

    var related_weibo_num = 0;
    tooltip.show();
    var centerReg = new RegExp(centerText, 'g');
    //填充内容并高亮关键字
    for (var i = 0, length = currentMarkers.length; i < length; i++) {
        var marker = currentMarkers[i];
        var text = marker.options.title;
        var center_index = text.indexOf(centerText);
        if (center_index != -1) {
            related_weibo_num++;
            text = text.replace(centerReg, "<span class='weibo-center-text'>" + centerText + "</span>");
            tooltip_content.append("<div class='weibo-text-item'>" + text + "</div>");
        }
    }
    var text_item = $('.weibo-text-item:last-child');
    //如果内容高度超出范围，设定具体高度出现overflow，否则tips的高度就是内容的实际高度
    if (text_item[0].offsetTop > 190) {
        tooltip.css("height", '245px');
        tooltip_content.css("height", '200px');
    } else {
        tooltip.css("height", '');
        tooltip_content.css("height", '');
    }

    $("#tooltip-header").html("共" + related_weibo_num + "条相关微博");
}

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
exports.WeiboTextMap = WeiboTextMap;
exports.Event3DMap = Event3DMap;

},{}]},{},[1]);

//# sourceMappingURL=bundle.js.map
