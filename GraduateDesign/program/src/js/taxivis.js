/**
 * the class of taxi-vis
 */
class TaxiVisChart {
	constructor(domId){
		this.domId = domId;
		$("#"+domId).show();
		var chartObj = getCharts(domId);
		this.flowChart = chartObj.flowChart;
		this.passChart = chartObj.passChart;
	}
	show(){
        $("#"+this.domId).show();
    }
    hide(){
        $("#"+this.domId).hide();
    }
}
/**
 * get the charts of taxi-vis
 * @param  {[string]} domId [dom's id of container]
 * @return {[objct]}       [flowchart passchart]
 */
async function getCharts(domId){
	var container = document.getElementById(domId);

	var rowdiv = document.createElement("div");
	rowdiv.className = 'row';

	var rowdiv2 = document.createElement("div");
	rowdiv2.className = 'row';

	var rowdiv3 = document.createElement("div");
	rowdiv3.className = 'row';

	//cal-heatmap month
	var cal_heat_dom = document.createElement('div');
	// cal_heat_dom.style.width = '500px';
	// cal_heat_dom.style.height = '600px';
	cal_heat_dom.id = 'cal-heatmap';
	cal_heat_dom.className = 'col s6';
	rowdiv.appendChild(cal_heat_dom);

	//get cal-heat
	getCalHeat(cal_heat_dom);


	//Initialize
	var passChartDom = document.createElement('div');
	// passChartDom.style.width = '500px';
	passChartDom.style.height = '600px';
	passChartDom.id = 'taxi-pass-chart';
	passChartDom.className = 'col s6';
	rowdiv.appendChild(passChartDom);

	var flowChartDom = document.createElement('div');
	flowChartDom.style.height = '600px';
	flowChartDom.id = 'taxi-flow-chart';
	flowChartDom.className = 'col s6';
	rowdiv2.appendChild(flowChartDom);

	var flowChartDom2 = document.createElement('div');
	flowChartDom2.style.height = '600px';
	flowChartDom2.id = 'taxi-flow-chart2';
	flowChartDom2.className = 'col s6';
	rowdiv2.appendChild(flowChartDom2);

	container.appendChild(rowdiv);
	container.appendChild(rowdiv2);
	var heatmapdom = document.createElement('div');
	heatmapdom.style.height = '600px';
	heatmapdom.id = 'heatmap-taxi';
	heatmapdom.className = 'col s12';
	rowdiv3.appendChild(heatmapdom);
	container.appendChild(rowdiv3);

	var flowChart = echarts.getInstanceByDom(flowChartDom);
	if(!flowChart){
		flowChart = echarts.init(flowChartDom);
	}
	flowChart.showLoading();

	var passChart = echarts.getInstanceByDom(passChartDom);
	if(!passChart){
		passChart = echarts.init(passChartDom);
	}
	passChart.showLoading();

	var flowChart2 = echarts.getInstanceByDom(flowChartDom2);
	if(!flowChart2){
		flowChart2 = echarts.init(flowChartDom2);
	}
	flowChart2.showLoading();

	//get od-data of wuhan
	var wuhan_od = await getODData();

	//get day-linechart
	getDayLineMap(wuhan_od);

	var result_data = processODData(wuhan_od);


	//get Flowchart
	taxiFlowChart(flowChart,result_data['lines'],result_data['points']);

	//get Flowchart2
	taxiFlowChart2(flowChart2,result_data['lines2'],result_data['points2']);

	//get PassOutChart
	taxiPassOutChart(passChart,result_data['in'],result_data['out'],flowChart);

	var wuhan_od = await getODData(1389283200);
  getHeatMap(wuhan_od,'heatmap-taxi');


	return { 'flowChart':flowChart,'passChart':passChart }
}

