var Interface = {};

// 用于存放画冷却和动画的 canvas
Interface.cooldown_painter = {}
Interface.animation_painter = {}

/**
 * 用于通过递归方式读取json数据来创建页面
 * @param obj json转过来的对象数组
 * @param parent_id 当前要创建的内容的父id，可以为空
 */
function addContent(obj, parent_id) {
    for (var i = 0; i < obj.length; i++) {
        Interface.add_child(parent_id, obj[i]);
    }
}

/**
 * 根据 json 创建自定义界面
 * @param json_str 用于创建界面的 json 字符串
 */
Interface.create_custom_ui = function (json_str) {
    //$("#content").empty();
    $("#content").append("<canvas id='global-mask' \
        style='display:none;position:fixed;top:0;left:0;z-index:100000;pointer-events:none' \
        width='1920' height='1080' \
        ></canvas>");
    //$("#content-no-stretch").empty();
    $("#content-no-stretch").append("<canvas id='global-mask-no-stretch' \
        style='display:none;position:fixed;top:0;left:0;z-index:100000;pointer-events:none' \
        width='1920' height='1080' \
        ></canvas>");
    Interface.obj_jsonData = eval('(' + json_str + ')');//存储传过来的json数据
    addContent(Interface.obj_jsonData.content);//通过递归创建出页面
}

/**
 * 根据修改后的json重新布局，当分辨率修改后，修改每个最外层控件在页面中的位置
 * @param json_str 修改后的json字符串
 */
Interface.reLayout = function (json_str) {
    var jsonObj = eval('(' + json_str + ')');
    for (var i = 0; i < jsonObj.content.length; i++) {
        $("#" + jsonObj.content[i].id).css({
            "top": jsonObj.content[i].y + "px", "left": jsonObj.content[i].x + "px",
            "width": jsonObj.content[i].w + "px", "height": jsonObj.content[i].h + "px"
        });
    }
}

/**
 * 添加面板
 */
Interface.add_panel = function (obj, parent_id) {//添加panel控件
    var str = '<div class="panel panel-body" id="' + obj.id + '" ></div>';
    if (parent_id) {
        $("#" + parent_id).append(str);
    } else if ("no_stretch" in obj && obj.no_stretch) {
        $("#content-no-stretch").append(str);
    } else {
        $("#content").append(str);
    }
    var panel = $("#" + obj.id);

    panel.css({
        "position": "absolute", "top": parseInt(obj.y) + "px", "left": parseInt(obj.x) + "px",
        "width": parseInt(obj.w) + "px", "height": parseInt(obj.h) + "px"
    });
    if ("background_image" in obj) {
        if (obj.background_image == "") {
            panel.css("background", "transparent");
        } else {
            panel.css({
                "background": "url(" + obj.background_image + ")",
                "background-size": "100% 100%",
                "backround-repeat": "no-repeat"
            });
        }

    } else if ("border_image_slice" in obj) {
        panel.css({
            "border-image-slice": obj["border_image_slice"],
            "border-image-source": "url(" + obj["border_image_source"] + ")",
            "border-image-width": obj["border_image_width"]
        });
    } else {
        panel.css({
            "border-image-width": "2px 2px 2px 2px",
            "border-image-slice": "2 2 2 2 fill",
            "border-image-source": "url(image/tips.png)"
        })
    }
    if ("background_color" in obj) {
        panel.css("background", obj.background_color);
    }

    if ("auto_height" in obj) {
        if (obj["auto_height"]) {
            panel.css("height", "auto");
        }
    }

    if ("clip" in obj) {
        if (obj.clip) {
            panel.css("overflow", "hidden");
        }
    }

    if ("z_index" in obj) {
        panel.css("z-index", obj["z_index"]);
    }

    if ("position" in obj) {
        panel.css("position", obj.position);
    }

    if ("extra_class" in obj) {
        panel.addClass(obj.extra_class);
    }

    if ("show" in obj) {
        if (!obj["show"]) {
            panel.css("display", "none");
        }
    }

    if ("grid_layout" in obj) {
        if (obj["grid_layout"]) {
            panel.css("overflow", "auto");
        }
    }

    if ("disable_mouse_through" in obj) {
        if (obj["disable_mouse_through"]) {
            panel.attr("data-input-group", "disable-clickthrough");
        }
    }

    if ("animation_duration" in obj) {
        panel.css("-webkit-animation-duration", obj.animation_duration + "s");
    }

    if ("padding" in obj) {
        panel.css("padding", obj.padding);
    }

    if ("enable_scroll" in obj) {
        if (obj.enable_scroll) {
            panel.css("overflow", "auto");
        }
    }

    if ($("#cui_panel_style").length == 0) {
        $("head").append('<style type="text/css" id="cui_panel_style"></style>');
    }

    var panel_style = $("#cui_panel_style");
    if ("scroll_bar_color" in obj) {
        panel_style.append("#" + obj.id + "::-webkit-scrollbar-thumb{background-color:" + obj.scroll_bar_color + "}");
    }
    if ("scroll_bar_hover_color" in obj) {
        panel_style.append("#" + obj.id + "::-webkit-scrollbar-thumb:hover{background-color:" + obj.scroll_bar_hover_color + "}");
    }

    if ("has_tooltip" in obj) {
        if (obj["has_tooltip"]) {
            panel.on({
                mouseenter: function (event) {
                    engine.trigger("panel_mouse_enter", obj.id);
                },

                mouseleave: function (event) {
                    engine.trigger("panel_mouse_leave", obj.id);
                },
            })
        }
    }

    panel.on({
        click: function (event) {
            engine.trigger("panel_clicked", obj.id);
        }
    })

    return panel;

}

var ButtonEventHandler = function (btnId) {
    this.btnId = btnId;
}

ButtonEventHandler.prototype = {
    start: function () {
        var _this = this;
        var btnObj = {};
        $("#" + _this.btnId).on({
            mousedown: function (event) {
                engine.trigger("button_mousedown", _this.btnId);
                if ($("#" + _this.btnId).attr("enable") == "false") {
                    return;
                }
                _this.mousedown = true;
                var event = event || window.event;
                var image_src = "", drag_control;
                if ($(this).attr("drag-control") != undefined) {
                    drag_control = $("#" + $(this).attr("drag-control"));
                    img_src = drag_control.css("background-image");
                } else {
                    drag_control = $(this);
                    img_src = drag_control.css("background-image");
                }
                img_src = img_src.replace('url(', '').replace(')', '');
                var imgStr = '<img id="movePic" />';
                // 如果允许拖动，执行以下操作
                if ($("#" + _this.btnId).attr("enable-drag") && $("#" + _this.btnId).attr("enable-drag") == "true") {
                    _this.dragging = false;
                    if (event.which == 1) {
                        var oNear = null;
                        var button = $("#" + _this.btnId);
                        var top = 0, left = 0;
                        $("#content").append(imgStr);
                        top = event.pageY / Interface.h_factor - (drag_control.height() / 2);
                        left = event.pageX / Interface.w_factor - (drag_control.width() / 2);
                        $("#movePic").attr({ "src": img_src });
                        $("#movePic").css({
                            "position": "absolute",
                            "top": top,
                            "left": left,
                            "width": drag_control.width(),
                            "height": drag_control.height(),
                            "-webkit-mask-box-image": $("#" + _this.btnId).css("-webkit-mask-box-image"),
                            "pointer-events": "none",
                            "z-index": 9999,
                            "display": "none"
                        });
                        event.pageX = event.pageX / Interface.w_factor, event.pageY = event.pageY / Interface.h_factor;
                        var disX = event.pageX, disY = event.pageY;
                        $(document).mousemove(function (event) {
                            if (!_this.dragging) {
                                _this.dragging = true;
                                engine.trigger("button_begin_drag", _this.btnId);
                                //console.log("begin_drag");
                            }
                            var event = event || window.event;
                            btnObj.source_id = _this.btnId;
                            $("#movePic").fadeTo(0, 0.5);
                            $("#movePic").css({ "position": "absolute", "z-index": 9999, "display": "block" });
                            event.pageX = event.pageX / Interface.w_factor, event.pageY = event.pageY / Interface.h_factor;
                            $("#movePic").css(
                                {
                                    top: (top + event.pageY - disY) + "px",
                                    left: (left + event.pageX - disX) + "px"
                                });
                            var json = {
                                button_id: _this.btnId,
                                new_icon_id: "movePic",
                                x: Math.floor(event.pageX - (drag_control.width() / 2)),
                                y: Math.floor(event.pageY )
                            };
                            engine.trigger("button_update_drag",JSON.stringify(json)); 

                            return false;

                        }).mouseup(function (event) {
                            oNear = _this.findNearest($("#movePic"), $("#" + _this.btnId));
                            $("#movePic").remove();
                            $(document).unbind("mousemove");
                            $(document).unbind("mouseup");
                            if (oNear && oNear.hasClass("cui_button")) {
                                btnObj.target_id = oNear[0].id;
                                var btn_jsonStr = JSON.stringify(btnObj);
                                engine.trigger("button_drag_and_drop", btn_jsonStr);
                            }

                            if (!oNear) {
                                btnObj.target_id = null;
                                var btn_jsonStr = JSON.stringify(btnObj);
                                engine.trigger("button_drag_and_drop", btn_jsonStr);
                            }

                            //console.log("end_drag");
                            //console.log(_this.dragging);
                        });

                    }
                } else {

                }
            },

            mouseup: function (event) {
                engine.trigger("button_mouseup", _this.btnId);
                if ($("#" + _this.btnId).attr("enable") == "false") {
                    return;
                }
                if (event.which == 1 && !_this.dragging && _this.mousedown) {
                    engine.trigger("button_clicked", _this.btnId);
                    Interface.toggle_button(_this.btnId);
                }
                if (event.which == 3) {
                    engine.trigger("button_right_clicked", _this.btnId);
                }
                _this.dragging = false;
                _this.mousedown = false;
            },

            mouseenter: function (event) {
                engine.trigger("button_mouse_enter", _this.btnId);
            },

            mouseleave: function (event) {
                engine.trigger("button_mouse_leave", _this.btnId);
            },

            dblclick: function (event) {
                engine.trigger("button_double_clicked", _this.btnId);
            }
        });
    },
    getDistance: function (obj1, obj2) {
        if (obj1 && obj2) {
            var a = (obj1.offset().left + obj1[0].offsetWidth / 2) - (obj2.offset().left + obj2[0].offsetWidth / 2);
            var b = (obj1.offset().top + obj1[0].offsetHeight / 2) - (obj2.offset().top + obj2[0].offsetHeight / 2);
            return Math.sqrt(a * a + b * b);
        }
    },
    isOverlapped: function (obj1, obj2) {
        var l1 = obj1.offset().left;
        var t1 = obj1.offset().top;
        var r1 = l1 + obj1.width();
        var b1 = t1 + obj1.height();
        var l2 = obj2.offset().left;
        var t2 = obj2.offset().top;
        var r2 = l2 + obj2.width();
        var b2 = t2 + obj2.height();
        return !(r1 < l2 || l1 > r2 || b1 < t2 || t1 > b2);
    },
    findNearest: function (obj, btn) {
        if (obj) {
            var distances = [], buttons = btn.parent().children(".cui_button");
            if (btn.hasClass("cui_button_group_item")) {
                //buttons = btn.parent().parent().children(".cui_button_group_item_container").children(".cui_button");
                buttons = $(".cui_button");
            }
            for (var i = 0; i < buttons.length; i++) {
                if (this.isOverlapped(obj, $(buttons[i])))
                    distances[i] = this.getDistance(obj, $(buttons[i]));
                else
                    distances[i] = -1;
            }
            var index = -1;
            var minDistance = Number.MAX_VALUE;
            for (var i = 0; i < distances.length; i++) {
                if (distances[i] < minDistance && distances[i] > 0) {
                    minDistance = distances[i];
                    index = i;
                }
            }
            if (minDistance != Number.MAX_VALUE) {
                return $(buttons[index]);
            } else {
                return null;
            }
        }
    }
};

