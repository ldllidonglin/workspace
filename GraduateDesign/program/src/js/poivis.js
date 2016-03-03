function poiVisMap(domId){
	var map=initMap(domId);
	$.get("http://202.114.123.53/zx/weibo/getWeiboData.php",{'city':'武汉'}).then(function(data){
		data = JSON.parse(data);
		var points = [];
		var heatMapPoint = [];
		for(var x in data){
			var item=data[x];
			var lat=item.geo.coordinates[0];
			var lon=item.geo.coordinates[1];
			points.push([lat,lon]);
			heatMapPoint.push([lat,lon,100.0]);
		}

		var heatMap = createHeatMap(heatMapPoint);
		map.addLayer(heatMap);

		var cluster = createCluster(points);
		

		createClusterLens(cluster,map,'zoomlens');

		map.on('zoomend',function(e){
			var current_level = e.target.getZoom();
			console.log(current_level);
			if(current_level <= 12){
				map.addLayer(heatMap);
				map.removeLayer(cluster);
			}
			else if(current_level > 12){
				map.removeLayer(heatMap);
				map.addLayer(cluster);
			}else if(current_level > 15){
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
function initMap(domId){
	L.mapbox.accessToken = 'pk.eyJ1IjoiZG9uZ2xpbmdlIiwiYSI6Ik1VbXI1TkkifQ.7ROsya7Q8kZ-ky9OmhKTvg';
    var map = L.mapbox.map(domId, 'mapbox.light')
        .setView([30.608623,114.274462], 11);
    return map;
}

function createCluster(data){
	var markers = new L.MarkerClusterGroup({
	    showCoverageOnHover: false,
	    zoomToBoundsOnClick: false,
	    iconCreateFunction: function(cluster) {
	    	console.log(cluster.getAllChildMarkers());
			return L.divIcon({ html: '<b>' + 11 + '</b>' });
		}
	});
	for(var i = 0,length = data.length;i<length;i++){
		var latlng = new L.LatLng(data[i][0],data[i][1]);
		var marker = L.marker(latlng, {
	        icon: L.mapbox.marker.icon({'marker-symbol': 'post', 'marker-color': '0044FF'}),
	    	title:'1'
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
function createClusterLens(cluster,map,lendomId){
	//初始化zoommap
	var zoommap = L.mapbox.map('zoommap', 'mapbox.streets', {
	    fadeAnimation: false,
	    zoomControl: false,
	    attributionControl: false
	});
	
	var oldLayer=[];;
	var zl = document.getElementById(lendomId);
	cluster.on('clustermouseover', function (e) {

		var point = map.latLngToContainerPoint(e.latlng);

		//获取当前的markers
		var clickMarkers = e.layer.getAllChildMarkers();
		//移除lens中的marker
		for(var m in oldLayer){
			var marker = oldLayer[m];
			zoommap.removeLayer(marker);
		}
		oldLayer=[];
		//把当前的marker加入lens、oldLayer以备删除
		for(var m in clickMarkers){
			var marker = clickMarkers[m];
			var latlng = marker._latlng;
			var zoomMarker = L.marker(latlng, {
		        icon: L.mapbox.marker.icon({'marker-symbol': 'post', 'marker-color': '0044FF'})
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

function createHeatMap(data){
	var heat = L.heatLayer(data, {radius: 25});
	return heat;
}
export { poiVisMap }