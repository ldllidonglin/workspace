/**
 * the class of poi-vis-map
 */
class PoiVisMap {
	constructor(domId){
		this.domId = domId;
        $("#"+domId).show();
        var map=initMap(domId);
		$.get("http://202.114.123.53/zx/weibo/getWeiboData.php",{'city':'武汉'})
		 .then(function(data){
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
			cluster.on('layerremove',function(e){
				console.log('heat');
			});

			createClusterLens(cluster,map,'zoomlens');

			map.on('zoomend',function(e){
				var current_level = e.target.getZoom();
				console.log(current_level);
				if(current_level <= 12){
					map.addLayer(heatMap);
					map.removeLayer(cluster);
					$('#zoomlens').hide();
				}
				else if(current_level > 12 && current_level <= 15){
					map.removeLayer(heatMap);
					map.addLayer(cluster);
				}else if(current_level > 15){
					map.removeLayer(heatMap);
					map.removeLayer(cluster);
					$('#zoomlens').hide();
				}
			});

		});
	}
	show(){
        $("#"+this.domId).show();
    }
    hide(){
        $("#"+this.domId).hide();
    }
}

/**
 * initialize the map
 * @param  {[String]} domId [id of map's container]
 * @return {[Object]}       [map]
 */
function initMap(domId){
	L.mapbox.accessToken = 'pk.eyJ1IjoiZG9uZ2xpbmdlIiwiYSI6Ik1VbXI1TkkifQ.7ROsya7Q8kZ-ky9OmhKTvg';
    var map = L.mapbox.map(domId, 'mapbox.light')
        .setView([30.608623,114.274462], 11);
    return map;
}

/**
 * create ClusterGroup
 * @param  {[Array]} data [like [[lat1,lon1],[lat2,lon2],...]  ]
 * @return {[Object]}      [MarkerClusterGroup]
 */
function createCluster(data){
	var markers = new L.MarkerClusterGroup({
	    showCoverageOnHover: false,
	    zoomToBoundsOnClick: false
	});
	for(var i = 0,length = data.length;i<length;i++){
		var latlng = new L.LatLng(data[i][0],data[i][1]);
		var marker = L.marker(latlng, {
	        icon: L.mapbox.marker.icon({'marker-symbol': 'post', 'marker-color': '0044FF'})
	    });
	    markers.addLayer(marker);
	}

    return markers;
}

/**
 * create the cluster's lens
 * @param  {Object} cluster  [the cluster Object]
 * @param  {Object} map      [map object]
 * @param  {String} lendomId [lens's container ]
 * @return {null}          [null]
 */
function createClusterLens(cluster,map,lendomId){
	//初始化zoommap
	var zoommap = L.mapbox.map('zoommap', 'mapbox.streets', {
	    fadeAnimation: false,
	    zoomControl: false,
	    attributionControl: false
	});

	var oldLayer=[];
	var zl = document.getElementById(lendomId);
	cluster.on('clustermouseover', function (e) {

		var point = map.latLngToContainerPoint(e.latlng);
		$(zl).show();
		//get the current markers
		var clickMarkers = e.layer.getAllChildMarkers();

		//remove the old-marker of lens
		for(var m in oldLayer){
			var old_marker = oldLayer[m];
			zoommap.removeLayer(old_marker);
		}
		oldLayer=[];
		//add the current markers to lens and oldLayer
		for(var i in clickMarkers){
			var marker = clickMarkers[i];
			var latlng = marker._latlng;
			var zoomMarker = L.marker(latlng, {
		        icon: L.mapbox.marker.icon({'marker-symbol': 'post', 'marker-color': '0044FF'})
		    });
			zoomMarker.addTo(zoommap);
		    oldLayer.push(zoomMarker);
		}
		//set the top/left of lens
		zl.style.top = point.y - 100 + 'px';
	    zl.style.left = point.x - 100 + 'px';
	    //set view of lens
	    zoommap.setView(e.latlng, map.getZoom() + 1, true);
	});

	cluster.on('clusterlayerremove',function(e){
		console.log(e);
	});

}
/**
 * create HeatMap
 * @param  {Array} data [like [[lat,lon,value],[lat,lon,value],...] ]
 * @return {[Object]}      [heatLayer]
 */
function createHeatMap(data){
	console.log(data.length);
	var heat, gradient;
	if(data.length <1000){
		gradient = {
			0.05:'#c7f127',
			0.1:'#daf127',
			0.2:'#f3f73b',
			0.4:'#FBEF0E',
			0.6:'#FFD700',
			0.8:'#f48e1a',
			1:'red'
		};
		heat = L.heatLayer(data, {radius:35,gradient:gradient});
	}
	else if(data.length >= 1000 && data.length < 2000){
		gradient = {
			0.3:'#c7f127',
			0.4:'#daf127',
			0.5:'#f3f73b',
			0.6:'#FBEF0E',
			0.7:'#FFD700',
			0.8:'#f48e1a',
			1:'red'
		};
		heat = L.heatLayer(data, {radius:15,gradient:gradient});
	}
	else if(data.length >= 2000 && data.length < 3000){
		gradient = {
			0.5:'#c7f127',
			0.55:'#daf127',
			0.6:'#f3f73b',
			0.7:'#FBEF0E',
			0.8:'#FFD700',
			0.98:'#f48e1a',
			1:'red'
		};
		heat = L.heatLayer(data, {radius:15,gradient:gradient});
	}
	else{
		gradient = {
			0.5:'#c7f127',
			0.55:'#daf127',
			0.6:'#f3f73b',
			0.7:'#FBEF0E',
			0.8:'#FFD700',
			0.98:'#f48e1a',
			1:'red'
		};
		heat = L.heatLayer(data, {radius:15,gradient:gradient});
	}

	return heat;
}

export { PoiVisMap }
