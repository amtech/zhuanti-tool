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
		window.onload = function() {
			$('#J_PageToDesign,#J_DesignModeShim', window.parent.document).css({
				height: $('body').height(),
				width: "100%"
			});
			_self.postMessageModHeight();
		}
	},
	// 监听父层事件
	listenerMessage:function(){
		var _self = this;
		window.addEventListener('message', function(e) {
			if (e.source != window.parent) return;
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
				case "del":
					_self.del(e);
				break;
				case "move":
					_self.move(e);
				break;
			}
		}, false);
	},
	//通知父层模块遮罩层高度及顺序
	postMessageModHeight:function(){
		var data={
			type:"set_mod_height",
			height:{}
		};
		$('#content>div').each(function(i, e) {
			data.height[e.id]=$(e).height();
		})
		window.parent.postMessage(data, '*');
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
		this.postMessageModHeight();
	},
	del:function(e){
		$('#'+e.data.modType+"_"+e.data.id).remove();
	},
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
	}
}
var special = new Special();
special.init();