/**
 * 添加按钮 
 */
Interface.add_button = function (obj, parent_id, exist_button) {

    if (exist_button == undefined) {
        var str = '<button type="button" class="cui_button ' + obj.id + '_class" id="' + obj.id + '"></button>';
        if (parent_id) {
            $("#" + parent_id).append(str);
        } else {
            $("#content").append(str);
        }
    } else {
        exist_button.attr("id", obj.id);
        exist_button.addClass(obj.id + "_class");
    }

    var button = $("#" + obj.id);
    if (obj.enable_drag || obj.enable_drag == "true") {
        button.attr({ "enable-drag": "true" });
    } else {
        button.attr({ "enable-drag": "false" });
    }

    button.css({
        "position": "absolute",
        "top": parseInt(obj.y) + "px",
        "left": parseInt(obj.x) + "px",
        "width": parseInt(obj.w) + "px",
        "height": parseInt(obj.h) + "px"
    });

    var style_tag_name = "#" + obj.id + "_style";
    if ($(style_tag_name).length == 0) {
        $("head").append('<style type="text/css" id="' + obj.id + "_style" + '"></style>');
    }

    if ("image_pos" in obj) {
        button.css({
            "background-size": obj.image_pos.w + "px " + obj.image_pos.h + "px",
            "background-position": obj.image_pos.x + "px " + obj.image_pos.y + "px",
            "background-repeat": "no-repeat"
        })
    } else {
        button.css({
            "background-size": "100% 100%",
            "background-repeat": "no-repeat"
        })
    }

    if ("drag_control" in obj) {
        button.attr("drag-control", obj.drag_control);
    }

    var button_style = $(style_tag_name)

    if (obj.normal_image) {
        button_style.append('.' + obj.id + '_class{background-image:url(' + obj.normal_image + ');}');
        Interface.preload_image(obj.normal_image);
    }

    if (obj.hover_image) {
        button_style.append('.' + obj.id + '_class:hover {background-image:url(' + obj.hover_image + ');}');
        Interface.preload_image(obj.hover_image);
    }

    if (obj.active_image) {
        button_style.append('.' + obj.id + '_class:active {background-image:url(' + obj.active_image + ');}');
        Interface.preload_image(obj.active_image);
    }

    if (obj.disable_image) {
        button_style.append('.' + obj.id + '_class_disable {background-image:url(' + obj.disable_image + ');}');
        button.attr("enable", "true");
        Interface.preload_image(obj.disable_image);
    }

    // toggle 类型
    if (obj.toggle && obj.toggle_image) {
        button.attr("toggle", "true");
        button_style.append('.' + obj.id + '_class_toggle {background-image:url(' + obj.toggle_image + ');}');
        Interface.preload_image(obj.toggle_image);
    }

    if ("show" in obj) {
        if (!obj["show"]) {
            button.css("display", "none");
        }
    }

    // mask
    if (obj.mask) {
        button.css("-webkit-mask-box-image", "url(" + obj.mask + ") stretch");
    }

    // z-index
    if (obj["z_index"]) {
        button.css("z-index", obj["z_index"]);
    }

    if (obj["text"]) {
        var str = "<div class='cui_button_text'>" + obj.text + "</div>";
        button.append(str);
    }

    var buttonText = button.children(".cui_button_text");
    buttonText.css(
        {
            "top": 0,
            "botton": 0,
            "left": 0,
            "right": 0,
            "width": parseInt(obj.w) + "px",
            "height": parseInt(obj.h) + "px",
            "line-height": parseInt(obj.h) + "px"
        });

    if (obj["color"]) {
        buttonText.css("color", obj["color"]);
    }

    if ("font_weight" in obj) {
        buttonText.css("font-weight", obj["font_weight"]);
    } else {
        buttonText.css("font-weight", "normal");
    }

    if ("font_family" in obj) {
        buttonText.css("font-family", obj["font_family"]);
    }

    if ("font_size" in obj) {
        buttonText.css({ "font-size": obj["font_size"] + "px" });
    }

    if ("border" in obj) {
        button.css("border", obj["border"]);
    }

    if ("disable_mouse_through" in obj) {
        if (obj["disable_mouse_through"]) {
            button.attr("data-input-group", "disable-clickthrough");
        }
    }

    // 按钮被点击和拖拽时要派发事件给 lua
    // 参数为 button 的 id
    var event_handler = new ButtonEventHandler(obj.id);
    event_handler.start();

    var add_canvas = function () {
        if (button.children("canvas").length == 0) {
            // 添加冷却的 canvas
            str = '<canvas class="cooldown"></canvas>';
            button.append(str);
            Interface.cooldown_painter[obj.id] = new Cooldown(button);
        }
    }


    if ("cool_down_revert" in obj) {
        add_canvas();
        if (obj["cool_down_revert"]) {
            Interface.cooldown_painter[obj.id].setRevert(true);
        }
    }

    if ("cool_down_show_text" in obj) {
        add_canvas();
        Interface.cooldown_painter[obj.id].setShowText(obj["cool_down_show_text"]);
    }

    if ("cool_down_font_size" in obj) {
        add_canvas();
        Interface.cooldown_painter[obj.id].setFontSize(obj["cool_down_font_size"]);
    }

    if ("mask_image" in obj) {
        add_canvas();
        Interface.cooldown_painter[obj.id].setMaskImage(obj["mask_image"]);
    }

    if ("mask_line" in obj) {
        add_canvas();
        Interface.cooldown_painter[obj.id].setMaskLine(obj["mask_line"]);
    }

    if ("mask_gray" in obj) {
        add_canvas();
        Interface.cooldown_painter[obj.id].setMaskGray(obj["mask_gray"]);
    }

    if ("mask_type" in obj) {
        add_canvas();
        Interface.cooldown_painter[obj.id].setMaskType(obj["mask_type"]);
    }

    if ("animation_duration" in obj) {
        button.css("-webkit-animation-duration", obj.animation_duration + "s");
    }

    // 去除空格键的默认效果
    button.on("keydown", function (e) {
        //console.log(e.which);
        e.preventDefault();
    });

    return button;

}

/**
 * 圆形进度条
 */
Interface.add_rounded_progress_bar = function (obj, parent_id) {

    var str = '<div class="cui_rounded_progress_bar" id="' + obj.id + '"></div>';
    if (parent_id) {
        $("#" + parent_id).append(str);
    } else {
        $("#content").append(str);
    }
    var progress = $("#" + obj.id);

    progress.css({
        "position": "absolute", "top": parseInt(obj.y) + "px", "left": parseInt(obj.x) + "px",
        "width": parseInt(obj.w) + "px", "height": parseInt(obj.h) + "px"
    });

    // mask
    if (obj.mask) {
        progress.css("-webkit-mask-box-image", "url(" + obj.mask + ") stretch");
    }

    // z-index
    if (obj["z_index"]) {
        progress.css("z-index", obj["z_index"]);
    }

    progress.css("pointer-events", "none");

    // 使用冷却作为进度来展示
    str = '<canvas class="cooldown"></canvas>';
    progress.append(str);

    Interface.cooldown_painter[obj.id] = new Cooldown(progress);
    Interface.cooldown_painter[obj.id].setRotate(Math.PI / 2);
    Interface.cooldown_painter[obj.id].setIncircle(true);

    if (obj["font_size"]) {
        Interface.cooldown_painter[obj.id].setFontSize(obj.font_size);
    }

    if (obj["font_color"]) {
        Interface.cooldown_painter[obj.id].setFontColor(obj.font_color);
    }

    if (obj["mask_type"]) {
        Interface.cooldown_painter[obj.id].setMaskType(obj.mask_type);
    }

    if (obj["mask_line"]) {
        Interface.cooldown_painter[obj.id].setMaskLine(obj.mask_line);
    }

    if (obj["mask_gray"]) {
        Interface.cooldown_painter[obj.id].setMaskGray(obj.mask_gray);
    }

    if (obj.color) {
        Interface.cooldown_painter[obj.id].setColor(obj.color);
        //Interface.cooldown_painter[obj.id].setShowText(false);
    }

    if (obj.cool_down_revert) {
        Interface.cooldown_painter[obj.id].setRevert(obj.cool_down_revert);
    }

    if (obj.mask_image) {
        Interface.cooldown_painter[obj.id].setMaskImage(obj.mask_image);
    }

    if ("process_type" in obj) {
        Interface.cooldown_painter[obj.id].setProcessType(obj["process_type"]);
    }

    if ("disable_mouse_through" in obj) {
        if (obj["disable_mouse_through"]) {
            progress.attr("data-input-group", "disable-clickthrough");
        }
    }

    return progress;
}

