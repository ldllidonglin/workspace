function layoutInit(){
	var clientHeight = document.body.clientHeight;
	var navHeight = $("nav").height();
	var mainHeight = clientHeight-navHeight-15;
	$("#main").height(mainHeight);
}

export {layoutInit}