function getHeatMap(data,domId){
	var heatMapPoint=[];
	for(var i=0,length=data.length;i<length;i++){
		var item = data[i];
		var lat=item.geom.coordinates[1];
		var lon=item.geom.coordinates[0];
		heatMapPoint.push([lat,lon,100.0]);
	}
	//get heatmap
	if(!window.taximap){
		L.mapbox.accessToken = 'pk.eyJ1IjoiZG9uZ2xpbmdlIiwiYSI6Ik1VbXI1TkkifQ.7ROsya7Q8kZ-ky9OmhKTvg';
  	var map = L.mapbox.map(domId, 'mapbox.light')
        .setView([30.608623,114.274462], 11);
  	window.taximap = map;
	}
	if(!window.taxiheat){
	  var gradient = {
				0.55:'#c7f127',
				0.65:'#daf127',
				0.7:'#f3f73b',
				0.8:'#FBEF0E',
				0.9:'#FFD700',
				0.99:'#f48e1a',
				1:'red'
		};
		var heat = L.heatLayer(heatMapPoint, {radius:15,gradient:gradient});
	  map.addLayer(heat)
	  window.taxiheat = heat;
	}else{
		window.taxiheat.setLatLngs(heatMapPoint);
	}
}
/**
 * get the calheat
 * @param  {[string]} dom [dom's id of calheat container]
 * @return {[null]}     [null]
 */
async function getCalHeat(dom){
	var month_data = await getMonthData();
	var month_result ={};
	for(var m in month_data){
		month_result[m] = 0;
		var item = month_data[m]
		for(var d in item){
			month_result[m] += item[d];
		}
	}

	let max = 0;
	let min = Infinity;

	for(let d in month_result){
		if(month_result[d]>max){
			max = month_result[d]
		}
		if(month_result[d]<min){
			min = month_result[d]
		}
	}

	var gap = (max-min)/7
	var calMonth = new CalHeatMap();
	calMonth.init({
		itemSelector: dom,
		domain: 'month',
		start: new Date(2014,0,1,0),
		range: 1,
		data:month_result,
		subDomain: 'x_day',
		highlight: "now",
    cellSize: 40,
    subDomainTextFormat: "%d",
		displayLegend: true,
		legend: [min+gap, min+gap*2,min+gap*3,min+gap*4,min+gap*5,min+gap*6],
		legendColors: {
			min: "#00E400",
			max: "#7E0023",
			empty: "#ffffff",
			base: "grey",
			overflow: "grey"
		},
        onClick: function(date,nb){
        	if(nb === 0){
        		return ;
        	}
        	getChartByTime(date.getTime()/1000);

        }
	});
	var titleDom = document.createElement('div');
	titleDom.style.textAlign = 'center';
	titleDom.innerHTML= "2014年1月各天车流量"
	dom.insertBefore(titleDom,dom.getElementsByTagName("svg")[0]);
}
/**
 * get the day-lineChart by time
 * @param  {[int]} timestamp [timestamp]
 * @return {[null]}           [null]
 */
async function getChartByTime(timestamp){
	var flowChart = echarts.getInstanceByDom(document.getElementById("taxi-flow-chart"));
	var flowChart2 = echarts.getInstanceByDom(document.getElementById("taxi-flow-chart2"));
	var passChart = echarts.getInstanceByDom(document.getElementById("taxi-pass-chart"));
	flowChart.showLoading();
	passChart.showLoading();
	var wuhan_od = await getODData(timestamp);
	var result_data = processODData(wuhan_od);

	getDayLineMap(wuhan_od);

	//get Flowchart
	taxiFlowChart(flowChart,result_data['lines'],result_data['points']);

	//get Flowchart2
	taxiFlowChart2(flowChart2,result_data['lines2'],result_data['points2']);

	//get PassOutChart

	taxiPassOutChart(passChart,result_data['in'],result_data['out'],flowChart);
	flowChart.hideLoading();
	passChart.hideLoading();
	getHeatMap(wuhan_od);
}
/**
 * [getDayLineMap by data]
 * @param  {[Array]} odData [[obj,obj]]]
 * @return {[null]}        [null]
 */
