function layoutIni(){
	var clientHeight=document.body.clientHeight;
	var headerHeight=$("header").height();
	var mainHeight=clientHeight-headerHeight-15;
	$("#main").height(mainHeight);
}

export {layoutIni}