/**
 * 按钮组，如背包
 */
Interface.add_button_group = function (obj, parent_id) {//添加按钮组控件
    var str = '<div id="' + obj.id + '"class="cui_button_group"></div>';
    if (parent_id) {
        $("#" + parent_id).append(str);
    } else {
        $("#content").append(str);
    }

    var button_group = $("#" + obj.id);
    button_group.css({
        "position": "absolute",
        "overflow": "auto",
        "top": parseInt(obj.y) + "px",
        "left": parseInt(obj.x) + "px",
        "width": parseInt(obj.w) + "px",
        "height": parseInt(obj.h) + "px",
        "display": "inline-block"
    });

    button_group.attr("data-index", "0");
    var count = obj.item_count;

    for (var i = 0; i < count; i++) {
        var item_str = '<div class="cui_button_group_item_container" id="' + obj.id + '_container' + i + '"><div class="cui_button cui_button_group_item"></div></div>';
        button_group.append(item_str);
    }

    var container = button_group.children(".cui_button_group_item_container");
    var buttons = container.children(".cui_button");

    // 设置按钮组里面的按钮的样式
    container.css({
        "position": "relative",
        "width": parseInt(obj.item_width) + "px",
        "height": parseInt(obj.item_height) + "px",
        "margin": "5px 0px 0px 5px",
        "padding": "0px 0px 0px 0px",
        "display": "inline-block"
    });
    buttons.css({
        "position": "absolute",
        "top": "0px",
        "left": "0px",
        "width": parseInt(obj.item_width) + "px",
        "height": parseInt(obj.item_height) + "px",
        "margin": "0px 0px 0px 0px"
    })

    if ("item_background_image" in obj) {
        container.css({
            "background-image": "url(" + obj.item_background_image + ")",
            "background-size": "100% 100%",
            "background-repeat": "no-repeat"
        });
    }

    if ("disable_mouse_through" in obj) {
        if (obj["disable_mouse_through"]) {
            button_group.attr("data-input-group", "disable-clickthrough");
        }
    }

    if (obj["z_index"]) {
        button_group.css("z-index", obj["z_index"]);
    }
}

/**
 * 进度条
 */
Interface.add_progress_bar = function (obj, parent_id) {//添加进度条控件
    var str = '<div class="cui_progress" id="' + obj.id + '"><div class="container"><span class="bg"></span></div><span class="text" style="background-color:transparent">1/1</span></div>';
    if (parent_id) {
        $("#" + parent_id).append(str);
    } else {
        $("#content").append(str);
    }

    var progress = $("#" + obj.id);
    progress.css({
        "position": "absolute",
        "top": parseInt(obj.y) + "px",
        "left": parseInt(obj.x) + "px",
        "width": parseInt(obj.w) + "px",
        "height": parseInt(obj.h) + "px",
        "text-align": "center",
        "color": "white",
        "line-height": parseInt(obj.h) + "px",
    });

    if ("color" in obj) {
        progress.children(".text").css("color", obj.color);
    }

    if ("font_family" in obj) {
        progress.children(".text").css("font-family", obj["font_family"]);
    }

    if ("font_size" in obj) {
        progress.children(".text").css({ "font-size": obj["font_size"] + "px", "line-height": obj["font_size"] + "px" });
    }

    if ("font_weight" in obj) {
        progress.children(".text").css("font-weight", obj["font_weight"]);
    } else {
        progress.children(".text").css("font-weight", "normal");
    }

    progress.attr("max_value", "1");
    progress.attr("current_value", "0");

    var progress_container = progress.children('.container');

    progress_container.css({
        position: 'absolute',
        top: '0px',
        bottom: '0px',
        left: '0px',
        right: '0px'
    });

    var progress_bg = progress_container.children(".bg");
    progress_bg.css({
        position: 'absolute',
        top: '0px',
        bottom: '0px',
        left: '0px',
        width: '100%'
    })

    if ('invert' in obj && obj.invert) {
        progress_container.css('-webkit-transform', 'scaleX(-1)');
    }

    var text = progress.children('.text');
    text.css({
        position: 'absolute',
        top: '0',
        bottom: '0',
        left: '0',
        right: '0',
        bottom: '0'
    })

    if ("background_image" in obj) {
        progress_bg.css({
            "background-image": "url(" + obj["background_image"] + ")",
            "background-size": obj.w + 'px ' + obj.h + 'px',
            "backround-repeat": "no-repeat"
        })
    }
    if ("z_index" in obj) {
        progress.css("z-index", obj["z_index"]);
    }

    if ("show_text" in obj) {
        if (!(obj["show_text"])) {
            progress.children(".text").css("display", "none");
        }
    }

    if ("head_animation" in obj) {

        var progress_head_str = '<div class="cui_progress_head"></div>'
        progress_container.append(progress_head_str);
        var progress_head = progress_container.children(".cui_progress_head");
        progress_head.css({
            "position": "absolute",
            "top": "-3px",
            "left": "0%",
            "width": "25px",
            "height": parseInt(obj.h) + 6 + "px",
            "background-image": "url(" + obj["head_animation"] + ")",
            "-webkit-animation": obj.id + "_animation .6s steps(" + obj["head_animation_count"] + ") infinite"
        });

        if ($("#cui_progress_bar_style").length == 0) {
            $("head").append('<style type="text/css" id="cui_progress_bar_style"></style>');
        }

        var progress_style = $("#cui_progress_bar_style");
        progress_style.append("@keyframes " + obj.id
            + "_animation {from {background-position:0px;} to {background-position:"
            + parseInt(obj["head_animation_count"]) * 25 + "px;}}");

    }

    if ("disable_mouse_through" in obj) {
        if (obj["disable_mouse_through"]) {
            progress.attr("data-input-group", "disable-clickthrough");
        }
    }

    return progress;
}

/**
 * 标签
 */
Interface.add_label = function (obj, parent_id) {
    if (!("text" in obj))
        obj.text = "";

    var str = '<div class="label" id="' + obj.id + '">' + obj.text + '</div>';
    if (parent_id) {
        $("#" + parent_id).append(str);
    } else {
        $("#content").append(str);
    }

    var label = $("#" + obj.id);

    label.css({
        "position": "absolute",
        "display": "inline-block",
        "top": parseInt(obj.y) + "px",
        "left": parseInt(obj.x) + "px",
        "text-align": "center"
    });

    if ("w" in obj) {
        label.css("width", obj.w + "px");
    } else {
        label.css("position", "relative");
    }

    if ("h" in obj) {
        label.css("height", obj.h);
    } else {
        label.css({
            "position": "relative",
            "height": "auto",
            "display": "block",
            "margin-top": obj.y + "px",
            "margin-left": obj.x + "px",
            "top": "0px",
            "left": "0px"
        });
    }

    if ("text_shadow" in obj) {
        label.css("text-shadow", obj["text_shadow"])
    }

    if ("font_weight" in obj) {
        label.css("font-weight", obj["font_weight"]);
    } else {
        label.css("font-weight", "normal");
    }

    if ("normal_image" in obj) {
        if (obj.normal_image == "") {
            label.css("background-image", "none");
        } else {
            label.css("background-image", "url(" + obj.normal_image + ")");
        }

    } else {
        label.css("background-image", "none");
    }

    label.css({
        "background-size": "100% 100%",
        "background-repeat": "no-repeat"
    });

    if ("border_image_slice" in obj) {
        label.css({
            "border-image-slice": obj["border_image_slice"],
            "border-image-source": "url(" + obj["border_image_source"] + ")",
            "border-image-width": obj["border_image_width"],
            "border-width": obj["border_image_width"]
        });
    }

    // mask
    if (obj.mask) {
        label.css("-webkit-mask-box-image", "url(" + obj.mask + ") stretch");
    }


    if ("color" in obj) {
        label.css("color", obj.color);
    }

    if ("font_family" in obj) {
        label.css("font-family", obj["font_family"]);
    }

    if ("font_size" in obj) {
        label.css({ "font-size": obj["font_size"] + "px", "line-height": obj["font_size"] + 5 + "px" });
    }

    if ("text_align" in obj) {
        label.css("text-align", obj["text_align"]);
    } else {
        label.css("line-height", obj.h + "px");
    }

    if ("line_height" in obj) {
        label.css("line-height", obj.line_height + "px");
    }

    if ("vertical_align" in obj) {
        label.attr("display-type", "flex");
        label.css({
            "display": "flex",
            "align-items": obj["vertical_align"],
            "justify-content": obj["vertical_align"]
        });
    }

    if ("show" in obj) {
        if (!obj["show"]) {
            label.css("display", "none");
        }
    }

    if ("animation_duration" in obj) {
        label.css("-webkit-animation-duration", obj.animation_duration + "s");
    }

    // z-index
    if (obj["z_index"]) {
        label.css("z-index", obj["z_index"]);
    }

    // 添加动画效果 canvas
    if ("enable_animation" in obj) {
        if (obj["enable_animation"]) {
            str = '<canvas class="animation"></canvas>'
            label.append(str);
            Interface.animation_painter[obj.id] = new Animation(label);
        }

        if ("show_animation_last_frame" in obj) {
            if (obj["show_animation_last_frame"]) {
                Interface.animation_painter[obj.id].setShowLastFrame(true);
            }
        }
    }

    if ("has_tooltip" in obj) {
        if (obj["has_tooltip"]) {
            label.css("pointer-events", "auto");
            label.on({
                mouseenter: function (event) {
                    engine.trigger("label_mouse_enter", obj.id);
                },

                mouseleave: function (event) {
                    engine.trigger("label_mouse_leave", obj.id);
                },
            })
        }
    }

    if ("disable_mouse_through" in obj) {
        if (obj["disable_mouse_through"]) {
            label.attr("data-input-group", "disable-clickthrough");
        }
    }

    if ("model_view" in obj) {
        if (obj.model_view) {
            var size = Math.max(obj.w, obj.h);
            label.append('<img src="liveview://model-preview" />');
            var model_view = label.children("img");
            model_view.css({
                "position": "absolute",
                "display": "inline-block",
                "top": ((obj.h - size) / 2) + "px",
                "left": ((obj.w - size) / 2) + "px",
                "width": size + "px",
                "height": size + "px"
            });
        }
    }

    return label;
}

