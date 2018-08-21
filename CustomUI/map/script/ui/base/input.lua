require 'ui.base.text'

--[[
        text 文本类
        
    将label 拆分成 text 跟 texture   
    text只负责显示文本
    texture 负责显示图像跟其他动画效果 还有 label的响应事件

]]

input_class = extends ( text_class , {
    input_map = {},
    --最后一个参数的默认参数 是left 可填 可不填       
    create = function (str,param_x, param_y, width, height, size,param_align)
        local align = param_align or "left"
        local index = ui_base_class.create()
        local ui = {
            id ='input_object_'..tostring(index),
            type = "input",
            x = param_x,
            y = param_y,
            w = width,
            h = height,
            text = str,
            font_size = size,
            font_weight = 'bold',
            text_align = align,
            children = {}
        }
        local object = ui
        if type(str) == 'table' then
            for key,value in pairs(str) do 
                object[key] = value
            end
        else
            object.text = str
        end
        js.create(ui)
        object._index = index
        input_class.input_map[object.id] = object
        setmetatable(object,{__index = input_class})
        return object
    end,
    add_child = function (parent_object,str,param_x, param_y, width, height, size,param_align)
        local align = param_align or "left"
        local index = ui_base_class.create()
        local ui = {
            id ='input_object_'..tostring(index),
            type = "input",
            x = param_x,
            y = param_y,
            w = width,
            h = height,
            border_width = 1,
            font_size = size,
            font_weight = 'bold',
            text_align = align, 
            children = {}
        }
        if type(str) == 'table' then
            for key,value in pairs(str) do 
                ui[key] = value
            end
        else
            ui.text = str
        end
        js.add_child(parent_object.id,ui)
        local object = ui
        object._index = index
        object.parent = parent_object
        input_class.input_map[object.id] = object
        setmetatable(object,{__index = text_class})
        if type(str) ~= 'table' then
            object:set_text(str)
        end
        return object
    end,

    destroy = function (self)
        for i,child in ipairs(self.children) do
            child:destroy()
        end
        if self.is_dead ~= true then
            self.is_dead = true
            ui_base_class.destroy(self._index)
            input_class.input_map[self.id] = nil
            js.remove_control(self.id)    
        end
    end,

})



local input_event = {}

--输入框被改变事件
input_event.on_input_text_changed = function (input_id,str)
    local input = input_class.input_map[input_id]
    if input ~= nil then
        event_callback('on_input_text_changed',input,str)
    end
end

--输入框得到焦点事件
input_event.on_input_get_focus = function (input_id)
    local input = input_class.input_map[input_id]
    if input ~= nil then
        event_callback('on_input_get_focus',input)
    end
end
--输入框失去焦点事件
input_event.on_input_lose_focus = function (input_id)
    local input = input_class.input_map[input_id]
    if input ~= nil then
        event_callback('on_input_lose_focus',input)
    end
end

js.register_event(input_event)--注册事件

return input_event