function getDayLineMap(odData){
	var origintime = odData[0].time_point;
	var origindate = new Date(origintime*1000);
	var starttime = new Date(origindate.getFullYear(),origindate.getMonth(),origindate.getDate(),0).getTime()/1000;
	var lineData = [];
	for(var d=0;d<odData.length;d++){
		var item = odData[d];
		var index = parseInt((item.time_point - origintime)/3600);
		if(lineData[index] >= 0 ){
			lineData[index] +=1;
		}else{
			lineData[index] = 0;
		}
	}
	var option = {
	    tooltip: {
	        trigger: 'axis'
	    },
	    title: {
	        left: 'left',
	        text: '各小时车流量',
	    },
	    legend: {
	        top: 'bottom',
	        data:['意向']
	    },
	    toolbox: {
	        show: true,
	        feature: {
	            dataView: {show: true, readOnly: false},
	            magicType: {show: true, type: ['line', 'bar', 'stack', 'tiled']},
	            restore: {show: true},
	            saveAsImage: {show: true}
	        }
	    },
	    xAxis: {
	        type: 'category',
	        boundaryGap: false,
	        data: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24]
	    },
	    yAxis: {
	        type: 'value',
	        boundaryGap: [0, '100%']
	    },
	    series: [
	        {
	            name:'出租车流量',
	            type:'line',
	            smooth:true,
	            symbol: 'none',
	            sampling: 'average',
	            itemStyle: {
	                normal: {
	                    color: 'rgb(255, 70, 131)'
	                }
	            },
	            areaStyle: {
	                normal: {
	                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
	                        offset: 0,
	                        color: 'rgb(255, 158, 68)'
	                    }, {
	                        offset: 1,
	                        color: 'rgb(255, 70, 131)'
	                    }])
	                }
	            },
	            data: lineData,
	            markPoint : {
	                data : [
	                    {type : 'max', name: '最大值'},
	                    {type : 'min', name: '最小值'}
	                ]
	            },
	            markLine : {
	                data : [
	                    {type : 'average', name: '平均值'}
	                ]
	            }
	        }
	    ]
	};

	var cal_haat_container = document.getElementById("cal-heatmap");
	var dayElement = document.getElementById('day-calheat');
	if(!dayElement){
		var dayElement = document.createElement("div");
		dayElement.id = 'day-calheat';
		dayElement.style.height = '300px';
		cal_haat_container.appendChild(dayElement);
	}
	var dayBarChart = echarts.getInstanceByDom(dayElement);
	if(!dayBarChart){
		dayBarChart = echarts.init(dayElement);
	}

	dayBarChart.showLoading();
	dayBarChart.setOption(option);
	dayBarChart.hideLoading();
}

/**
 * get the json data by url
 * @param  {[String]} url [url]
 * @return {[Promise]}     [proimise object]
 */