/**
 * 添加画布
 */
Interface.add_canvas = function (obj, parent_id) {

    var str = '<canvas class="cui_canvas" id="' + obj.id + '">' + obj.text + '</div>';

    if (parent_id) {
        $("#" + parent_id).append(str);
    } else {
        $("#content").append(str);
    }

    var canvas = $("#" + obj.id);
    canvas.css({
        "position": "absolute",
        "display": "inline-block",
        "top": parseInt(obj.y) + "px",
        "left": parseInt(obj.x) + "px",
        "text-align": "center"
        //"background-color": "rgba(255, 0, 0, 0.2)"
    });

    if ("background_color" in obj) {
        canvas.css("background-color", obj["background_color"]);
    }

    if ("disable_mouse_through" in obj) {
        if (obj["disable_mouse_through"]) {
            canvas.attr("data-input-group", "disable-clickthrough");
        }
    }

    canvas.attr("width", parseInt(obj.w));
    canvas.attr("height", parseInt(obj.h));

    // z-index
    if (obj["z_index"]) {
        canvas.css("z-index", obj["z_index"]);
    }

    // 绑定鼠标消息
    canvas.bind("mousedown", function (event) {
        var canvasLeft = canvas[0].offsetLeft;
        var canvasTop = canvas[0].offsetTop;
        var json = {
            canvas_id: obj.id,
            x: Math.floor(event.pageX / Interface.w_factor - canvasLeft),
            y: Math.floor(event.pageY / Interface.h_factor - canvasTop)
        };
        if (event.which == 1) {
            engine.trigger("canvas_clicked", JSON.stringify(json));
            engine.trigger("canvas_mousedown", JSON.stringify(json));
            //alert(JSON.stringify(json));
        } else if (event.which == 3) {
            engine.trigger("canvas_right_clicked", JSON.stringify(json));
            //alert(JSON.stringify(json));
        }
    });

    canvas.bind("mousemove", function (event) {
        var canvasLeft = canvas[0].offsetLeft;
        var canvasTop = canvas[0].offsetTop;
        var json = {
            canvas_id: obj.id,
            x: Math.floor(event.pageX / Interface.w_factor - canvasLeft),
            y: Math.floor(event.pageY / Interface.h_factor - canvasTop)
        };
        engine.trigger("canvas_mousemove", JSON.stringify(json));
    });

    canvas.bind("mouseup", function (event) {
        var canvasLeft = canvas[0].offsetLeft;
        var canvasTop = canvas[0].offsetTop;
        var json = {
            canvas_id: obj.id,
            x: Math.floor(event.pageX / Interface.w_factor - canvasLeft),
            y: Math.floor(event.pageY / Interface.h_factor - canvasTop)
        };
        if (event.which == 1) {
            engine.trigger("canvas_mouseup", JSON.stringify(json));
        }
    });

    // 鼠标滚轮
    canvas.bind("mousewheel", function (event, delta) {
        var json = {
            canvas_id: obj.id,
            delta: event.originalEvent.deltaY,
        }
        engine.trigger("canvas_mouse_wheel", JSON.stringify(json));
    });

    canvas.bind("mouseleave", function (event) {
        var json = {
            canvas_id: obj.id,
        }
        engine.trigger("canvas_mouseleave", JSON.stringify(json));
    });

    canvas.bind("mouseenter", function (event) {
        var json = {
            canvas_id: obj.id,
        }
        engine.trigger("canvas_mouseenter", JSON.stringify(json));
    });

    return canvas;
}

/**
 * 添加视频
 */
Interface.add_video = function (obj, parent_id) {

    if (typeof (obj.video_path) == "undefined")
        obj.video_path = "";

    var str = '<div class="cui_video" id="' + obj.id + '"><video><source src="' + obj.video_path + '" type="video/webm" /></video></div>';

    if (parent_id) {
        $("#" + parent_id).append(str);
    } else {
        $("#content").append(str);
    }

    var container = $("#" + obj.id);
    container.css({
        "position": "absolute",
        "display": "inline-block",
        "top": parseInt(obj.y) + "px",
        "left": parseInt(obj.x) + "px",
        "width": parseInt(obj.w) + "px",
        "height": parseInt(obj.h) + "px"
    });

    var video = container.children("video");
    video.css({
        "position": "absolute",
        "display": "inline-block",
        "top": "0px",
        "left": "0px",
        "object-fit": "fill"
    });

    if ("z_index" in obj) {
        video.css("z-index", obj["z_index"]);
    }

    video.attr("width", parseInt(obj.w));
    video.attr("height", parseInt(obj.h));


    return video;
}

/**
 * 添加输入框
 */
Interface.add_input = function (obj, parent_id) {

    var str = '<input type="text" id="' + obj.id + '" class="cui_input"></input>';

    if (parent_id) {
        $("#" + parent_id).append(str);
    } else {
        $("#content").append(str);
    }

    var input = $("#" + obj.id);

    input.css({
        "position": "absolute",
        "display": "inline-block",
        "top": parseInt(obj.y) + "px",
        "left": parseInt(obj.x) + "px",
        "width": parseInt(obj.w) + "px",
        "height": parseInt(obj.h) + "px",
        "text-align": "center",
        "padding": "0px"
    });

    if ("text_shadow" in obj) {
        input.css("text-shadow", obj["text_shadow"])
    }

    if ("font_weight" in obj) {
        input.css("font-weight", obj["font_weight"]);
    } else {
        input.css("font-weight", "normal");
    }

    if ("normal_image" in obj) {
        if (obj.normal_image == "") {
            input.css("background-image", "none");
        } else {
            input.css("background-image", "url(" + obj.normal_image + ")");
        }

    } else {
        input.css("background-image", "none");
        input.css("background-color", "transparent");
    }

    input.css({
        "background-size": "100% 100%",
        "background-repeat": "no-repeat",
        "border-style": "solid"
    });

    if ("border_color" in obj) {
        input.css("border-color", obj.border_color);
    }

    if ("border_width" in obj) {
        input.css("border-width", obj.border_width);
    }

    if ("border_width" in obj) {
        input.css("border-width", obj.border_width);
    }

    if ("color" in obj) {
        input.css("color", obj.color);
    }

    if ("font_family" in obj) {
        input.css("font-family", obj["font_family"]);
    }

    if ("font_size" in obj) {
        input.css({ "font-size": obj["font_size"] + "px", "line-height": obj["font_size"] + 5 + "px" });
    }

    if ("text_align" in obj) {
        input.css("text-align", obj["text_align"]);
    } else {
        input.css("line-height", obj.h + "px");
    }

    if ("line_height" in obj) {
        input.css("line-height", obj.line_height + "px");
    }

    if ("show" in obj) {
        if (!obj["show"]) {
            input.css("display", "none");
        }
    }

    // z-index
    if (obj["z_index"]) {
        input.css("z-index", obj["z_index"]);
    }

    if ("disable_mouse_through" in obj) {
        if (obj["disable_mouse_through"]) {
            input.attr("data-input-group", "disable-clickthrough");
        }
    }

    input.on('input', function () {
        var info = {
            id: obj.id,
            text: input.val()
        };
        engine.trigger('input_text_changed', JSON.stringify(info));
    }).focus(function () {
        engine.trigger('input_get_focus', obj.id);
    }).blur(function () {
        engine.trigger('input_lose_focus', obj.id);
    })
}

/**
 * 显示控件
 * @param control_id 控件id
 */
Interface.show = function (control_id) {
    $("#" + control_id).css("display", '');
    if ($("#" + control_id).attr("display-type") == "flex") {
        $("#" + control_id).css("display", "flex");
    }
}

/**
 * 显示控件（带动画效果)
 * @param control_id 控件id
 * @param animation 动画效果名称
 */
Interface.show_with_animation = function (control_id, animation) {
    if ($("#" + control_id).is(":hidden")) {
        $("#" + control_id).animateCss(animation);
        Interface.show(control_id);
    }
}

/**
 * 隐藏控件
 * @param control_id 控件id
 */
Interface.hide = function (control_id) {
    $("#" + control_id).css("display", 'none');
}

/**
 * 隐藏控件（带动画效果)
 * @param control_id 控件id
 * @param animation 动画效果名称
 */
Interface.hide_with_animation = function (control_id, animation) {
    if ($("#" + control_id).is(":visible")) {
        $("#" + control_id).animateCss(animation, function () {
            Interface.hide(control_id);
        });
    }
}

/**
 * 展示动画效果（不涉及到控件隐藏和显示）
 * @param control_id 控件 id
 * @param animation 动画效果名称
 */
Interface.show_animation = function (control_id, animation) {
    $("#" + control_id).animateCss(animation);
}

/**
 * 切换按钮的开关状态
 * @param button_id 按钮 id
 */
Interface.toggle_button = function (button_id) {
    var button = $("#" + button_id);
    if (button.attr("toggle") == "true") {
        var button_class = button_id + "_class";
        var toggle_class = button_class + "_toggle";
        if (button.hasClass(toggle_class)) {
            button.removeClass(toggle_class);
            button.addClass(button_class);
        } else {
            button.removeClass(button_class);
            button.addClass(toggle_class);
        }
    }
}

/**
 * 设置按钮的开关状态
 * @param button_id 按钮 id
 * @param toggle 开关状态
 */
