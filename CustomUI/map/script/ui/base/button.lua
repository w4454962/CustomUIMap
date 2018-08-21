require 'ui.base.panel'

--[[
    重载按钮的接口为类 且 封装对应事件 只要该按钮对象拥有 某某事件便会响应
    例子：  第一个参数 如果是字符串 则为固定背景 如果是一个表 则属性会附加到UI上
    local info = {
        hover_image = 'image/ShopPanel/title_list_bg.png',
        normal_image = 'image/progress/g1.png',
        active_image  = 'image/竖按钮.png',
    }
    local button = button_class.create(info,300,300,300,300)
    button.on_button_clicked = function (button)
        --点击事件
        return false 
    end

    --如果事件回调方法里  没有返回值 或者 返回true的情况下 会不断往 父类转发消息  
    直到其中一个父类回调方法 返回 false
    或者直到结束
    --返回false 则立即中断后续的转发

]]



button_class = extends( panel_class ,{
    button_map = {},

    create = function (image_path,param_x, param_y, width, height)
        local index = ui_base_class.create()
        local ui = {
            id ='button_object_'..tostring(index),
            type = "button",
            x = param_x,
            y = param_y,
            w = width,
            h = height,
            toggle = true,
            children = {}
        }
        local object = ui
        if type(image_path) == 'table' then
            for key,value in pairs(image_path) do
                ui[key]=value
            end
        else
            ui.normal_image = image_path
        end
        js.create(ui)
        object._index = index
        object.is_enable = true
        setmetatable(object,{__index = button_class})
        button_class.button_map[object.id] = object
        return object
    end,

    add_child = function (parent_object,image_path,param_x, param_y, width, height)
        local index = ui_base_class.create()
        local ui = {
            id ='button_object_'..tostring(index),
            type = "button",
            x = param_x,
            y = param_y,
            w = width,
            h = height,
            toggle = true,
            children = {}
        }
        if type(image_path) == 'table' then
            for key,value in pairs(image_path) do
                ui[key]=value
            end
        else
            ui.normal_image = image_path
        end
        js.add_child(parent_object.id,ui)
        local object = ui
        object._index = index
        object.parent = parent_object
        object.is_enable = true
        setmetatable(object,{__index = button_class})
        button_class.button_map[object.id] = object
        return object
    end,

    destroy = function (self)
        for i,child in ipairs(self.children) do
            child:destroy()
        end
        if self.is_dead ~= true then 
            self.is_dead = true
            if self:has_animation() == true and (self.parent == nil or  self.parent.id == nil)then 
                self.animation_texture:destroy()
                self.animation_texture = nil
            end
            ui_base_class.destroy(self._index)
            js.remove_control(self.id)   
            button_class.button_map[self.id] = nil
        end
    end,
    --给按钮对象 添加动画对象 参数 动画的尺寸 宽 高 且以按钮为中心
    add_animation = function (self,width,height)
        local ox,oy,oz
        local x = width / 2 - self.w / 2 
        local y = height / 2 - self.h / 2
        if self:has_animation() == false then
            if self.parent ~= nil and self.parent.id ~= nil then
                ox,oy,oz = self.x,self.y,(self.z_index or 0)
                self.animation_texture = self.parent:add_texture({normal_image = '',enable_animation = true},ox - x, oy - y,width,height)
            else
                ox,oy,oz = self:get_real_position()
                self.animation_texture = texture_class.create({normal_image = '',enable_animation = true},ox - x, oy - y,width,height)
            end
            self.animation_texture:set_z_index(oz + 1)
        else
            if self.parent ~= nil and self.parent.id ~= nil then
                ox,oy,oz = self.x,self.y,(self.z_index or 0)
            else
                ox,oy,oz = self:get_real_position()
            end
            self.animation_texture:set_position(ox - x,oy - y)
            self.animation_texture:set_control_size(width,height)
        end
    end,

    remove_animation = function (self)
        if self:has_animation() == false then 
            box_print('先初始化调用 add_animation 再使用remove_animation函数')
            return 
        end
        if self.parent ~= nil and self.parent.id ~= nil then
            for index,object in ipairs(self.parent.children) do
                if object.id == self.animation_texture.id then 
                    table.remove(self.parent.children,index)
                end
            end   
        end
        self.animation_texture:destroy()
        self.animation_texture = nil
    end,
    --动画路径 动画数量 是否循环 播放的速度 1 为最快 越大越慢
    play_animation = function (self,image_path,count,bool,speed)
        if self:has_animation() == false then 
            box_print('先初始化调用 add_animation 再使用play_animation函数')
            return 
        end
        self.animation_texture:play_animation(image_path,count,bool,speed)
    end,

    stop_animation = function (self)
        if self:has_animation() == false then 
            box_print('先初始化调用 add_animation 再使用stop_animation函数')
            return 
        end
        self.animation_texture:stop_animation()
    end,
    has_animation = function (self)
        return self.animation_texture ~= nil
    end,

    set_enable_drag =function (self, enable)
        js.set_enable_drag(self.id,enable)  
    end,
    set_enable = function (self,enable,reason)
        self.is_enable = enable
        js.set_enable(self.id,enable,reason)  
    end,
    --设置冷却
    set_cooldown = function (self, left_time, total_time, show_text)
        js.set_cooldown(self.id,left_time, total_time, show_text)
    end,
    --隐藏冷却
    hide_cooldown = function (button_id)
        js.hide_cooldown(self.id)
    end,
    spell_slot_bindings = function (self,slot)
        config.spell_slot_bindings[slot] = {'button_object_'..tostring(self._index)}
    end,
})

