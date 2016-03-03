/*
* 垂直滚动标签
@param domId 需要初始化成verticalTap的domId
*/
function verticalTap(domId,fn){
	//先初始化show or hide
	var activeObj;  //当前选中tab
	var items=$("#"+domId).find("> .tool-item");
	items.each(function(index,elem){
		var constolId=$(elem).attr('data-control');
		if($(elem).hasClass("active")){
			$("#"+constolId).show();
			activeObj=$(elem);
		}else{
			$("#"+constolId).hide();
		}
		
	});

	//如果没有预设active值，则默认第一个是活动tab
	if(!activeObj){
		var activeItem=items[0];
		activeObj=$(activeItem);
		activeObj.addClass("active");
		var activeId=activeObj.attr("data-control");
		$("#"+activeId).show();
	}

	//点击切换
	$("#"+domId).on("click",(event)=>{

		var currentObj=$(event.target);
		if(!currentObj.attr("data-control")){
			return;
		}
		if(currentObj.hasClass("active")){
			return;
		}

		//被点击项拉到中间
		var centerScroolTop=($("#"+domId).height()-currentObj.height())/2;
		$("#"+domId).scrollTop(currentObj[0].offsetTop-centerScroolTop);

		//切换操作
		activeObj.removeClass('active');
		$("#"+activeObj.attr("data-control")).hide();

		activeObj=currentObj;
		activeObj.addClass("active");
		var relatedId=activeObj.attr('data-control');
		if(relatedId){
			$("#"+relatedId).show();
		}else{
			console.log('need data-control attribute');
		}

		//执行绑定的额外的click操作
		fn(event);
	});

}

export {verticalTap}