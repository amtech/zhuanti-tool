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

document.domain = "jiajuol.com";

function Special(data) {
	this.config = data;
	this.page = window.frames[0];
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
		_self.moduleEdit();
		_self.leftMenu();
		_self.addModule();
	},
	// 监听子页面
	listenerMessage: function() {
		var _self = this;
		window.addEventListener('message', function(e) {
			switch (e.data.type) {
				case "set_mod_height":
					_self.setModHeight(e.data.height);
					break;
			}
		}, false);
	},
	// 设置模块遮罩层高度
	setModHeight: function(d) {
		$.each(d, function(key, val) {
			document.getElementById(key).style.height = val + "px";
		})
	},
	// 模块排序
	modSort: function() {
		var sort = [],
			_self = this;
		$('#J_DesignModeShim .J_module').each(function(i, d) {
			sort.push(d.id);
		});
		_self.config.module.sort = sort;
		console.log("排序:", sort);
	},
	// 模块编辑
	moduleEdit: function() {
		var mod = [],
			_self = this,
			$box = $('#J_DesignModeShim'),
			$child = $box.children('div'),
			scroll = null,
			$jpage = $('#J_Page');

		$.each(_self.config.module.sort, function(i, d) {
			mod.push('<div class="J_module" id="' + d + '" data-id="' + _self.config.module[d].id + '" data-name="' + _self.config.module[d].name + '" data-type="' + _self.config.module[d].type + '">\
					<div class="btn-group">\
					  <button type="button" class="btn btn-default" data-type="up" title="向上"><i class="glyphicon glyphicon-arrow-up"></i></button>\
					  <button type="button" class="btn btn-default" data-type="down" title="向下"><i class="glyphicon glyphicon-arrow-down"></i></button>\
					  <button type="button" class="btn btn-default" data-type="edit" title="编辑"><i class="glyphicon glyphicon-pencil"></i></button>\
					  <button type="button" class="btn btn-danger" data-type="del" title="删除"><i class="glyphicon glyphicon-trash"></i></button>\
					</div>\
				</div>')
		});
		$child.html(mod.join(''));
		// $('#J_DesignModeShim').sortable( "destroy" );
		var dragIndex;
		$child.sortable({
			cursorAt: {
				left: 40,
				top: 40
			},
			helper: function(e, ui) {
				// console.log(ui)
				return "<li>" + ui.data('name') + "</li>"
			},
			appendTo: ".ui-drag-box",
			placeholder: "ui-sortable-placeholder",
			start: function(e, ui) {
				dragIndex = ui.item.index();
				ui.item.before('<div id="ui-item" style="height:' + ui.item.height() + 'px;margin-bottom:10px"></div>');
			},
			stop: function(e, ui) {
				$('#ui-item').remove();
				if (scroll) {
					clearInterval(scroll);
					scroll = null;
				}
				if (ui.item.index() > dragIndex) {
					// alert('下')
					_self.page.postMessage({
						type: "move",
						direction: "down",
						curIndex: ui.item.index(),
						modType: ui.item.data('type'),
						id: ui.item.data('id')
					}, '/');
					_self.modSort();
				} else if (ui.item.index() < dragIndex) {
					// alert('上')
					_self.page.postMessage({
						type: "move",
						direction: "up",
						curIndex: ui.item.index(),
						modType: ui.item.data('type'),
						id: ui.item.data('id')
					}, '/');
					_self.modSort();
				}
			},
			sort: function(e, ui) { //控制排序自动滚动视图
				if (ui.offset.top > $(window).height() - 100) {
					if (!scroll) {
						scroll = setInterval(function() {
							$jpage.scrollTop($jpage.scrollTop() + 10)
						}, 50)
					}
				} else if (ui.offset.top <= 200) {
					if (!scroll) {
						scroll = setInterval(function() {
							$jpage.scrollTop($jpage.scrollTop() - 10)
						}, 50)
					}
				} else {
					if (scroll) {
						clearInterval(scroll);
						scroll = null;
					}
				}
			}
		});

		//操作
		$box.off('click').on('click', '.btn', function() {
			var $this = $(this),
				$mod = $this.parents('.J_module'),
				type = $mod.data('type'),
				index = $mod.index();
			switch ($this.data('type')) {
				case "up":
					if (index > 0) {
						_self.page.postMessage({
							type: "move",
							direction: "up",
							curIndex: index - 1,
							modType: type,
							id: $mod.data('id')
						}, '/');
						$mod.prev('.J_module').before($mod);
						_self.modSort();
					}
					break;
				case "down":
					if (index < $mod.siblings('.J_module').length) {
						_self.page.postMessage({
							type: "move",
							direction: "down",
							curIndex: index + 1,
							modType: type,
							id: $mod.data('id')
						}, '/');
						$mod.next('.J_module').after($mod);
						_self.modSort();
					}
					break;
				case "edit":
					$('body').append($('#modal-' + type).html());
					var $modal = $("#modal");
					switch (type) {
						case "text":
							$modal.find('.J_ok').click(function() {
								_self.page.postMessage({
									type: "text",
									id: $mod.data('id'),
									data: $('.J_text').val()
								}, '/');
								$modal.modal('hide');
							});
							break;
						case "slider":
							var htm = [],
								$slideTable = $('.J_SlideTable');
							$.each(_self.config.module[$mod.attr('id')].data, function(i, d) {
								htm.push('<tr>\
									<td>\
						                <div class="input-group">\
						                  <input type="text" class="form-control input-sm" name="img" placeholder="图片地址" value="' + d.img + '">\
						                  <span class="input-group-btn">\
						                    <button class="btn btn-default btn-sm" type="button" title="上传图片"><i class="glyphicon glyphicon-upload"></i></button>\
						                  </span>\
						                </div>\
						              </td>\
						              <td><input type="text" class="form-control input-sm" name="url" placeholder="图片链接" value="' + d.url + '"></td>\
						              <td align="center">\
						                <div class="btn-group">\
						                  <button type="button" class="btn btn-default btn-sm J_ImgUp" title="向上"><i class="glyphicon glyphicon-arrow-up"></i></button>\
						                  <button type="button" class="btn btn-default btn-sm J_ImgDown" title="向下"><i class="glyphicon glyphicon-arrow-down"></i></button>\
						                  <button type="button" class="btn btn-default btn-sm J_ImgDel" title="删除"><i class="glyphicon glyphicon-remove"></i></button>\
						                </div>\
						              </td>\
									</tr>')
							});
							$slideTable.append(htm.join(''));
							// 向上
							$slideTable.on('click', '.J_ImgUp', function() {
								var $this = $(this),
									$tr = $this.parents('tr'),
									index = $tr.index();
								if (index > 1) {
									$slideTable.find('tr').eq(index - 1).before($tr);
								}
							});
							// 向下
							$slideTable.on('click', '.J_ImgDown', function() {
								var $this = $(this),
									$tr = $this.parents('tr'),
									index = $tr.index();
								if (index < $tr.siblings('tr').length) {
									$slideTable.find('tr').eq(index + 1).after($tr);
								}
							});
							//删除
							$slideTable.on('click', '.J_ImgDel', function() {
								var par = $(this).parents('tr');
								if ($slideTable.find('tr').length == 2) {
									alert('请至少保留一条数据')
								} else {
									par.remove();
								}
							});
							//添加图片
							$('.J_SlideAdd').click(function() {
								$slideTable.append('<tr>\
									<td>\
						                <div class="input-group">\
						                  <input type="text" class="form-control input-sm" name="img" placeholder="图片地址">\
						                  <span class="input-group-btn">\
						                    <button class="btn btn-default btn-sm" type="button" title="上传图片"><i class="glyphicon glyphicon-upload"></i></button>\
						                  </span>\
						                </div>\
						              </td>\
						              <td><input type="text" class="form-control input-sm" name="url" placeholder="图片链接"></td>\
						              <td align="center">\
						                <div class="btn-group">\
						                  <button type="button" class="btn btn-default btn-sm J_ImgUp" title="向上"><i class="glyphicon glyphicon-arrow-up"></i></button>\
						                  <button type="button" class="btn btn-default btn-sm J_ImgDown" title="向下"><i class="glyphicon glyphicon-arrow-down"></i></button>\
						                  <button type="button" class="btn btn-default btn-sm J_ImgDel" title="删除"><i class="glyphicon glyphicon-remove"></i></button>\
						                </div>\
						              </td>\
									</tr>')
							});
							// 保存
							$modal.find('.J_ok').click(function() {
								var id = $mod.attr('id'),
									h = $modal.find('.J_Height').val(),
									data = [];
								$slideTable.find('tr').each(function(i, d) {
									if (i == 0) return;
									data.push({
										img: $(d).find('[name=img]').val(),
										url: $(d).find('[name=url]').val()
									});
								});
								_self.config.module[id].height = h;
								_self.config.module[id].data = data;
								_self.page.postMessage({
									type: "slider",
									id: $mod.data('id'),
									height: h,
									data: _self.config.module[id]
								}, '/');
							});
							break;
					}
					$modal.modal('show').on('hide.bs.modal', function() {
						$(this).remove();
					});
					break;
				case "del":
					if ($('.J_module').length > 1) {
						_self.page.postMessage({
							type: "del",
							modType: type,
							id: $mod.data('id')
						}, '/');
						$mod.remove();
					} else {
						alert('至少应该保留一个模块！')
					}
					break;
			}
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
					over: function(e, ui) {
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
		var _self = this;
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
		$('#J_page_head,#J_page_footer').change(function() {
			if ($(this).val() == 2) {
				$(this).next('textarea').show();
			} else {
				$(this).next('textarea').hide();
			}
		});

		// 页面
		function bg() {
			$(this).parents("table").find(".onselected").removeClass("onselected").end().end().addClass("onselected");
			_self.page.postMessage({
				type: "bg",
				img: $(".J_PageBgImage").data('bg'),
				color: $("#colorsample-pickb").val(),
				show: $(".J_PageShowSelect.onselected").data('bg-show'),
				fixed: false,
				align: $(".J_PageAlignSelect.onselected").data('bg-align')
			}, '/');
		}

		// css
		function css() {
			window.frames[0].postMessage({
				type: "css",
				data: $('.J_CSSText').val()
			}, '/');
		}

		window.onload = function() {
			$(".J_PageShowSelect,.J_PageAlignSelect").click(bg); // bg();
			$('#J_CssSave').click(css);
		}
	}
}

/*
	待解决
	1、案例模块
	2、解决添加模块拖拽精确位置---够呛
*/

/*
	20170209
	1、自定义区编辑
	2、删除功能
	3、拖动排序、上下排序
	4、解决模块拖动 动态滚动窗口
	5、轮播图模块完整功能
*/



// $(e).imgUpload({
//        url:'/admin/api/upload/upload.php',
//        data:{
//            action:'ad'
//        },
//        before:function(e){
//            e.text('上传中...');
//        },
//        success:function(e,data){//当前对象，返回的完整数据
//            if (data.info.code == 100) {
//                e.text('选择文件');
//                var n=e.data('index'),_url=data.server+data.id;
//                $("#cover"+n).val(_url);
//                $('.coverPic'+n).attr({src:_url});
//            }else {
//                alert(data.info.message);
//                e.text('选择文件');
//            }
//        },
//        error:function(e){//当前对象
//            alert('接口异常！');
//            e.text('选择文件');
//        }
//    });