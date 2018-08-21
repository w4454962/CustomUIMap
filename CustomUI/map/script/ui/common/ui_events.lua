-------------------------------------------
--  界面事件回调入口

-------------------------------------------
local japi = require 'jass.japi'
local jass = require 'jass.common'
local globals = require 'jass.globals'

ui_events = {}

ui_events.callbacks = {}

-- 注册前端事件
register_events = {
	"alert",
	"debugf",
	"panel_mouse_enter",
	"panel_mouse_leave",
	"panel_clicked",
	"button_mousedown",
	"button_mouseup",
	"button_clicked",
	"button_right_clicked",
	"button_begin_drag",
	"button_update_drag",
	"button_drag_and_drop",
	"button_mouse_enter",
	"button_mouse_leave",
	'input_text_changed',
	'input_get_focus',
	'input_lose_focus',
	"label_mouse_enter",
	"label_mouse_leave",
	"canvas_clicked",
	"canvas_right_clicked",
	"canvas_mouse_wheel",
	"render_with_coherent_gt",
	"canvas_mousedown",
	"canvas_mousemove",
	"canvas_mouseup"
}
common.RegisterEvent(register_events)

function ui_event_callback(event_id,...)
	local func_name = 'on_' .. event_id 
	local func = ui_events[func_name]
	if func ~= nil then 
		func(...)
	end 
end 

function debugf (...)
	--print(...)
end 


-- 弹出调试信息
ui_events.on_alert = function(event_args)
	common.MessageBox(event_args)
end

-- 打印调试信息
ui_events.on_debugf = function(event_args)
	--debugf(event_args)
end

-- 按下按钮
ui_events.on_button_mousedown = function(button_id)
	
	--debugf(string.format("**************************按下按钮 ：%s**************************", button_id), false)

	
	js.callbacks("on_button_mousedown",button_id)

end

-- 松开按钮
ui_events.on_button_mouseup = function(button_id)
	
	--debugf(string.format("**************************松开按钮 ：%s**************************", button_id), false)

	
	js.callbacks("on_button_mouseup",button_id)

end

-- 按钮被点击
ui_events.on_button_clicked = function(button_id)
	
	--debugf(string.format("**************************按钮被点击 ：%s**************************", button_id), false)

	
	js.callbacks("on_button_clicked",button_id)

end

-- 按钮右击
ui_events.on_button_right_clicked = function(button_id)

	--debugf(string.format("**************************按钮被右击 ：%s**************************", button_id), false)

	
	js.callbacks("on_button_right_clicked",button_id)

end

--按钮开始拖放
ui_events.on_button_begin_drag = function(button_id)

	--debugf(string.format("**************************按钮开始拖拽 ：%s**************************", button_id), false)
	
	-- 自定义逻辑
	
	js.callbacks("on_button_begin_drag",button_id)
	ui_events.dragging = true
end

ui_events.on_button_update_drag = function(json_str)
	
		--debugf(string.format("**************************按钮更新拖拽 ：%s**************************", button_id), false)
	local info = json.decode(json_str)
	-- 自定义逻辑
	
	js.callbacks("on_button_update_drag",info)
	
end

-- 按钮拖放
ui_events.on_button_drag_and_drop = function(json_str)

	--debugf(string.format("**************************按钮被拖放 ：%s**************************", json_str), false)

	local drag_info = json.decode(json_str)


	-- 自定义逻辑
	
	js.callbacks("on_button_drag_and_drop",json.decode,json_str)

	ui_events.dragging = false
	
end

-- 进入面板
ui_events.on_panel_mouse_enter = function(panel_id)

	--debugf(string.format("**************************进入面板 ：%s**************************", panel_id), false)

	-- 自定义逻辑
	
		js.callbacks("on_panel_mouse_enter",panel_id)
	
end
	
-- 离开面板
ui_events.on_panel_mouse_leave = function(panel_id)

	--debugf(string.format("**************************离开面板 ：%s**************************", panel_id), false)

	-- 自定义逻辑
	
		js.callbacks("on_panel_mouse_leave",panel_id)

end
	
