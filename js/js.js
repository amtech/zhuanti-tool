// 通信
// window.onload=function(){
//        window.frames[0].postMessage('getcolor','/');
// }

/*==========

问题:
1、左侧拖动与右侧排序冲突，解决办法：左侧拖动的时候执行右侧放置方法，拖动结束后销毁放置方法

===========*/ 

/* 
 * 可视化专题配置工具
 * 2017-2-6 
 */

function Special() {
	this.config = null;
}
Special.prototype = {
	init: function() {
		var _self = this;
		$(window).on('load resize', function() {
			$('#J_Page').height($(document).height() - 65)
		});
		$('#J_PageToDesign').on('load', function() {
			$(this).show();
		});

		_self.listenerMessage();
		_self.leftMenu();
	},
	// 监听子页面
	listenerMessage: function() {
		var _self = this;
		window.addEventListener('message', function(e) {
			_self.config = e.data;
			_self.moduleEdit();
			_self.addModule();
		}, false);
	},
	// 模块编辑
	moduleEdit: function() {
		var mod = [],
			_self = this,
			$box = $('#J_DesignModeShim'),
			$child = $box.children('div');
		$.each(_self.config.modules, function(i, d) {
			mod.push('<div class="J_module" data-index="' + i + '" data-id="' + d.id + '" style="height:' + d.size.height + 'px;margin:0 auto 10px">\
					<a href="" class="edit">编辑</a>\
				</div>')
		});
		$child.html(mod.join(''));
		// $('#J_DesignModeShim').sortable( "destroy" );
		$child.sortable({
			cursorAt: {
				left: 40,
				top: 40
			},
			helper: function() {
				return "<li>aaa</li>"
			},
			appendTo: ".ui-drag-box",
			placeholder: "ui-sortable-placeholder",
			start: function(e, ui) {
				console.log(ui)
				ui.item.before('<div id="ui-item" style="height:' + ui.item.height() + 'px;margin-bottom:10px"></div>');
			},
			stop: function(e, ui) {
				$('#ui-item').remove();
			}
		});
		$box.off('click').on('click', '.edit', function() {
			$('#myModal').modal('show');
			return false;
		})
	},
	// 添加模块
	addModule: function() {
		var dey;
		$(".module-list>li").draggable({
			helper: "clone",
			appendTo: ".ui-drag-box",
			start: function() {
				console.log('start');
				$("#J_DesignModeShim .J_module").droppable({
					drop: function(e, ui) {
						// alert( "dropped" );
						console.log(ui.draggable.data('modid'))
						$('.ui-sortable-placeholder').remove();
					},
					over: function() {
						$('.ui-sortable-placeholder').remove();
						if (dey) clearTimeout(dey);
						dey = setTimeout(function() {
							$('.ui-droppable-hover').after('<div class="ui-sortable-placeholder"></div>');
						}, 150)
					},
					out: function() {
						$('.ui-sortable-placeholder').remove();
					}
				});
			},
			stop: function() {
				console.log('stop');
				$("#J_DesignModeShim .J_module").droppable("destroy");
			}
		});


	},
	leftMenu: function() {
		$('.J_ToolBar').on('click', 'li', function() {
			var $this = $(this);
			$this.siblings('li').removeClass('selected');
			$this.toggleClass('selected');

			if ($this.hasClass('selected')) {
				$('.main-wrapper').addClass('wpst-toolbar-show');
			} else {
				$('.main-wrapper').removeClass('wpst-toolbar-show');
			}

			$('.J_ModuleSlides>li').eq($(this).index()).siblings('li').removeClass('selected').end().toggleClass('selected');
		});
		$('.J_ToolbarItemClose').click(function() {
			$('.J_ToolBar>li,.J_ModuleSlides>li').removeClass('selected');
			$('.main-wrapper').removeClass('wpst-toolbar-show');
		});
	}

}
var special = new Special();
special.init();