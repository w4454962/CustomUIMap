require 'ui.base.panel'

--[[
        texture 纹理类

    将label 拆分成 text 跟 texture   
    text只负责显示文本
    texture 负责显示图像跟其他动画效果 还有 label的响应事件

]]


texture_class = extends( panel_class , {
    texture_map = {},

    create = function (image_path,param_x, param_y, width, height) 
        local index = ui_base_class.create()
        local ui = {
            id ='texture_object_'..tostring(index),
            type = "label",
            x = param_x,
            y = param_y,
            w = width,
            h = height,
            children = {}
        }
        if type(image_path) == 'table' then
            for key,value in pairs(image_path) do 
                ui[key] = value
            end
        else
            if image_path:find('.png')==nil and image_path:find('.PNG')==nil then 
                image_path = 'image/ItemIcon/'..image_path..'.png'
            end
            ui.normal_image = image_path
        end
        js.add_child('nil',ui)
        local object = ui
        object._index = index
        texture_class.texture_map[ui.id] = ui
        setmetatable(object,{__index = texture_class})
        return object
    end,
    --最后一个为默认参数 默认为false  为true的时候表示为显示模型控件
    add_child = function (parent_object,image_path,param_x, param_y, width, height)
        local index = ui_base_class.create()
        local ui = {
            id ='texture_object_'..tostring(index),
            type = "label",
            x = param_x,
            y = param_y,
            w = width,
            h = height,
            children = {}
        }
        if type(image_path) == 'table' then
            for key,value in pairs(image_path) do 
                ui[key] = value
            end
        else
            if image_path:find('.png')==nil and image_path:find('.PNG')==nil then 
                image_path = 'image/ItemIcon/'..image_path..'.png'
            end
            ui.normal_image = image_path
        end
        js.add_child(parent_object.id,ui)
        local object = ui
        object._index = index
        object.parent = parent_object
        texture_class.texture_map[ui.id] = ui
        setmetatable(object,{__index = texture_class})
        return object
    end,

    destroy = function (self)
        for i,child in ipairs(self.children) do
            child:destroy()
        end
        if self.is_dead ~= true then
            self.is_dead = true
            ui_base_class.destroy(self._index)
            texture_class.texture_map[self.id] = nil
            js.remove_control(self.id)    
        end
    end,

    play_animation = function (self,animation_path, image_count, infinite, repeat_times)
        if infinite == nil or infinite == false or infinite == 0 then 
            infinite = "0" 
        else
            infinite = "1"
        end
        if repeat_times == nil then 
            repeat_times = "1"
        end
        js.play_animation(self.id,animation_path, tostring(image_count), infinite, tostring(repeat_times))
    end,      
    
    stop_animation = function (self)
        js.stop_animation(self.id)
    end,
})

local texture_event = {}

texture_event.on_label_mouse_enter = function (label_id)
    local texture = texture_class.texture_map[label_id]
    if texture ~= nil then
        event_callback('on_label_mouse_enter',texture)
    end
end

texture_event.on_label_mouse_leave = function (label_id)
    local texture = texture_class.texture_map[label_id]
    if texture ~= nil then
        event_callback('on_label_mouse_leave',texture)
    end
end


js.register_event(texture_event)--注册事件

return texture_event