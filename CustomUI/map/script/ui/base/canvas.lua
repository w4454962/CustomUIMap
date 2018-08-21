require 'ui.base.class'

canvas_class = extends( ui_base_class , {
    canvas_map = {},
    create = function (param_x,param_y,width,height,color)
        local index = ui_base_class.create()
        local object = {
            type = "canvas",
            id ='canvas_object_'..tostring(index),
            x = x,
            y = y,
            w = width,
            h = height,
            background_color = color,
        }
        js.add_child(  json.encode(object))
        object._index = index
        canvas_map[object.id] = object
        setmetatable(object,{__index = canvas_class})
        return object
    end,

    add_child = function (parent_object,param_x,param_y,width,height,color)
        local index = ui_base_class.create()
        local ui = {
            id ='canvas_object_'..tostring(index),
            type = "canvas",
            x = param_x,
            y = param_y,
            w = width,
            h = height,
            background_color = color,
            z_index = 1
        }
        js.add_child(parent_object.id,ui)
        local object = ui
        object._index = index
        object.parent = parent_object
        canvas_map[object.id] = object
        setmetatable(object,{__index = canvas_class})
        return object
    end,

    destroy = function (self)
        if self.is_dead ~= true then 
            self.is_dead = true
            canvas_map[self.id] = nil
            ui_base_class.destroy(self._index)
            js.remove_control(self.id)   
        end
    end,
    draw_lines = function (self,params)
        js.draw_lines(self.id,json.encode(params))
    end,
    draw_line = function (self,ox,oy,tx,ty,color_code,width)
        local params = {
            src_x = ox,
            src_y = oy,
            dst_x = tx,
            dst_y = ty,
            color = color_code,
            line_width = width
        }
        js.draw_line(self.id,json.encode(params))
    end,
    clear_canvas = function (self)
        js.clear_canvas(self.id)
    end,
})

local canvas_event = {}


--画布被点击
canvas_event.on_canvas_clicked = function (canvas_id,x,y)
    local canvas = canvas_class.canvas_map[canvas_id]
    if canvas ~= nil then
        event_callback('on_canvas_clicked',canvas,x,y)
    end
end

--画布被右键点击
canvas_event.on_canvas_right_clicked = function (canvas_id,x,y)
    local canvas = canvas_class.canvas_map[canvas_id]
    if canvas ~= nil then
        event_callback('on_canvas_right_clicked',canvas,x,y)
    end
end

--画布被按下
canvas_event.on_canvas_mousedown = function (canvas_id,x,y)
    local canvas = canvas_class.canvas_map[canvas_id]
    if canvas ~= nil then
        event_callback('on_canvas_mousedown',canvas,x,y)
    end
end

--画布弹起
canvas_event.on_canvas_mouseup = function (canvas_id,x,y)
    local canvas = canvas_class.canvas_map[canvas_id]
    if canvas ~= nil then
        event_callback('on_canvas_mouseup',canvas,x,y)
    end
end

--画布弹起
canvas_event.on_canvas_mouseup = function (canvas_id,x,y)
    local canvas = canvas_class.canvas_map[canvas_id]
    if canvas ~= nil then
        event_callback('on_canvas_mouseup',canvas,x,y)
    end
end

--画布移动
canvas_event.on_canvas_mousemove = function (canvas_id,x,y)
    local canvas = canvas_class.canvas_map[canvas_id]
    if canvas ~= nil then
        event_callback('on_canvas_mousemove',canvas,x,y)
    end
end

js.register_event(canvas_event)--注册事件

return texture_event