function getJSON(url){
	var promise = new Promise(function(resolve, reject){
	    var client = new XMLHttpRequest();
	    client.open("GET", url);
	    client.onreadystatechange = handler;
	    client.responseType = "json";
	    client.setRequestHeader("Accept", "application/json");
	    client.send();

	    function handler() {
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
 * get the geojson of city
 * @param  {[String]} city [the name of city]
 * @return {[Promise]}      [Promise Object]
 */
function getGeojson(city){
	return getJSON("http://202.114.123.53/zx/taxi/getGeojson.php?city="+city);
}
/**
 * get the month data
 * @return {[Promise]} [Promise obj]
 */
function getMonthData(){
	return getJSON("http://202.114.123.53/zx/taxi/getDistrictDay.php");
}
/**
 * get the od data
 * @param  {[int]} timestamp [timestamp]
 * @return {[type]}           [description]
 */
function getODData(timestamp){
	if(timestamp){
		return getJSON("http://202.114.123.53/zx/taxi/getAllOdDataM.php?timestamp="+timestamp);
	}else{
		return getJSON("http://202.114.123.53/zx/taxi/getAllOdDataM.php");
	}

}
/**
 * process of the OD-data
 * @param  {[Array]} data [[{state,district},{}]]
 * @return {[Object]}      [{lines,points,in,out}]
 */
function processODData(data){
	var taxi_data = data;

	var draw_data = {};

	//武汉三镇
	var draw_data2 = {};

	//calculate in/out between two district
	for(let i = 0,length = taxi_data.length;i<length;i++){
		var start_point = taxi_data[i];

		if(start_point.state !== 0){
			continue;
		}

		if(i >= length-1){
			break;
		}
		var end_point = taxi_data[i+1];
		if(start_point.district === ''||end_point.district === ''){
			continue;
		}
		var dislink = {
			'江岸区':'汉口',
			'江汉区':'汉口',
			'硚口区':'汉口',
			'汉阳区':'汉阳',
			'武昌区':'武昌',
			'青山区':'武昌',
			'洪山区':'武昌',
		}

		if(draw_data2[dislink[start_point.district]]){
			if(draw_data2[dislink[start_point.district]][dislink[end_point.district]]){
				draw_data2[dislink[start_point.district]][dislink[end_point.district]] += 1;
			}else{
				draw_data2[dislink[start_point.district]][dislink[end_point.district]] = 1;
			}
		}else{
			draw_data2[dislink[start_point.district]] = {};
			draw_data2[dislink[start_point.district]][dislink[end_point.district]] = 1;
		}

		if(draw_data[start_point.district]){
			if(draw_data[start_point.district][end_point.district]){
				draw_data[start_point.district][end_point.district] += 1;
			}else{
				draw_data[start_point.district][end_point.district] = 1;
			}
		}else{
			draw_data[start_point.district] = {};
			draw_data[start_point.district][end_point.district] = 1;
		}

		i++;
	}

	data = draw_data;
	let districtLonLat = {
		"江汉区":[114.274462,30.608623],
		"武昌区":[114.320455,30.56087],
		"青山区":[114.39275,30.630875],
		"江岸区":[114.311256,30.606385],
		"洪山区":[114.349919,30.506497],
		"汉阳区":[114.221569,30.56286],
		"东西湖区":[114.140794,30.627519],
		"硚口区":[114.219557,30.58848],
		"蔡甸区":[114.03271,30.589226],
		"黄陂区":[114.375934,30.889686],
		"江夏区":[114.329941,30.381085],
		"新洲区":[114.807983,30.848025],
		"汉南区":[114.193972,30.479202]
	}

	let distirct2 = {
		"汉口":[114.277336,30.624536],
		"武昌":[114.396919,30.518071],
		"汉阳":[114.210646,30.533003]
	}
	function getDistrictIn(district){
		var value = 0;
		for(let name in data){
			if(name != district){
				for(let inname in data[name]){
					if(inname === district){
						value += data[name][district];
					}
				}
			}
		}
		return value;
	}

	var temp_markline_data = {};
	var temp_point_data = {};
	var temp_markline_data2 = {};
	var temp_point_data2 = {};
	var taxi_region_in = [];  //各区域车辆流入数量
	var taxi_region_out = []; //各区域车辆流出数量
	for(let name in data){
		var temp_lime = [];
		var temp_point = [];
		var item = data[name];

		var out_num = 0;

		for(let name2 in item){
			if(name2 != name){
				out_num += item[name2];
				temp_lime.push([{name:name,coord:districtLonLat[name],value:item[name2]},{name:name2,coord:districtLonLat[name2],value:item[name2]}]);
				temp_point.push({name:name2,value:districtLonLat[name2].concat([item[name2]])});
			}
		}

		temp_markline_data[name] = temp_lime;
		temp_point_data[name] = temp_point;

		var in_num = getDistrictIn(name);
		taxi_region_in.push(in_num);

		taxi_region_out.push(out_num);

	}

	//flowdata2
	for(let name in draw_data2){
		if(name == "undefined"){
			continue
		}
		var temp_lime = [];
		var temp_point = [];
		var item = draw_data2[name];

		var out_num = 0;

		for(let name2 in item){
			if(name2=="undefined"){
				continue
			}
			if(name2 != name){
				out_num += item[name2];
				temp_lime.push([{name:name,coord:distirct2[name],value:item[name2]},{name:name2,coord:distirct2[name2],value:item[name2]}]);
				temp_point.push({name:name2,value:distirct2[name2].concat([item[name2]])});
			}
		}

		temp_markline_data2[name] = temp_lime;
		temp_point_data2[name] = temp_point;
	}

	return {
		"lines":temp_markline_data,
		'points':temp_point_data,
		"lines2":temp_markline_data2,
		'points2':temp_point_data2,
		'in':taxi_region_in,
		'out':taxi_region_out
	}
}

/**
 * get the taxi-flow-chart
 * @param  {[Object]} flowChart  [Echarts Instance]
 * @param  {[Array]} linesData  [[[{name,coord,value},{name,coord,value}],[]]]
 * @param  {[Array]} pointsData [[{name:value}]]
 * @return {[Object]}            [Echarts Instance]
 */
function taxiFlowChart(flowChart,linesData,pointsData){

	var option = {
	    backgroundColor: '#404a59',
	    title : {
	        text: '武汉各区之间出租车流动图',
	        subtext: '',
	        left: 'center',
	        textStyle : {
	            color: '#fff'
	        }
	    },
	    tooltip : {
        trigger: 'item',
        formatter: function (v) {
						return v.data[0].name+" > " + v.data[1].name+" : "+v.value;
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
	    	center: [114.274462,30.608623],
            zoom: 11,
            roam: true,
            mapStyle: {
                styleJson: [
		          {
	                    "featureType": "water",
	                    "elementType": "all",
	                    "stylers": {
	                        "color": "#134f5c"
	                    }
		          },
		          {
	                    "featureType": "land",
	                    "elementType": "all",
	                    "stylers": {
	                        "color": "#444444"
	                    }
		          },
		          {
	                    "featureType": "boundary",
	                    "elementType": "geometry",
	                    "stylers": {
	                        "color": "#064f85"
	                    }
		          },
		          {
	                    "featureType": "railway",
	                    "elementType": "all",
	                    "stylers": {
	                        "visibility": "off"
	                    }
		          },
		          {
	                    "featureType": "highway",
	                    "elementType": "geometry",
	                    "stylers": {
	                        "color": "#3d85c6",
	                        "lightness": -53
	                    }
		          },
		          {
	                    "featureType": "highway",
	                    "elementType": "geometry.fill",
	                    "stylers": {
	                        "color": "#76a5af"
	                    }
		          },
		          {
	                    "featureType": "highway",
	                    "elementType": "labels",
	                    "stylers": {
	                        "visibility": "off"
	                    }
		          },
		          {
	                    "featureType": "arterial",
	                    "elementType": "geometry",
	                    "stylers": {
	                        "color": "#33707d"
	                    }
		          },
		          {
	                    "featureType": "arterial",
	                    "elementType": "geometry.fill",
	                    "stylers": {
	                        "color": "#45818e",
	                        "lightness": -56
	                    }
		          },
		          {
	                    "featureType": "poi",
	                    "elementType": "all",
	                    "stylers": {
	                        "visibility": "off"
	                    }
		          },
		          {
	                    "featureType": "green",
	                    "elementType": "all",
	                    "stylers": {
                            "color": "#056197",
                            "visibility": "off"
	                    }
		          },
		          {
	                    "featureType": "subway",
	                    "elementType": "all",
	                    "stylers": {
	                        "visibility": "off"
	                    }
		          },
		          {
	                    "featureType": "manmade",
	                    "elementType": "all",
	                    "stylers": {
	                        "visibility": "off"
	                    }
		          },
		          {
	                    "featureType": "local",
	                    "elementType": "all",
	                    "stylers": {
	                        "visibility": "off"
	                    }
		          },
		          {
	                    "featureType": "arterial",
	                    "elementType": "labels",
	                    "stylers": {
	                        "visibility": "off"
	                    }
		          },
		          {
	                    "featureType": "boundary",
	                    "elementType": "geometry.fill",
	                    "stylers": {
	                        "color": "#029fd4"
	                    }
		          },
		          {
	                    "featureType": "building",
	                    "elementType": "all",
	                    "stylers": {
	                        "color": "#1a5787"
	                    }
		          },
		          {
	                    "featureType": "label",
	                    "elementType": "all",
	                    "stylers": {
	                        "visibility": "off"
	                    }
		          }
				]
            }
	    },
	    visualMap: [{
	    	type:'continuous',
            min: 0,
            max: 50,
            text:['High','Low'],
            realtime: true,
            calculable : true,
            color: ['orangered','yellow','lightskyblue'],
        }],
	    series: []
	}
	var series = []
	for(let name in linesData){
		option.legend.data.push(name);
		var temp_markline_data = linesData[name];
		var temp_point_data = pointsData[name];
		series.push(
			{
				name:name,
				type:'lines',
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
				data:temp_markline_data
			},
			{
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
		    },
		    {
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
		        symbolSize: function (val) {
		        	var size = Math.log(val[2])*3;
		            return size;
		        },
		        itemStyle: {
		            normal: {
		                color: '#a6c84c'
		            }
		        },
		        data: temp_point_data
		    }
		);
	}

	option.series = series;
	flowChart.setOption(option);
	flowChart.hideLoading();
	return flowChart;
}

/**
 * get the taxi-flow-chart2
 * @param  {[Object]} flowChart  [Echarts Instance]
 * @param  {[Array]} linesData  [[[{name,coord,value},{name,coord,value}],[]]]
 * @param  {[Array]} pointsData [[{name:value}]]
 * @return {[Object]}            [Echarts Instance]
 */
function taxiFlowChart2(flowChart,linesData,pointsData){

	var option = {
	    backgroundColor: '#404a59',
	    title : {
	        text: '武汉三镇之间出租车流动图',
	        subtext: '',
	        left: 'center',
	        textStyle : {
	            color: '#fff'
	        }
	    },
	    tooltip : {
	        trigger: 'item',
	        formatter: function (v) {
				return v.data[0].name+" > " + v.data[1].name+" : "+v.value;;
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
	    	center: [114.274462,30.608623],
            zoom: 11,
            roam: true,
            mapStyle: {
                styleJson: [
		          {
	                    "featureType": "water",
	                    "elementType": "all",
	                    "stylers": {
	                        "color": "#134f5c"
	                    }
		          },
		          {
	                    "featureType": "land",
	                    "elementType": "all",
	                    "stylers": {
	                        "color": "#444444"
	                    }
		          },
		          {
	                    "featureType": "boundary",
	                    "elementType": "geometry",
	                    "stylers": {
	                        "color": "#064f85"
	                    }
		          },
		          {
	                    "featureType": "railway",
	                    "elementType": "all",
	                    "stylers": {
	                        "visibility": "off"
	                    }
		          },
		          {
	                    "featureType": "highway",
	                    "elementType": "geometry",
	                    "stylers": {
	                        "color": "#3d85c6",
	                        "lightness": -53
	                    }
		          },
		          {
	                    "featureType": "highway",
	                    "elementType": "geometry.fill",
	                    "stylers": {
	                        "color": "#76a5af"
	                    }
		          },
		          {
	                    "featureType": "highway",
	                    "elementType": "labels",
	                    "stylers": {
	                        "visibility": "off"
	                    }
		          },
		          {
	                    "featureType": "arterial",
	                    "elementType": "geometry",
	                    "stylers": {
	                        "color": "#33707d"
	                    }
		          },
		          {
	                    "featureType": "arterial",
	                    "elementType": "geometry.fill",
	                    "stylers": {
	                        "color": "#45818e",
	                        "lightness": -56
	                    }
		          },
		          {
	                    "featureType": "poi",
	                    "elementType": "all",
	                    "stylers": {
	                        "visibility": "off"
	                    }
		          },
		          {
	                    "featureType": "green",
	                    "elementType": "all",
	                    "stylers": {
                            "color": "#056197",
                            "visibility": "off"
	                    }
		          },
		          {
	                    "featureType": "subway",
	                    "elementType": "all",
	                    "stylers": {
	                        "visibility": "off"
	                    }
		          },
		          {
	                    "featureType": "manmade",
	                    "elementType": "all",
	                    "stylers": {
	                        "visibility": "off"
	                    }
		          },
		          {
	                    "featureType": "local",
	                    "elementType": "all",
	                    "stylers": {
	                        "visibility": "off"
	                    }
		          },
		          {
	                    "featureType": "arterial",
	                    "elementType": "labels",
	                    "stylers": {
	                        "visibility": "off"
	                    }
		          },
		          {
	                    "featureType": "boundary",
	                    "elementType": "geometry.fill",
	                    "stylers": {
	                        "color": "#029fd4"
	                    }
		          },
		          {
	                    "featureType": "building",
	                    "elementType": "all",
	                    "stylers": {
	                        "color": "#1a5787"
	                    }
		          },
		          {
	                    "featureType": "label",
	                    "elementType": "all",
	                    "stylers": {
	                        "visibility": "off"
	                    }
		          }
				]
            }
	    },
	    visualMap: [{
	    	type:'continuous',
            min: 50,
            max: 1800,
            text:['High','Low'],
            realtime: true,
            calculable : true,
            color: ['orangered','yellow','lightskyblue'],
        }],
	    series: []
	}
	var series = []
	for(let name in linesData){
		option.legend.data.push(name);
		var temp_markline_data = linesData[name];
		var temp_point_data = pointsData[name];
		series.push(
			{
				name:name,
				type:'lines',
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
		                width: 20,
		                opacity: 0.4,
		                curveness: 0.2
		            }
		        },
				data:temp_markline_data
			},
			{
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
		                width: 5,
		                curveness: 0.2
		            }
		        },
		        data: temp_markline_data
		    },
		    {
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
		        symbolSize: function (val) {
		        	var size = Math.log(val[2])*3;
		            return size;
		        },
		        itemStyle: {
		            normal: {
		                color: '#a6c84c'
		            }
		        },
		        data: temp_point_data
		    }
		);
	}

	option.series = series;
	flowChart.setOption(option);
	flowChart.hideLoading();
	// flowChart.on("bmapRoam",function(e){
	// 	console.log(e);
	// });
	return flowChart;
}



/**
 * get the taxi-pass-chart
 * @param  {[Object]} passChart [Echarts Instance]
 * @param  {[Array]} inData    [[value1,value2,..]]
 * @param  {[Array]} outData   [[value1,value2,..]]
 * @param  {[Object]} flowChart [Echarts Instance]
 * @return {[Object]}           [Echarts Instance]
 */
function taxiPassOutChart(passChart,inData,outData,flowChart){
	var option = {
		title : {
	        text: '武汉各区出租车流入流出',
	        subtext: '',
	        left:'left',
	        bottom: '15%',
	        textStyle : {
	            color: '#070716'
	        }
	    },
		tooltip : {
	        trigger: 'axis',
	        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
	            type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
	        }
	    },
	    legend: {
	    	left:'right',
	        data:['流入','流出']
	    },
	    grid: {
	        left: '3%',
	        right: '4%',
	        bottom: '3%',
	        containLabel: true
	    },
	    xAxis : [
	        {
	            type : 'category',
	            data : []
	        }
	    ],
	    yAxis : [
	        {
	            type : 'value'
	        }
	    ],
	    series : []
	};
	option.series.push({
		name: '流入',
		type: 'bar',
		stack: '流动',
		data: inData
	},{
		name: '流出',
		type: 'bar',
		stack: '流动',
		data: outData
	});
	var flowOption = flowChart.getOption();
	option.xAxis[0].data = flowChart.getOption().legend[0].data;


	passChart.setOption(option);

	passChart.on("click",e => {
		flowChart.dispatchAction({
			'type':'legendSelect',
			'name':e.name
		})
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

export { TaxiVisChart };
