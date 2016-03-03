function taxiVisChart(domId){
	var myChart = echarts.init(document.getElementById(domId));
	myChart.showLoading();
	$.get("http://202.114.123.53/zx/taxi/getGeojson.php",{'city':'武汉市'}).then(function(data){

		//注册map
  		echarts.registerMap('wuhan', JSON.parse(data));

  		$.get("http://202.114.123.53/zx/taxi/getAllOdDataM.php").then(function(data){
			var taxi_data = JSON.parse(data);

			var draw_data = {};

			//统计轨迹
			for(var i = 0,length = taxi_data.length;i<length;i++){
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
				}

				i++;	
			}
			console.log(draw_data);
			taxiEchartsMap(draw_data,myChart);
		});
	});
}

function taxiEchartsMap(data,myChart){
	var districtLonLat = {
		"海淀区":[116.299059,39.966493],
		"朝阳区":[116.479583,39.963396],
		"东城区":[116.419217,39.937289],
		"丰台区":[116.29101,39.86511],
		"通州区":[116.661831,39.917813],
		"石景山区":[116.22317,39.9125],
		"门头沟区":[116.107037,39.948353],
		"西城区":[116.369199,39.918698],
		"房山区":[116.147856,39.754701],
		"大兴区":[116.147856,39.754701],
		"昌平区":[116.237831,40.227662],
		"顺义区":[116.659819,40.136379],
		"怀柔区":[116.637972,40.322782]
	};
	districtLonLat = {
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
	        data:['洪山区'],
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
	var planePath = 'path://M1705.06,1318.313v-89.254l-319.9-221.799l0.073-208.063c0.521-84.662-26.629-121.796-63.961-121.491c-37.332-0.305-64.482,36.829-63.961,121.491l0.073,208.063l-319.9,221.799v89.254l330.343-157.288l12.238,241.308l-134.449,92.931l0.531,42.034l175.125-42.917l175.125,42.917l0.531-42.034l-134.449-92.931l12.238-241.308L1705.06,1318.313z';
	for(var n in data){
		option.legend.data.push(n);
		var item = data[n];
		var temp_markline_data = [];
		var temp_point_data = [];
		for(var v in item){
			if(v != n){
				temp_markline_data.push([{name:n,coord:districtLonLat[n],value:item[v]},{name:v,coord:districtLonLat[v],value:item[v]}]);
				temp_point_data.push({name:v,value:districtLonLat[v].concat([item[v]])});
			}
		}
		series.push(
			{
				name:n,
				type:'lines',
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
				data:temp_markline_data
			},
			{
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
		    },
		    {
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
	myChart.setOption(option);
	myChart.hideLoading()
}

export {taxiVisChart};