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

	//cal-heatmap month
	var cal_heat_dom = document.createElement('div');
	// cal_heat_dom.style.width = '500px';
	// cal_heat_dom.style.height = '600px';
	cal_heat_dom.id = 'cal-heatmap';
	cal_heat_dom.className = 'col s4';
	rowdiv.appendChild(cal_heat_dom);

	//get cal-heat
	getCalHeat(cal_heat_dom);


	//Initialize
	var passChartDom = document.createElement('div');
	// passChartDom.style.width = '500px';
	passChartDom.style.height = '600px';
	passChartDom.id = 'taxi-pass-chart';
	passChartDom.className = 'col s4';
	rowdiv.appendChild(passChartDom);

	var flowChartDom = document.createElement('div');
	flowChartDom.style.width = '500px';
	flowChartDom.style.height = '600px';
	flowChartDom.id = 'taxi-flow-chart';
	flowChartDom.className = 'col s4';
	rowdiv.appendChild(flowChartDom);

	container.appendChild(rowdiv);

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

	//get od-data of wuhan
	var wuhan_od = await getODData();

	console.log(wuhan_od);

	var result_data = processODData(wuhan_od);

	//get Flowchart
	taxiFlowChart(flowChart,result_data['limes'],result_data['points']);
	
	//get PassOutChart
	taxiPassOutChart(passChart,result_data['in'],result_data['out'],flowChart);
	return { 'flowChart':flowChart,'passChart':passChart }
}
/**
 * get the calheat
 * @param  {[string]} dom [dom's id of calheat container]
 * @return {[null]}     [null]
 */
async function getCalHeat(dom){
	var month_data = await getMonthData();
	console.log(month_data);
	var month_result ={};
	for(var m in month_data){
		month_result[m] = 0;
		var item = month_data[m]
		for(var d in item){
			month_result[m] += item[d];
		}
	}

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
        legend: [20000,23000,26000,29000,32000,35000],
        legendColors: {
           min: "green",
           max: "red",
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
}
/**
 * get the day-calheat by time 
 * @param  {[int]} timestamp [timestamp]
 * @return {[null]}           [null]
 */
async function getChartByTime(timestamp){
	var flowChart = echarts.getInstanceByDom(document.getElementById("taxi-flow-chart"));
	var passChart = echarts.getInstanceByDom(document.getElementById("taxi-pass-chart"));
	flowChart.showLoading();
	passChart.showLoading();
	var wuhan_od = await getODData(timestamp);
	var result_data = processODData(wuhan_od);
	console.log(result_data);
	getDayHeatMap(wuhan_od);
	
	//get Flowchart
	taxiFlowChart(flowChart,result_data['limes'],result_data['points']);
	
	//get PassOutChart
	console.log(passChart);
	taxiPassOutChart(passChart,result_data['in'],result_data['out'],flowChart);
	flowChart.hideLoading();
	passChart.hideLoading();
}
/**
 * [getDayHeatMap by data]
 * @param  {[Array]} odData [[obj,obj]]]
 * @return {[null]}        [null]
 */
function getDayHeatMap(odData){
	var origintime = odData[0].time_point;
	var origindate = new Date(origintime*1000);
	var starttime = new Date(origindate.getFullYear(),origindate.getMonth(),origindate.getDate(),0).getTime()/1000;
	var day_heat_data = {};
	for(var d=0;d<odData.length;d++){
		var item = odData[d];
		var index = parseInt((item.time_point - origintime)/3600);
		if(day_heat_data[starttime+index*3600] >= 0 ){
			day_heat_data[starttime+index*3600] +=1; 
		}else{
			day_heat_data[starttime+index*3600] = 0;
		}
	}
	console.log(day_heat_data);
	var cal_haat_container = document.getElementById("cal-heatmap");
	var dayElement = document.getElementById('day-calheat');
	if(dayElement){
		dayElement.innerHTML = '';
	}else{
		var dayElement = document.createElement("div");
		dayElement.id = 'day-calheat';
	}
	cal_haat_container.appendChild(dayElement);
	var calMonth = new CalHeatMap();
	calMonth.init({
		itemSelector: dayElement,
		domain: 'day',
		start: new Date(starttime*1000),
		range: 1,
		data:day_heat_data,
		subDomain: 'x_hour',
		highlight: "now",
        cellSize: 40, 
        subDomainTextFormat: "%d",
        legend: [500,1000,1200,1300,1400,1500],
        legendColors: {
           min: "green",
           max: "red",
           empty: "#ffffff",
           base: "grey",
           overflow: "grey"
        }
	});

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

function processODData(data){
	var taxi_data = data;

	var draw_data = {};

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
	};
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
	return {
		"limes":temp_markline_data,
		'points':temp_point_data,
		'in':taxi_region_in,
		'out':taxi_region_out
	}
}


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
				return v.data[0].name+" > " + v.data[1].name;
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
	};
	var series = [];
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
	console.log(option);
	flowChart.hideLoading();
	return flowChart;
}

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