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
document.domain="jiajuol.com";
function Special(data) {
	this.config = data;
	this.mod_h=null;
	this.page=window.frames[0];
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
			_self.mod_h = e.data;
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
		function getH(d){
			try{
				return d.type=='case'?_self.mod_h[d.type+"_"+d.id].height-26:_self.mod_h[d.type+"_"+d.id].height;
			}catch(e){
				return 0;
			}
		}
		$.each(_self.config.modules, function(i, d) {
			mod.push('<div class="J_module" id="'+d.type+'_'+d.id+'" data-index="' + i + '" data-id="' + d.id + '" data-name="'+ d.name +'" data-type="'+ d.type +'" style="height:' + getH(d) + 'px;margin:0 auto 10px">\
					<div class="btn-group">\
					  <button type="button" class="btn btn-default mod-up" title="向上"><i class="glyphicon glyphicon-arrow-up"></i></button>\
					  <button type="button" class="btn btn-default mod-down" title="向下"><i class="glyphicon glyphicon-arrow-down"></i></button>\
					  <button type="button" class="btn btn-default mod-edit" title="编辑"><i class="glyphicon glyphicon-pencil"></i></button>\
					  <button type="button" class="btn btn-danger mod-del" title="删除"><i class="glyphicon glyphicon-trash"></i></button>\
					</div>\
				</div>')
		});
		$child.html(mod.join(''));
		// $('#J_DesignModeShim').sortable( "destroy" );
		$child.sortable({
			cursorAt: {
				left: 40,
				top: 40
			},
			helper: function(e,ui) {
				// console.log(ui)
				return "<li>"+ui.data('name')+"</li>"
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
		$box.off('click').on('click', '.mod-edit', function() {
			var $this=$(this).parents('.J_module'),type=$this.data('type');
			$('body').append($('#modal-'+type).html());

			switch(type){
				case "text":
					$("#modal").find('.J_ok').click(function(){
						// alert($('.J_text').val())
						window.frames[0].postMessage({
				       	   type:"text",
				       	   id:$this.data('id'),
				       	   data:$('.J_text').val()
				       	},'/');
					});
				break;
			}





			$('#modal').modal('show').on('hide.bs.modal',function(){
				$(this).remove();
			});
			return false;
		});
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
		var _self=this;
		// 层
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

		//头尾
		$('#J_page_head,#J_page_footer').change(function(){
			if($(this).val()==2){
				$(this).next('textarea').show();
			}else{
				$(this).next('textarea').hide();
			}
		});

		// 页面
		function bg(){
		   $(this).parents("table").find(".onselected").removeClass("onselected").end().end().addClass("onselected");
	       _self.page.postMessage({
	       	   type:"bg",
	       	   img:$(".J_PageBgImage").data('bg'),
	       	   color:$("#colorsample-pickb").val(),
	       	   show:$(".J_PageShowSelect.onselected").data('bg-show'),
	       	   fixed:false,
	       	   align:$(".J_PageAlignSelect.onselected").data('bg-align')
	       },'/');
		}

		// css
		function css(){
			window.frames[0].postMessage({
	       	   type:"css",
	       	   data:$('.J_CSSText').val()
	       	},'/');
		}







		window.onload=function(){
			$(".J_PageShowSelect,.J_PageAlignSelect").click(bg);// bg();
			$('#J_CssSave').click(css);
		}
	}
}
