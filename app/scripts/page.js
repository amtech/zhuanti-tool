/* 
 * 可视化专题配置工具
 * 2017-2-6 
 */
function Special() {
}
Special.prototype = {
	init: function() {
		var _self = this;
		_self.listenerMessage();
		// 通信
		_self.postMessageModHeight();
		// 轮播图模块
		_self.swiper();
	},
	swiper:function(){
		var _self=this;
		$('.swiper-container').each(function(i,d){
			_self[d.id] = $('#'+d.id).swiper({
			    loop: true,
			    autoplay : 5000,
			    pagination : '.pagination',
			    paginationClickable :true
			});
		})
	},
	// 监听父层事件
	listenerMessage:function(){
		var _self = this;
		window.addEventListener('message', function(e) {
			if (e.source != window.parent) return;
			if(typeof _self[e.data.type]=="function"){
				_self[e.data.type](e)
			}
		}, false);
	},
	//通知父层模块遮罩层高度
	postMessageModHeight:function(){
		$('#J_PageToDesign,#J_DesignModeShim', window.parent.document).css({
			height: $('body').height(),
			width: "100%"
		});
		var data={
			type:"set_mod_height",
			height:{}
		};
		$('#content>div').each(function(i, e) {
			data.height[e.id]=$(e).height();
		})
		window.parent.postMessage(data, '*');
	},
	// 页面背景
	bg:function(e){
		$('.box-body').css({
			backgroundImage:"url("+e.data.img+")",
			backgroundColor:"#"+e.data.color,
			backgroundRepeat:e.data.show,
			backgroundPosition:e.data.align
		});
	},
	// 自定义css
	css:function(e){
		var obj=$("#J_CSS");
		if(obj.length){
			obj.remove();
		}
		$('body').append("<style id='J_CSS'>"+e.data.data+"</style>")
	},
	// 自定义区编辑
	text:function(e){
		$("#"+e.data.type+"_"+e.data.id).html(e.data.data);
		this.postMessageModHeight();
	},
	// 删除模块
	del:function(e){
		$('#'+e.data.modType+"_"+e.data.id).remove();
	},
	// 模块排序
	move:function(e){
		var mod=$('#'+e.data.modType+'_'+e.data.id);
		switch(e.data.direction){
			case "up":
				$('#content>div').eq(e.data.curIndex).before(mod);
			break;
			case "down":
				$('#content>div').eq(e.data.curIndex).after(mod);
			break;
		};
	},
	// 轮播图编辑
	slider:function(e){
		var _self=this,id=e.data.type+"_"+e.data.id;
		_self[id].removeAllSlides(); //移除全部
		$(e.data.data.data).each(function(i,d){
			var newSlide = _self[id].createSlide('<a href="'+d.url+'"><img src="'+d.img+'" width="1200"></a>','swiper-slide','div');
			newSlide.append(); //加到slides的最后
		});
		$('#'+id).height(e.data.height);
		_self.postMessageModHeight();
	}
}
var special = new Special();
special.init();