Interface.set_toggle = function (button_id, toggle) {
    var button = $("#" + button_id);
    if (button.attr("toggle") == "true") {
        var button_class = button_id + "_class";
        var toggle_class = button_class + "_toggle";
        button.removeClass(button_class);
        button.removeClass(toggle_class);

        if (toggle != "true") {
            button.addClass(button_class);
        } else {
            button.addClass(toggle_class);
        }
    }
}

/**
 * 设置按钮的启用状态
 * @param button_id 按钮 id
 * @param enable 启用状态
 * @param reason 原因
 */
Interface.set_enable = function (button_id, enable, reason) {

    var button = $("#" + button_id);

    if (button.attr("enable") == undefined) {
        if (enable == "true") {
            button.removeClass("cui_button_disabled");
            button.removeClass("cui_button_need_mp");
        } else if (enable == "false") {
            if (reason == "mp") {
                button.removeClass("cui_button_disabled");
                button.addClass("cui_button_need_mp");
            } else {
                button.removeClass("cui_button_need_mp");
                button.addClass("cui_button_disabled");
            }
        }
    } else {
        var button_class = button_id + "_class";
        var disable_class = button_class + "_disable";
        button.removeClass(button_class);
        button.removeClass(disable_class);

        if (enable != "true") {
            button.addClass(disable_class);
            button.attr("enable", "false");
        } else {
            button.addClass(button_class);
            button.attr("enable", "true");
        }
    }
}


/**
 * 设置文本
 * @param 标签或按钮的id
 * @param text 标签的文本内容
 */
Interface.set_text = function (control_id, text) {
    var control = $("#" + control_id);
    if (control.hasClass("cui_button")) {
        control.children(".cui_button_text").text(text);
    } else if (control.hasClass("cui_input")) {
        control.val(text);
    } else {
        control.html(text);
    }
}

/**
 * 设置焦点
 * @param 输入框控件 id
 */
Interface.set_focus = function (control_id) {
    var control = $("#" + control_id);
    control.focus();
}

/**
 * 设置文本颜色
 * @param 标签或按钮的id
 * @param 颜色值
 */
Interface.set_color = function (control_id, color) {
    var control = $("#" + control_id);
    if (control.hasClass("cui_button")) {
        control.children(".cui_button_text").css("color", color);
    } else {
        control.css("color", color);
    }
}

/**
 * 设置文本字体大小
 * @param 控件的 id
 * @param font_size 字体大小
 */
Interface.set_font_size = function (control_id, font_size) {
    var control = $("#" + control_id);
    if (control.hasClass("cui_button")) {
        control.children(".cui_button_text").css("font-size", font_size + "px");
    } else if (control.hasClass("label")) {
        control.css("font-size", font_size + "px");
    }
}

/**
 * 为 panel 添加子控件
 * @param panel_id 父控件 id
 * @param json 子控件的参数
 */
Interface.add_child = function (panel_id, json) {

    if (typeof (json) == "string")
        child_obj = eval('(' + json + ')');
    else
        child_obj = json;

    var child = {};

    if (panel_id == "nil") {
        panel_id = false;
    }

    switch (child_obj.type) {
        case "panel":
            child = Interface.add_panel(child_obj, panel_id);
            break;
        case "button":
            child = Interface.add_button(child_obj, panel_id);
            break;
        case "button_group":
            child = Interface.add_button_group(child_obj, panel_id);
            break;
        case "progress_bar":
            child = Interface.add_progress_bar(child_obj, panel_id);
            break;
        case "rounded_progress_bar":
            child = Interface.add_rounded_progress_bar(child_obj, panel_id);
            break;
        case "label":
            child = Interface.add_label(child_obj, panel_id);
            break;
        case "mouse_label":
            child = Interface.add_mouse_label(child_obj, panel_id);
            break;
        case "canvas":
            child = Interface.add_canvas(child_obj, panel_id);
            break;
        case "video":
            child = Interface.add_video(child_obj, panel_id);
            break;
        case "input":
            child = Interface.add_input(child_obj, panel_id);
            break;
        default:
            break;
    }

    // 判断是否有children属性，如果有则添加children
    if (child_obj.children) {
        addContent(child_obj.children, child_obj.id);
    }

    return child;
}

/**
 * 删除子控件
 * @param panel_id 控件 id
 * @param child_id 子控件 id
 */
Interface.remove_child = function (panel_id, child_id) {
    $("#" + panel_id).children("#" + child_id).remove();
    var style_tag_name = "#" + child_id + "_style";
    $(style_tag_name).remove();
}

/**
 * 追加子控件 - 浮动布局
 * @param panel_id 父控件 id
 * @param json 子控件的参数
 */
Interface.append_child = function (panel_id, json) {
    var child = Interface.add_child(panel_id, json);

    // 修改子控件属性
    child.css({
        "display": "inline-block",
        "left": "0px",
        "top": "0px",
        "position": "relative"
    })
}

/**
 * 设置控件坐标
 * @param control_id 控件 id
 * @param x x 坐标
 * @param x y 坐标
 */
Interface.set_position = function (control_id, x, y) {
    var x = parseInt(x), y = parseInt(y);
    if (x != -1) {
        $("#" + control_id).css({
            "left": x + "px",
        });
    }
    if (y != -1) {
        $("#" + control_id).css({
            "top": y + "px"
        });
    }

    if (Interface.tooltip_binding[control_id]) {
        UpdateTooltipPosition(Interface.tooltip_binding[control_id], control_id);
    }
}

/**
 * 设置控件宽高
 * @param control_id 控件 id
 * @param w x 坐标
 * @param h y 坐标
 */
Interface.set_control_size = function (control_id, w, h) {
    $("#" + control_id).css({
        "width": w + "px",
        "height": h + "px"
    });
}

/**
 * 获取控件坐标和大小
 * @param control_id 控件 id
 */
Interface.request_control_rect = function (control_id) {
    var control = $("#" + control_id);
    var rect_info = {
        control_id: control_id,
        x: parseInt(control.css("left")),
        y: parseInt(control.css("top")),
        w: control.width(),
        h: control.height()
    };
    engine.trigger("get_control_rect", JSON.stringify(rect_info));
}

/**
 * 滚动到坐标
 * @param control_id 控件 id
 */
Interface.scroll_to = function (control_id, h) {
    var control = $("#" + control_id)[0];
    control.scrollTop = h;
}


/**
 * 设置控件层级
 * @param control_id 控件 id
 * @param z_index 控件层级
 */
Interface.set_z_index = function (control_id, z_index) {
    $("#" + control_id).css({
        "z-index": z_index
    });
}

/**
 * 删除控件以及控件下的全部子控件
 * @param control_id 控件的id
 */
Interface.remove_control = function (control_id) {
    $("#" + control_id).remove();
    var style_tag_name = "#" + control_id + "_style";
    $(style_tag_name).remove();
}

function update_progress(progress) {
    var current_value = parseInt(progress.attr("current_value"));
    var max_value = parseInt(progress.attr("max_value"));
    var progress_bg = progress.children('.container').children('.bg');
    if (max_value >= current_value && max_value != 0) {
        var percent = Math.floor(current_value * 100 / max_value);

        progress_bg.css("width", percent + "%");

        progress.children(".text").text(current_value + "/" + max_value);

        var progress_head = progress.children('.container').children(".cui_progress_head");
        progress_head.css({
            "left": percent + "%"
        });
        if (max_value == current_value) {
            progress_head.css("display", "none");
        } else {
            progress_head.css("display", "block");
        }
    }
}

/**
 * progress_bar(进度条)的接口,设置最大值
 * @param progress_id 进度条id
 * @param max_value 进度条最大值
 */
Interface.set_max_value = function (progress_id, max_value) {
    max_value = parseFloat(max_value);
    var progress = $("#" + progress_id);

    if (progress.hasClass("cui_rounded_progress_bar")) {
        var cooldown_painter = Interface.cooldown_painter[progress_id];
        if (cooldown_painter && progress.is(":visible")) {
            cooldown_painter.set_max_value(max_value);
        }

    } else {
        progress.attr("max_value", max_value);
        update_progress(progress);
    }
}

/**
 * 为进度条设置当前值
 * @param progress_id 进度条id
 * @param value 值
 */
Interface.set_current_value = function (progress_id, value) {
    value = parseFloat(value);
    var progress = $("#" + progress_id);

    if (progress.hasClass("cui_rounded_progress_bar")) {

        var cooldown_painter = Interface.cooldown_painter[progress_id];
        if (cooldown_painter && progress.is(":visible")) {
            cooldown_painter.set_current_value(value);
        }

    } else {
        progress.attr("current_value", value);
        update_progress(progress);
    }
}

/**
 * 按钮组的接口,添加一个 item 到最后(其实此函数的功能只是给每个已经通过按钮组创建的按钮添加样式和id)
 * @param button_group_id    按钮组 的 id
 * @param item_json_str    是一个 json 字符串，包含 item 信息
 */
Interface.append_item = function (button_group_id, item_json_str) {
    var button_obj = eval('(' + item_json_str + ')');
    var button_group = $("#" + button_group_id);
    if (button_group.attr("item-count") == undefined) {
        button_group.attr("item-count", "0");
    }
    var item_count = button_group.attr("item-count");
    var parent_id = $(button_group.children(".cui_button_group_item_container")[item_count]).attr("id");
    Interface.add_button(button_obj, parent_id, $("#" + parent_id).children(".cui_button"));
    if (button_obj.children != undefined) {
        addContent(button_obj.children, button_obj.id);
    }
    button_group.attr("item-count", ++item_count);
}

/**
 * 设置按钮组格子数量
 */
Interface.set_item_count = function (button_group_id, item_count) {
    item_count = parseInt(item_count);
    var button_group = $("#" + button_group_id);
    var group_children = button_group.children(".cui_button_group_item_container")
    group_children.hide();
    for (var i = 0; i < item_count; ++i) {
        $(group_children[i]).show();
    }
}

/**
 * 按钮组 的接口,移除 table 中的 item
 * @param button_group_id    按钮组的id
 * @param item_id     item的id，会在 item_json_str 中指定
 */
Interface.remove_item = function (button_group_id, item_id) {
    $("#" + item_id).remove();
}

