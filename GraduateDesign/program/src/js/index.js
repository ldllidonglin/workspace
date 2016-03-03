import {weiboTextMap} from './weibovis.js';
import {layoutIni} from './layout.js';
import {verticalTap} from './vertical-tab.js';
import {taxiVisChart} from './taxiVis.js';
import {poiVisMap} from './poivis.js';


var iniObj={
    'weibo':0,
    'poi':0,
    'taxi':0
};

weiboTextMap("map");
iniObj.weibo = 1;

/**
 * 左侧栏响应函数
 * @param  {[obj]} event [事件]
 * @return {[null]}       [null]
 */
function toolTapClick (event) {
    switch(event.target.id){
        case "weibo-vis":
            if(!iniObj.weibo){
              weiboTextMap("map");
              iniObj.weibo = 1;
            }
            break;
        case "poi-vis":
            if(!iniObj.poi){
                poiVisMap('bdmap');
                iniObj.poi = 1;
            }
            break;
        case "taxi-vis":
            if(!iniObj.taxi){
               taxiVisChart('bdmap-t');
               iniObj.taxi = 1; 
            }
            break;
    }
}
//初始化左侧栏
verticalTap("tool-container",toolTapClick);
//初始化主窗口布局
layoutIni();

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
