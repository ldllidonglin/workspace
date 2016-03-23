import { WeiboTextMap,Event3DMap } from './weibovis.js';
import { layoutInit } from './layout.js';
import { TaxiVisChart } from './taxiVis.js';
import { PoiVisMap } from './poivis.js';

//global varible relate to vistap
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
            cleanMainWindow();
            if(INITOBJ.textmap){
                INITOBJ.textmap.show();
            }else{
                var text_map = new WeiboTextMap("weibo-text-map");
                INITOBJ.textmap = text_map;
            }
            break;
        case "weibo-event-vis":
            cleanMainWindow();
            if(INITOBJ.eventmap){
                
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
            cleanMainWindow();
            if(INITOBJ.poimap){
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
            cleanMainWindow();
            if(INITOBJ.taxichart){
                
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
layoutInit();

// Initialize the index page
var text_map = new WeiboTextMap("weibo-text-map");
INITOBJ.textmap = text_map;