/**
 * 设置按钮图片
 * @param button_id  按钮 id
 * @param image_path 图片路径
 */
Interface.set_normal_image = function (button_id, image_path) {
    var button = $("#" + button_id);
    if (button.attr("drag-control") != undefined) {
        button = button.children("#" + button.attr("drag-control"));
    }
    if (image_path == "") {
        button.css(
            "background-image", "none");
    } else {
        button.css(
            "background-image", "url(" + image_path + ")");
    }
}

/**
 * 设置背景图片
 * @param control_id 控件 id
 * @param image_path 图片路径
 */
Interface.set_background_image = function (control_id, image_path) {
    if (image_path == "") {
        $("#" + control_id).css("background", "transparent");
    } else {
        $("#" + control_id).css({
            "background-image": "url(" + image_path + ")",
            "background-size": "100% 100%",
            "backround-repeat": "no-repeat"
        });
    }
}

/**
 * 设置进度条头部图片
 * @param progress_id 进度条 id
 * @param image_path 图片路径
 */
Interface.set_progress_head_image = function (progress_id, image_path) {
    var progress = $("#" + progress_id);
    progress.children(".cui_progress_head").css("background-image", "url(" + image_path + ")");
}

/**
 * 设置按钮上装饰性的文本
 * @param button_id 按钮 id
 * @param text 文本
 */
Interface.set_decoration_text = function (button_id, text) {
    $("#" + button_id).children(".cui_button_decoration").text(text);
}

/**
 * 设置按钮的tooltip
 * @param button_id 按钮的id
 * @param text 需要设置的文本/json字符串
 * @param offset_x x方向偏移量
 * @param offset_y y方向偏移量
 */
Interface.tooltip_binding = {};
function UpdateTooltipPosition(panel_object, button_id) {
    var button = $("#" + button_id);
    if (panel_object.w != undefined) {
        left = button.offset().left / Interface.w_factor + (button.width() / Interface.w_factor - panel_object.w) / 2;
        left = left + panel_object.x;
        left = left < 0 ? 0 : left;
    } else {
        left = button.offset().left / Interface.w_factor + panel_object.x;
    }
    var tooltip_control = $("#" + panel_object.id);
    tooltip_control.css({
        "padding": "15px",
        "top": "",
        "left": left + "px",
        "height": "auto",
        "border-image-slice": "2 2 2 2 fill",
        "border-image-source": "url(image/tips.png)",
        "border-image-width": "2px 2px 2px 2px",
        "z-index": 9999
    });

    var width = tooltip_control.width();
    //console.log(tooltip_control.offset().left);
    if (left + width + button.width() > 1920) {
        tooltip_control.css("left", "");
        tooltip_control.css("right", "0");
    }

    if (typeof (panel_object.base_line) == "undefined")
        panel_object.base_line = "bottom";

    if (panel_object.base_line == "top") {
        var top = (button.offset().top + button.height()) / Interface.h_factor + panel_object.y;
        top = top < 0 ? 0 : top;
        tooltip_control.css("top", top + "px");

    } else {
        var bottom = ($(document).height() - button.offset().top) / Interface.h_factor + panel_object.y;
        bottom = bottom < 0 ? 0 : bottom;
        tooltip_control.css("bottom", bottom + "px");
    }

    var rect_info = tooltip_control[0].getBoundingClientRect();
    if (rect_info.top < 0) {
        tooltip_control.css({
            "top": "0px",
            "bottom": ""
        });
    } else if (rect_info.bottom / Interface.h_factor > 1080) {
        tooltip_control.css({
            "bottom": "0px",
            "top": ""
        });
    }
}
Interface.set_tooltip = function (button_id, json_str, offset_x, offset_y) {

    var x = parseInt(offset_x);
    var y = parseInt(offset_y);

    if (isNaN(x)) x = 0;
    if (isNaN(y)) y = 0;

    var panel_object = eval('(' + json_str + ')');
    panel_object.extra_class = "cui_tooltip";
    var arr = [];
    arr.push(panel_object);
    addContent(arr);

    Interface.tooltip_binding[button_id] = panel_object;
    panel_object.x = x;
    panel_object.y = y;

    UpdateTooltipPosition(panel_object, button_id);
}

/*
 * 移除 tooltip
 */
Interface.remove_tooltip = function () {
    Interface.tooltip_binding = {};
    $(".cui_tooltip").remove();
}

/**
 * 设置按钮的 cd 效果
 * @param button_id 按钮 id
 * @param left_time 剩余时间
 * @param total_time 总时间
 * @param show_text 是否显示文本
 */
Interface.set_cooldown = function (button_id, left_time, total_time, show_text) {

    var button = $("#" + button_id);
    var add_canvas = function () {
        if (button.children("canvas").length == 0) {
            str = '<canvas class="cooldown"></canvas>';
            button.append(str);
            Interface.cooldown_painter[button_id] = new Cooldown(button);
        }
    }

    // 如果按钮不显示，不执行更新 canvas 的逻辑，否则 canvas 会因为画太多次而触发 Coherent GT 的 bug
    if (button.is(":visible")) {
        add_canvas();
        var cooldown_painter = Interface.cooldown_painter[button_id];
        if (cooldown_painter) {
            cooldown_painter.setShowText(show_text == "true");
            cooldown_painter.runCooldown(left_time, total_time);
        }
    }
}

/**
 * 终止按钮的 cd 效果
 * @param button_id 按钮 id
 */
Interface.hide_cooldown = function (button_id) {
    var cooldown_painter = Interface.cooldown_painter[button_id];
    if (cooldown_painter) {
        cooldown_painter.endCooldown();
    }
}

/**
 * 播放动画
 * @param control_id 控件 id
 * @param animation_path 序列帧图片路径
 * @param image_count 序列帧数量
 * @param infinite 是否无限循环
 * @param repeat_times 每帧重复播放几次
 */
Interface.play_animation = function (control_id, animation_path, image_count, infinite, repeat_times) {
    if ($("#" + control_id).is(":visible")) {
        var animation_painter = Interface.animation_painter[control_id];
        if (animation_painter) {
            animation_painter.playAnimation(animation_path, parseInt(image_count), parseInt(infinite) == 1, parseInt(repeat_times));
        }
    }
}

/**
 * 停止播放动画
 * @param control_id 控件 id
 */
Interface.stop_animation = function (control_id) {
    var animation_painter = Interface.animation_painter[control_id];
    if (animation_painter) {
        animation_painter.stopAnimation();
    }
}

/**
 * 播放视频
 * @param video_id 视频控件 id
 * @param video_src 视频地址
 * @param loop 是否循环播放
 * @param show_last_frame 是否显示最后一帧
 */
Interface.play_video = function (video_id, video_src, loading_image, loop, show_last_frame) {
    var container = $("#" + video_id);
    var video = $("#" + video_id).children("video");
    video.show();

    if (video_src != "") {
        video.children("source").attr("src", video_src);
    } else {
        video_src = video.children("source").attr("src");
    }

    var last_frame_pic = video_src.substr(0, video_src.length - 4) + "png";

    video[0].removeEventListener("ended", on_video_finished);

    container.css({
        "background-image": "url(" + loading_image + ")",
        "background-repeat": "no-repeat",
        "background-size": "100% 100%"
    });
    video[0].addEventListener("canplay", function () {
        container.css({
            "background-image": "none",
            "background-repeat": "no-repeat",
            "background-size": "100% 100%"
        });
    });

    if (loop == "true") {
        video.attr("loop", "loop")
    } else if (show_last_frame == "false") {
        video[0].addEventListener("ended", on_video_finished);
    } else if (show_last_frame == "true") {
        video[0].addEventListener("ended", function () {
            container.css({
                "background-image": "url(" + last_frame_pic + ")",
                "background-repeat": "no-repeat",
                "background-size": "100% 100%"
            });

        });
    }

    video[0].load();
    video[0].play();
}

/**
 * 暂停播放视频
 * @param video_id 视频控件 id
 */
Interface.pause_video = function (video_id) {
    var video = $("#" + video_id).children("video");
    video[0].pause();
}

/**
 * 继续播放视频
 * @param video_id 视频控件 id
 */
Interface.resume_video = function (video_id) {
    var video = $("#" + video_id).children("video");
    video[0].play();
}

/**
 * 重新播放视频
 * @param video_id 视频控件 id
 */
Interface.replay_video = function (video_id) {
    var video = $("#" + video_id).children("video");
    video[0].currentTime = 0;
    video[0].play();
}

/**
 * 停止播放视频
 * @param video_id 视频控件 id
 */
Interface.stop_play_video = function (video_id) {
    var video = $("#" + video_id).children("video");
    video[0].load();
}

/**
 * 设置按钮是否可以拖放
 * @param button_id 按钮 id
 * @param enable 是否可以拖放
 */
Interface.set_enable_drag = function (button_id, enable) {
    $("#" + button_id).attr("enable-drag", enable);
}

/**
 * 判断是否由 coherent gt 渲染
 */
Interface.is_render_with_coherent_gt = function () {
    if (render_with_coherent_gt) {
        engine.trigger("render_with_coherent_gt", "true");
    } else {
        engine.trigger("render_with_coherent_gt", "false");
    }
}

/**
 * 清空 canvas 控件
 * @param canvas_id 画布 id
 */
