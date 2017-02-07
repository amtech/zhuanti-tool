/* 
 * 可视化专题配置工具
 * 2017-2-6 
 */

function Special() {
}
Special.prototype = {
	init: function() {
		var _self = this;
		//控制父层iframe高度
		$(function() {
			$('#J_PageToDesign,#J_DesignModeShim', window.parent.document).css({
				height: $('body').height(),
				width: "100%"
			})
		});

		// 监听父层事件
		// window.addEventListener('message', function(e) {
		// 	if (e.source != window.parent) return;
		// 	window.parent.postMessage(e.data, '*');
		// }, false);

		// 通信
		window.onload = function() {
			var data={};
			$('#J_Box>div').each(function(i, e) {
				data[e.id]={};
				data[e.id] = {
					width: $(e).width(),
					height: $(e).height()
				}
			})
			window.parent.postMessage(data, '*');
		}
	}
}
var special = new Special();
special.init();