-- 点击面板
ui_events.on_panel_clicked = function(panel_id)

	--debugf(string.format("**************************点击面板 ：%s**************************", panel_id), false)

	-- 自定义逻辑
	
		js.callbacks("on_panel_clicked",panel_id)

end

-- 进入按钮
ui_events.on_button_mouse_enter = function(button_id)

	--debugf(string.format("**************************进入按钮 ：%s**************************", button_id), false)

	-- 自定义 tooltip
	
	js.callbacks("on_button_mouse_enter",button_id)
end

-- 离开按钮
ui_events.on_button_mouse_leave = function(button_id)

	--debugf(string.format("**************************离开按钮 ：%s**************************", button_id), false)

	
	js.callbacks("on_button_mouse_leave",button_id)

end

--输入框被改变事件
ui_events.on_input_text_changed = function (info)
	local input_info = json.decode(info)
    
	js.callbacks("on_input_text_changed",input_info.id,input_info.text)
	
end

--输入框得到焦点事件
ui_events.on_input_get_focus = function (input_id)

    
	js.callbacks("on_input_get_focus",input_id)
	
end

--输入框失去焦点事件
ui_events.on_input_lose_focus = function (input_id)

    
	js.callbacks("on_input_lose_focus",input_id)
	
end


-- 进入label
ui_events.on_label_mouse_enter = function(label_id)

	--debugf(string.format("**************************进入label ：%s**************************", label_id), false)
	
		js.callbacks("on_label_mouse_enter",label_id) 
end

-- 离开label
ui_events.on_label_mouse_leave = function(label_id)

	--debugf(string.format("**************************离开label ：%s**************************", label_id), false)
	
		js.callbacks("on_label_mouse_leave",label_id) 

end

-- canvas 按下
ui_events.on_canvas_mousedown = function(info)

	local click_info = json.decode(info)
	--debugf(string.format("**************************canvas 按下 ： %s %d %d**************************", click_info.canvas_id, click_info.x, click_info.y))

	-- 自定义逻辑
	
	js.callbacks("on_canvas_mousedown",click_info.canvas_id, click_info.x, click_info.y)
end

-- canvas 移动
ui_events.on_canvas_mousemove = function(info)

	local click_info = json.decode(info)
	--debugf(string.format("**************************canvas 移动 ： %s %d %d**************************", click_info.canvas_id, click_info.x, click_info.y))

	-- 自定义逻辑
	
	js.callbacks("on_canvas_mousemove",click_info.canvas_id, click_info.x, click_info.y)
end

-- canvas 移动
ui_events.on_canvas_mouseup = function(info)

	local click_info = json.decode(info)
	--debugf(string.format("**************************canvas 移动 ： %s %d %d**************************", click_info.canvas_id, click_info.x, click_info.y))

	-- 自定义逻辑
	
	js.callbacks("on_canvas_mouseup",click_info.canvas_id, click_info.x, click_info.y)
end

-- canvas 左击
ui_events.on_canvas_clicked = function(info)

	local click_info = json.decode(info)
	--debugf(string.format("**************************canvas 左击 ： %s %d %d**************************", click_info.canvas_id, click_info.x, click_info.y))

	-- 自定义逻辑
	
	js.callbacks("on_canvas_clicked",click_info.canvas_id, click_info.x, click_info.y)
end

-- canvas 右击
ui_events.on_canvas_right_clicked = function(info)
	local click_info = json.decode(info)
	--debugf(string.format("**************************canvas 右击 ： %s %d %d**************************", click_info.canvas_id, click_info.x, click_info.y))

	-- 自定义逻辑
	
	js.callbacks("on_canvas_right_clicked",click_info.canvas_id, click_info.x, click_info.y)
end
--------------------------------------
-- canvas 滚轮
ui_events.on_canvas_mouse_wheel = function(info)
	local wheel_info = json.decode(info)
	--debugf(string.format("**************************canvas 滚轮 ： %s delta: %d**************************", wheel_info.canvas_id, wheel_info.delta))

	-- 自定义逻辑
	
	js.callbacks("on_canvas_mouse_wheel",wheel_info.canvas_id, wheel_info.delta)
end


ui_events.on_update = function ()
	js.callbacks("on_update")
end

return ui_events