Interface.clear_canvas = function (canvas_id) {
    var canvas = $("#" + canvas_id)[0];
    if (canvas == undefined) {
        return;
    }
    var context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * 在 canvas 控件上画圆弧
 * @param canvas_id 画布 id
 * @param params json 字符串，包含绘图参数
 *        x - 起始 x 坐标
 *        y - 起始 y 坐标
 *        radius - 半径
 *        start_arc - 起始点的角度
 *        end_arc - 结束点的角度
 *        color - 颜色
 *        line_width - 线的粗细，-1 为填充
 */
Interface.draw_arc = function (canvas_id, params) {
    var canvas = $("#" + canvas_id)[0];
    var context = canvas.getContext('2d');

    var params = JSON.parse(params);
    context.beginPath();
    context.arc(params.x, params.y, params.radius, params.start_arc / 180 * Math.PI, params.end_arc / 180 * Math.PI, false);
    //context.closePath();

    if (params.line_width == -1) {
        context.fillStyle = params.color;
        context.fill();
    } else {
        context.strokeStyle = params.color;
        context.lineWidth = params.line_width;
        context.stroke();
    }
}

/**
 * 在 canvas 控件上画矩形
 * @param canvas_id 画布 id
 * @param params json 字符串，包含如下参数
 *        x - 起始 x 坐标
 *        y - 起始 y 坐标
 *        w - 宽度
 *        h - 高度
 *        color - 颜色
 *        line_width = 线的粗细， -1 为填充
 */
Interface.draw_rect = function (canvas_id, params) {
    var canvas = $("#" + canvas_id)[0];
    var context = canvas.getContext('2d');

    var params = JSON.parse(params);
    context.beginPath();
    context.rect(params.x, params.y, params.w, params.h);

    if (params.line_width == -1) {
        context.fillStyle = params.color;
        context.fill();
    } else {
        context.strokeStyle = params.color;
        context.lineWidth = params.line_width;
        context.stroke();
    }
}

/**
 * 在 canvas 控件上画图片
 * @param canvas_id 画布 id
 * @param params json 字符串，包含如下参数
 *        x - 起始 x 坐标
 *        y - 起始 y 坐标
 *        w - 宽度
 *        h - 高度
 *        image_path - 图片路径
 */
Interface.draw_image = function (canvas_id, params) {
    var canvas = $("#" + canvas_id)[0];
    var context = canvas.getContext('2d');

    var params = JSON.parse(params);
    var draw_image_callback = function (image) {
        context.save();
        if (params.rotate) {
            context.translate(params.rx, params.ry);
            context.rotate(Math.PI / 180 * params.rotate);
            params.x = params.x - params.rx;
            params.y = params.y - params.ry;
        }
        context.drawImage(image, params.x, params.y, params.w, params.h);
        context.restore();
    }
    Interface.preload_image(params.image_path, draw_image_callback);
}

/**
 * 在 canvas 控件上画线
 * @param canvas_id 画布 id
 * @param params json 字符串，包含如下参数
 *        src_x - 起始 x 坐标
 *        src_y - 起始 y 坐标
 *        dst_x - 目标 x 坐标
 *        dst_y - 目标 y 坐标
 *        color - 颜色
 *        line_width - 线的宽度
 */
Interface.draw_line = function (canvas_id, params) {
    var canvas = $("#" + canvas_id)[0];
    var context = canvas.getContext('2d');

    var params = JSON.parse(params);
    context.beginPath();
    context.moveTo(params.src_x, params.src_y);
    context.lineTo(params.dst_x, params.dst_y);

    context.strokeStyle = params.color;
    context.lineWidth = params.line_width;
    context.stroke();
}

/**
 * 在 canvas 控件上画折线
 * @param canvas_id 画布 id
 * @param params json 字符串，包含如下参数
 *        points - [{x1, y1}, {x2, y2} ...] 包含点坐标的数组
 *        color - 颜色
 *        line_width - 线的宽度
 *        clip_rect {x, y, w, h} - (可选) 将折线裁剪在一个矩形范围内
 *        close_path - 是否闭合路径
 *        dash - 是否显示虚线
 */
Interface.draw_lines = function (canvas_id, params) {
    var canvas = $("#" + canvas_id)[0];
    var context = canvas.getContext('2d');

    var params = JSON.parse(params);

    if ("clip_rect" in params) {
        context.save();
        context.beginPath();
        var clip_rect = params.clip_rect;
        //context.rect(clip_rect.x, clip_rect.y, clip_rect.w, clip_rect.h);
        context.arc(
            clip_rect.x + clip_rect.w / 2,
            clip_rect.y + clip_rect.h / 2,
            Math.sqrt(clip_rect.w * clip_rect.w + clip_rect.h * clip_rect.h) / 2,
            0,
            Math.PI * 2,
            false);
        context.closePath();
        context.clip();
    }

    context.beginPath();
    context.strokeStyle = params.color;
    context.lineWidth = params.line_width;
    for (var i = 0; i < params.points.length; ++i) {
        var point = params.points[i];
        if (i == 0) {
            context.moveTo(point.x, point.y);
        } else {
            if ("dash" in params) {
                // coherent gt 不支持画虚线，分割一下
                draw_dash_line(context, x, y);
            } else {
                context.lineTo(point.x, point.y);
            }
        }
    }

    if ("close_path" in params && params.close_path) {
        context.closePath();
    }

    context.stroke();

    if ("clip_rect" in params) {
        context.restore();
    }

    context.lineWidth = 0;
}

/**
 * 在 canvas 上播放动画
 * @param canvas_id 画布 id
 * @param params json 字符串，包含如下参数
 *        x - 动画中心 x 坐标
 *        y - 动画中心 y 坐标
 *        w - 宽
 *        h - 高
 *        animation_path - 动画序列帧路径
 *        frame_count - 帧数量
 *        loop - 是否循环播放
 *        loop_start - 从第几帧开始循环
 *        duration - 持续时间， -1 为无限循环
 */
Interface.play_animation_on_canvas = function (canvas_id, params) {
    var canvas = $("#" + canvas_id)[0];
    var context = canvas.getContext('2d');
    var params = JSON.parse(params);
    var x = params.x - params.w / 2, y = params.y - params.h / 2;
    var w = params.w, h = params.h;
    var interval_id = 0;
    var image_index = 0;
    var elapse = 0;

    var callback = function (images) {

        var intervalCallback = function () {
            if (params.loop) {
                if ("loop_start" in params) {
                    if (image_index >= params.frame_count) {
                        image_index = params.loop_start;
                    }
                } else {
                    image_index = image_index % params.frame_count;
                }
            }
            if (image_index >= params.frame_count) {
                clearInterval(interval_id);
                context.clearRect(x, y, w, h);
            } else {
                context.clearRect(x, y, w, h);
                context.drawImage(images[image_index], x, y, w, h);
                image_index++;
            }

            elapse += 30;
            if (params.duration != -1 && elapse >= params.duration) {
                clearInterval(interval_id);
                context.clearRect(x, y, w, h);
            }
        };

        // 播放动画
        interval_id = setInterval(intervalCallback, 30);
    }

    // 加载序列帧图片
    Interface.preload_image_folder(params.animation_path, params.frame_count, callback);
}

/**
 * 显示全局蒙版
 */
Interface.show_global_mask = function () {
    $("#global-mask-no-stretch").css("display", "");
    $("#global-mask").css("display", "");
}

/**
 * 设置蒙版参数
 * @param mask_info 包含如下属性
 *          mask_color 蒙版颜色的 rgba 值
 *          clip_area 是一个数组，包含裁切区域
 *              type : "rect" / "circle" 裁切区域是矩形还是圆形
 *              如果是矩形，x y w h 对应裁切矩形坐标和大小
 *              如果是圆形，x, y 代表圆心坐标 r 代表半径
 */
Interface.mask_info = undefined;
Interface.set_global_mask = function (mask_info) {
    mask_info = eval("(" + mask_info + ")");
    var color = "rgba(0, 0, 0, 0.5)";
    if ("mask_color" in mask_info) {
        color = mask_info.mask_color;
    }
    var draw_function = function (mask_info) {
        var context = null;
        if (mask_info.is_flash) {
            context = $("#global-mask-no-stretch")[0].getContext('2d');
        } else {
            context = $("#global-mask")[0].getContext('2d');
        }
        context.width = context.width;
        context.fillStyle = color;
        context.clearRect(0, 0, 1920, 1080);
        context.rect(0, 0, 1920, 1080);
        //context.scale(Interface.no_stretch_factor / Interface.w_factor, Interface.no_stretch_factor / Interface.h_factor);
        // var screen_x = 1920 * Interface.w_factor, screen_y = 1080 * Interface.h_factor;
        // var no_stretch_x = 1920 * Interface.no_stretch_factor, no_stretch_y = 1080 * Interface.no_stretch_factor;
        // context.translate((screen_x - no_stretch_x) / 2 / Interface.w_factor, (screen_y - no_stretch_y) / 2 / Interface.h_factor);
        if ("clip_area" in mask_info) {
            var clip_area = mask_info.clip_area;
            for (var i = 0; i < clip_area.length; ++i) {
                var area_info = clip_area[i];
                if (area_info.type == "rect") {
                    context.rect(area_info.x, area_info.y, area_info.w, area_info.h);
                } else if (area_info.type == "circle") {
                    context.moveTo(area_info.x + area_info.r, area_info.y);
                    context.arc(area_info.x, area_info.y, area_info.r, 0, 2 * Math.PI, false);
                }
            }
            context.fill();
        }
    }

    if (Interface.mask_info != undefined) {
        draw_function(Interface.mask_info);
    }
    draw_function(mask_info);
    Interface.mask_info = mask_info;

    if (mask_info.is_flash) {
        var screen_x = 1920 * Interface.w_factor, screen_y = 1080 * Interface.h_factor;
        var no_stretch_x = 1920 * Interface.no_stretch_factor, no_stretch_y = 1080 * Interface.no_stretch_factor;
        var h = (screen_y - no_stretch_y) / 2 / Interface.h_factor;
        h += 1;
        var border_rect = {
            x: 0,
            y: 0,
            w: 1920,
            h: h
        };
        var border_context = $("#global-mask")[0].getContext('2d');
        border_context.clearRect(0, 0, 1920, 1080);
        border_context.fillStyle = color;
        border_context.fillRect(border_rect.x, border_rect.y, border_rect.w, border_rect.h);
        border_context.fillRect(border_rect.x, border_rect.y + no_stretch_y / Interface.h_factor + border_rect.h - 2, border_rect.w, border_rect.h);
    }

}

/**
 * 隐藏全局蒙版
 */
Interface.hide_global_mask = function () {
    // $("#global-mask-no-stretch").css("display", "none");
    // $("#global-mask").css("display", "none");
    var context = $("#global-mask-no-stretch")[0].getContext('2d');
    context.fillStyle = "rgba(0, 0, 0, 0)";
    context.clearRect(0, 0, 1920, 1080);
    context = $("#global-mask")[0].getContext('2d');
    context.fillStyle = "rgba(0, 0, 0, 0)";
    context.clearRect(0, 0, 1920, 1080);
}

/**
 * 设置缩放因数
 * @param w_factor 横轴的缩放系数（0 - 1）
 * @param h_factor 纵轴的缩放系数（0 - 1)
 */
Interface.w_factor = 1, Interface.h_factor = 1;
Interface.no_stretch_factor = 1;
Interface.left_offset = 0, Interface.top_offset = 0;
Interface.set_scale = function (w_factor, h_factor) {
    var wf = parseFloat(w_factor);
    var hf = parseFloat(h_factor);
    var scale_w = 1920 * wf;
    var scale_h = 1080 * hf;
    var left = Math.floor((scale_w - 1920) / 2 / w_factor);
    var top = Math.floor((scale_h - 1080) / 2 / h_factor);
    Interface.w_factor = w_factor, Interface.h_factor = h_factor;
    Interface.left_offset = left, Interface.top_offset = top;
    $("#content").css({
        "position": "absolute",
        "top": "0px",
        "left": "0px",
        "width": "1920px",
        "height": "1080px",
        "-webkit-transform": "scale(" + w_factor + "," + h_factor + ")" + " translate(" + left + "px," + top + "px)"
    });
    Interface.no_stretch_factor = Math.min(w_factor, h_factor);
    left = Math.floor((scale_w - 1920) / 2 / Interface.no_stretch_factor);
    top = Math.floor((scale_h - 1080) / 2 / Interface.no_stretch_factor);
    $("#content-no-stretch").css({
        "position": "absolute",
        "top": "0px",
        "left": "0px",
        "width": "1920px",
        "height": "1080px",
        "-webkit-transform": "scale(" + Interface.no_stretch_factor + "," + Interface.no_stretch_factor + ")" + " translate(" + left + "px," + top + "px)"
    });
}

/**
 * 清空网页内容
 */
Interface.clear = function () {

    // 清空所有动画效果
    for (var id in Interface.animation_painter) {
        var animation = Interface.animation_painter[id];
        animation.stopAnimation();
    }

    for (var id in Interface.cooldown_painter) {
        var cooldown = Interface.cooldown_painter[id];
        cooldown.endCooldown();
    }

    $("#content").empty();
    $("#content-no-stretch").empty();

    //console.log("clear");
}

/**
 * 预加载序列帧图片
 */
Interface.image_cache = {};
Interface.preload_image_folder = function (image_path, image_count, callback) {

    if (typeof (image_count) == "string") {
        image_count = parseInt(image_count);
    }

    if (image_path in Interface.image_cache) {
        if (typeof (callback) != "undefined")
            callback(Interface.image_cache[image_path]);
        return;
    }

    var image_array = [];
    var loaded = 0;
    for (var i = 0; i < image_count; ++i) {
        var image = new Image();
        var image_name = ("000000" + i).slice(-5);
        image.src = image_path + "/0_" + image_name + ".png";
        image_array.push(image);
        image.setAttribute("style", "position:absolute;width:1px;height:1px;")
        if (typeof (callback) == "undefined")
            document.getElementById("content").appendChild(image);
        image.onload = function () {
            loaded++;
            if (loaded == image_count) {
                Interface.image_cache[image_path] = image_array;
                if (typeof (callback) != "undefined")
                    callback(image_array);
            }
        }.bind(image);
    }
}

/**
 * 设置透明度
 * @param control_id 控件 id
 * @param opacity 透明度 0 ~ 1
 */
Interface.set_opacity = function(control_id, opacity) {
    $('#' + control_id).css('opacity', opacity);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// private section
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 动画效果
$.fn.extend({
    animateCss: function (animationName, callback) {
        var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
        this.addClass('animated ' + animationName).one(animationEnd, function () {
            $(this).removeClass('animated ' + animationName);
            if (typeof (callback) != "undefined") {
                callback();
            }
        });
    }
});

// 测试函数
function test_json(json_object, w, h) {
    Interface.clear();
    Interface.set_scale(w / 1920, h / 1080);
    $("body").css("overflow", "auto");
    $("html").css("overflow", "auto");
    $("#content").css("background-color", "#eeeeee");
    js_obj = ui_normalizer.process(json_object, 1920, 1080);
    addContent(js_obj.content);
}

// 执行命令列表
Interface.execute_command_list = function (command_list) {
    var command_list = eval('(' + command_list + ')');
    for (var i = 0; i < command_list.length; ++i) {
        var command_info = command_list[i];
        Interface[command_info.name].apply(Interface, command_info.args);
    }
}

// 预加载图片
Interface.preload_images = {};
Interface.preload_image = function (image_path, callback) {
    if (image_path in Interface.preload_images) {
        if (callback != undefined) {
            callback(Interface.preload_images[image_path]);
        }
        return Interface.preload_images[image_path];
    }
    var image = new Image();
    image.src = image_path;
    image.setAttribute("style", "position:absolute;width:1px;height:1px;");
    document.getElementById("content").appendChild(image);
    Interface.preload_images[image_path] = image;
    if (callback != undefined) {
        image.onload = function () {
            callback(Interface.preload_images[image_path]);
        }
    }
    return image;
}

Interface.add_mouse_label = function (obj, parent_id) {
    var label = Interface.add_label(obj, parent_id);
    $(document).mousemove(function (event){
        var top = 0, left = 0;
        top = event.pageY / Interface.h_factor - (label.height() / 2);
        left = event.pageX / Interface.w_factor - (label.width() / 2);
        label.css(
            {
                top: (top + obj.y) + "px",
                left: (left + obj.x) + "px"
            });
    })
    return label
}
// 画虚线
function draw_dash_line(context, x, y) {

}

// 视频播放完成回调
function on_video_finished() {
    this.load();
}

Interface.rect = function (control_id,top,right,bottom,left) {
    var object = $("#" + control_id);

    if (top != "nil"){
        top = top + "px ";
    } else {
        top = "auto ";
    }

    if (right != "nil"){
        right = right + "px ";
    } else {
        right = "auto ";
    }
    
    if (bottom != "nil"){
        bottom = bottom + "px ";
    } else {
        bottom = "auto ";
    }

    if (left != "nil"){
        left = left + "px ";
    } else {
        left = "auto ";
    }

    object.css("clip","rect(" + top + right + bottom + left + ")");
}

$(function () {

    // 避免调用浏览器的前进后退功能
    history.pushState(null, null, document.URL);
    window.addEventListener("popstate", function () {
        history.pushState(null, null, document.URL);
    });

    engine.on("create_custom_ui", Interface.create_custom_ui);
    engine.on("relayout", Interface.reLayout);

    engine.on("show", Interface.show);
    engine.on("show_with_animation", Interface.show_with_animation);
    engine.on("hide", Interface.hide);
    engine.on("hide_with_animation", Interface.hide_with_animation);
    engine.on("show_animation", Interface.show_animation);

    engine.on("set_enable", Interface.set_enable);
    engine.on("toggle_button", Interface.toggle_button);
    engine.on("set_toggle", Interface.set_toggle);
    engine.on("set_text", Interface.set_text);
    engine.on("set_focus", Interface.set_focus);
    engine.on("set_font_size", Interface.set_font_size);
    engine.on("set_color", Interface.set_color);
    engine.on("add_child", Interface.add_child);
    engine.on("append_child", Interface.append_child);
    engine.on("remove_child", Interface.remove_child);
    engine.on("remove_control", Interface.remove_control);
    engine.on("set_position", Interface.set_position);
    engine.on("set_control_size", Interface.set_control_size);
    engine.on("set_z_index", Interface.set_z_index);

    engine.on("request_control_rect", Interface.request_control_rect);
    engine.on("scroll_to", Interface.scroll_to);

    engine.on("set_max_value", Interface.set_max_value);
    engine.on("set_current_value", Interface.set_current_value);
    engine.on("set_enable_drag", Interface.set_enable_drag);

    engine.on("append_item", Interface.append_item);
    engine.on("remove_item", Interface.remove_item);
    engine.on("set_item_count", Interface.set_item_count);
    engine.on("set_normal_image", Interface.set_normal_image);
    engine.on("set_decoration_text", Interface.set_decoration_text);

    engine.on("set_background_image", Interface.set_background_image);
    engine.on("set_progress_head_image", Interface.set_progress_head_image);

    engine.on("set_tooltip", Interface.set_tooltip);
    engine.on("remove_tooltip", Interface.remove_tooltip);

    engine.on("set_cooldown", Interface.set_cooldown);
    engine.on("hide_cooldown", Interface.hide_cooldown);
    engine.on("play_animation", Interface.play_animation);
    engine.on("stop_animation", Interface.stop_animation);

    engine.on("play_video", Interface.play_video);
    engine.on("pause_video", Interface.pause_video);
    engine.on("resume_video", Interface.resume_video);
    engine.on("replay_video", Interface.replay_video);
    engine.on("stop_play_video", Interface.stop_play_video);

    engine.on("clear_canvas", Interface.clear_canvas);
    engine.on("draw_arc", Interface.draw_arc);
    engine.on("draw_rect", Interface.draw_rect);
    engine.on("draw_line", Interface.draw_line);
    engine.on("draw_lines", Interface.draw_lines);
    engine.on("draw_image", Interface.draw_image);
    engine.on("play_animation_on_canvas", Interface.play_animation_on_canvas);

    engine.on("show_global_mask", Interface.show_global_mask);
    engine.on("hide_global_mask", Interface.hide_global_mask);
    engine.on("set_global_mask", Interface.set_global_mask);

    engine.on("set_scale", Interface.set_scale);
    engine.on("clear", Interface.clear);

    engine.on("set_opacity", Interface.set_opacity);

    engine.on("preload_image", Interface.preload_image);
    engine.on("preload_image_folder", Interface.preload_image_folder);

    engine.on("is_render_with_coherent_gt", Interface.is_render_with_coherent_gt);

    engine.on("execute_command_list", Interface.execute_command_list);

    engine.on("rect", Interface.rect);

});