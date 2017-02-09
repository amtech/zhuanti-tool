/* 
 * 可视化专题配置工具
 * 2017-2-6 
 */

function Special() {
}
Special.prototype = {
	init: function() {
		var _self = this;

		// 监听父层事件
		window.addEventListener('message', function(e) {
			if (e.source != window.parent) return;
			// window.parent.postMessage(e.data, '*');
			switch(e.data.type){
				case "bg":
					_self.bg(e);
				break;
				case "css":
					_self.css(e);
				break;
				case "text":
					_self.text(e);
				break;

			}
		}, false);

		// 通信
		window.onload = function() {
			var data={};
			$('#content>div').each(function(i, e) {
				data[e.id]={};
				data[e.id] = {
					width: $(e).width(),
					height: $(e).height()
				}
			})
			window.parent.postMessage(data, '*');
		}

		//控制父层iframe高度
		$(function() {
			$('#J_PageToDesign,#J_DesignModeShim', window.parent.document).css({
				height: $('body').height(),
				width: "100%"
			})
		});
	},
	bg:function(e){
		$('.box-body').css({
			backgroundImage:"url("+e.data.img+")",
			backgroundColor:"#"+e.data.color,
			backgroundRepeat:e.data.show,
			backgroundPosition:e.data.align
		});
	},
	css:function(e){
		var obj=$("#J_CSS");
		if(obj.length){
			obj.remove();
		}
		$('body').append("<style id='J_CSS'>"+e.data.data+"</style>")
	},
	text:function(e){
		$("#"+e.data.type+"_"+e.data.id).html(e.data.data);
	}
}
var special = new Special();
special.init();
