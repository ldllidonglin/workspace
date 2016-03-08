import { WeiboTextMap,Event3DMap } from './weibovis.js';
import { layoutIni } from './layout.js';
import { TaxiVisChart } from './taxiVis.js';
import { PoiVisMap } from './poivis.js';


let INITOBJ={
    'textmap':0,
    'eventmap':0,
    'poimap':0,
    'taxichart':0
};


//weibo-vis dropdown-button initialize
$("#textvis-list").on("click",e =>{
    switch(event.target.id){
        case "weibo-text-vis":
            if(INITOBJ.textmap){
                cleanMainWindow();
                INITOBJ.textmap.show();
            }else{
                var text_map = new WeiboTextMap("weibo-text-map");
                INITOBJ.textmap = text_map;
            }
            break;
        case "weibo-event-vis":
            if(INITOBJ.eventmap){
                cleanMainWindow();
                INITOBJ.eventmap.show();
            }else{
                var event_map = new Event3DMap("weibo-event-map");
                INITOBJ.eventmap = event_map;
            }
           
            break;
    }
});

//spatial-vis dropdown-button initialize
$("#spatialvis-list").on("click",e =>{
    switch(event.target.id){
        case "poi-vis":
            if(INITOBJ.poimap){
                cleanMainWindow();
                INITOBJ.poimap.show();
            }else{
                var poi_map = new PoiVisMap("poi-vis-map");
                INITOBJ.poimap = poi_map;
            }
            break;
    }
});

//time-vis dropdown-button initialize
$("#timevis-list").on("click",e =>{
    switch(event.target.id){
        case "trajectory-vis":
            if(INITOBJ.taxichart){
                cleanMainWindow();
                INITOBJ.taxichart.show();
            }else{
                var taxichart = new TaxiVisChart("trajectory-vis-container");
                INITOBJ.taxichart = taxichart;
            }
            break;
    }
});



function cleanMainWindow(){
    for(let name in INITOBJ){
        if(INITOBJ[name]){
            INITOBJ[name].hide();
        }
    }
}
//main window initialize
layoutIni();