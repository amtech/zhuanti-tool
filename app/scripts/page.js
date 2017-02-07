/* 
 * 可视化专题配置工具
 * 2017-2-6 
 */

function Special(data) {
	this.config = data;
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
		window.addEventListener('message', function(e) {
			if (e.source != window.parent) return;
			window.parent.postMessage(e.data, '*');
		}, false);

		// 通信
		window.onload = function() {
			$('#J_Box>div').each(function(i, e) {
				config.modules[i].size = {
					width: $(e).width(),
					height: $(e).height()
				}
			})
			window.parent.postMessage(config, '*');
		}
	}
}