local button_event = {}

--鼠标指向事件
button_event.on_button_mouse_enter = function (button_id)
    local button = button_class.button_map[button_id]
    if button ~= nil then
        event_callback('on_button_mouse_enter',button)
    end
end

button_event.on_button_mouse_leave = function (button_id)
    local button = button_class.button_map[button_id]
    if button ~= nil then
        event_callback('on_button_mouse_leave',button)
    end
    ui_base_class.remove_tooltip()
end

--鼠标点击按钮事件
button_event.on_button_clicked = function (button_id)
    local button = button_class.button_map[button_id]
    if button ~= nil then
        event_callback('on_button_clicked',button)
    end
end

--鼠标右键按钮事件
button_event.on_button_right_clicked = function (button_id)
    local button = button_class.button_map[button_id]
    if button ~= nil then
        event_callback('on_button_right_clicked',button)
    end
end


--开始拖放按钮
button_event.on_button_begin_drag = function (button_id)
    local button = button_class.button_map[button_id]
    if button ~= nil then
        event_callback('on_button_begin_drag',button)
    end
end
--结束拖放
button_event.on_button_drag_and_drop = function (info_table)
    local button_id = info_table.source_id or ''
    local button = button_class.button_map[button_id]
    local target_id =info_table.target_id or ''
    local target_button = button_class.button_map[target_id] 
 
    if button ~= nil then
        event_callback('on_button_drag_and_drop',button,target_button)
    end
end
--拖放更新事件
button_event.on_button_update_drag = function (info_table)
    local button_id = info_table.button_id
    local button = button_class.button_map[button_id]
    
    if button ~= nil then
        local icon = {id=info_table.new_icon_id}
        setmetatable(icon,{__index = button_class})
        event_callback('on_button_update_drag',button,icon,info_table.x,info_table.y)
    end
        
end
--按下按钮
button_event.on_button_mousedown = function(button_id)
    local button = button_class.button_map[button_id]
    if button ~= nil then
        event_callback('on_button_mousedown',button)
    end
end

--弹起按钮
button_event.on_button_mouseup = function(button_id)
    local button = button_class.button_map[button_id]
    if button ~= nil then
        event_callback('on_button_mouseup',button)
    end
end


js.register_event(button_event)--注册事件

return button_event 