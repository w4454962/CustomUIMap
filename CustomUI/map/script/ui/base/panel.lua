require 'ui.base.class'

--[[

    面板类的封装

]]
panel_class = extends( ui_base_class , {
    panel_map = {},
    --最后一个参数是 是否允许滚动 默认参数为 false 可填 可不填  
    create = function (image_path,param_x, param_y, width, height,scroll)
        local enable = scroll or false
        local index = ui_base_class.create()
        local ui = {
            id = 'panel_object_'..tostring(index),
            type = "panel",
            x = param_x,
            y = param_y,
            w = width,
            h = height,
            enable_scroll = enable,
            background_image = image_path,
            disable_mouse_through = true,
            has_tooltip = true,
            children = {}
        }
        
        js.create(ui)
        local object = ui
        object._index = index
        object.is_show = true
        object.initialized_x = param_x
        object.initialized_y = param_y
        setmetatable(object,{__index = panel_class})
        panel_class.panel_map[object.id] = object
        
        return object
    end,

    add_child = function (parent_object,image_path,param_x,param_y,width,height,scroll)
        local enable = scroll or false
        local index = ui_base_class.create()
        local ui = {
            id = 'panel_object_'..tostring(index),
            type = "panel",
            x = param_x,
            y = param_y,
            w = width,
            h = height,
            enable_scroll = enable,
            background_image = image_path,
            disable_mouse_through = true,
            has_tooltip = true,
            children = {}
        }
        js.add_child(parent_object.id,ui)
        local child = ui
        child.is_show = true
        child.initialized_x = param_x
        child.initialized_y = param_y
        child._index = index
        child.parent = parent_object
        setmetatable(child,{__index = panel_class})
        panel_class.panel_map[child.id] = child
        table.insert(parent_object.children,child)
        return child
    end,

    destroy = function (self)
        for i,child in ipairs(self.children) do
            child:destroy()
        end
        if self.is_dead ~= true then 
            self.is_dead = true
            panel_class.panel_map[self.id] = nil
            ui_base_class.destroy(self._index)
            js.remove_control(self.id)    
        end
    end,

    add_panel = function (self,image_path,param_x,param_y,width,height,scroll)
        return panel_class.add_child(self,image_path,param_x,param_y,width,height,scroll)
    end,
    add_text = function (self, str, x,y,width,height,font_size,align)
        local child = text_class.add_child(self,str,x,y,width,height,font_size,align)
        table.insert(self.children,child)
        return child
    end,
    add_input = function (self, str, x,y,width,height,font_size,align)
        local child = input_class.add_child(self,str,x,y,width,height,font_size,align)
        table.insert(self.children,child)
        return child
    end,
    add_button = function (self,image_path,x,y,width,height)
        local child = button_class.add_child(self,image_path,x,y,width,height)
        table.insert(self.children,child)
        return child
    end,

    add_texture = function (self,image_path,x,y,width,height)
        local child = texture_class.add_child(self,image_path,x,y,width,height)
        table.insert(self.children,child)
        return child
    end,

    add_canvas = function (self,x,y,width,height,color)
        local child = canvas_class.add_child(self,x,y,width,height,color)
        table.insert(self.children,child)
        return child
    end,

    add_progress_bar = function (self,x,y,width,height,shape,info_table)
        local child = progress_bar_class.add_child(self,x,y,width,height,shape,info_table)
        table.insert(self.children,child)
        return child
    end,

     --添加一个可以拖动的标题 来拖动整个界面
    add_title_button = function (self,image_path,title,x,y,width,height,font_size)
        local button = self:add_button(image_path,x,y,width,height)
        button.text = button:add_text(title,0,0,width,height,font_size or height/2,'center')
        button:set_enable_drag(true)
        local z = self.z_index or 1
        button:set_z_index(z + 1)
        --移动
        button.on_button_update_drag = function (self,icon_button,x,y)
            icon_button:set_control_size(0,0)
            self.parent:set_position(x,y)
            return false 
        end
        button.on_button_clicked = function (self)
            return false
        end 
        button.on_button_mouse_enter = function (self)
            return false
        end 
        return button
    end,

    --添加一个关闭按钮 点击即可关闭
    add_close_button = function (self,x,y,width,height)
        local info = {
            normal_image    = 'image/Role/diany_02.png',
            hover_image     = 'image/Role/diany_02_hui1.png',
            active_image    = 'image/Role/diany_02_liang1.png',
        }
        width = width or 28
        height = height or 28
        x = x or self.w - width * 1.5
        y = y or 14

        local button = self:add_button(info,x,y,width,height)
        local z = self.z_index or 1
        button:set_z_index(z + 2)
        --按钮点击关闭
        button.on_button_clicked = function (self)
            self.parent:hide()
        end 
        --按钮文本提示
        --button.on_button_mouse_enter = function (self)
        --    ui_base_class.set_tooltip(self,"关闭",0,0,200,32,16) 
        --end 
        return button
    end,
    --设置滚动条y轴坐标
    scroll_to = function (self,y)
        js.scroll_to(self.id,y)
    end,


    --设置UI位置回到初始化原点
    back_initialized_position = function (self)
        self:set_position(self.initialized_x,self.initialized_y)
    end,

        
    add_error_tooltip = function (self,image_path,x,y,width,height)
        local button = self:add_button(image_path,x,y,width,height)
        local font_size = 21
        button.text = button:add_text('',0,height / 2 - font_size / 2,width,height,font_size,'center')
        button:set_z_index(7000)
        --é”™è¯¯æ¶ˆæ¯åˆ—è¡¨
        self.error_message_list = {}
        self.error_button = button
        button:hide()
        button.enter_message = function (button)
            local self = button.parent
            if #self.error_message_list == 0 then 
                timer.stop('error_'..self.id)
                button:hide()
                return
            end
            local str = self.error_message_list[1]
            local text = self.error_button.text
            text:set_text(str)
            table.remove(self.error_message_list,1)
        end
        
        button.on_button_clicked = function (button)
            button:enter_message()
            return false
        end
    end,

    add_error_tooltip = function (self,image_path,x,y,width,height)
        local button = self:add_button(image_path,x,y,width,height)
        local font_size = 21
        button.text = button:add_text('',0,height / 2 - font_size / 2,width,height,font_size,'center')
        button:set_z_index(7000)
        self.error_message_list = {}
        self.error_button = button
        button:hide()
        button.enter_message = function (button)
            local self = button.parent
            if #self.error_message_list == 0 then 
                timer.stop('error_'..self.id)
                button:hide()
                return
            end
            local str = self.error_message_list[1]
            local text = self.error_button.text
            text:set_text(str)
            table.remove(self.error_message_list,1)
        end
        
        button.on_button_clicked = function (button)
            button:enter_message()
            return false
        end
    end,


    error = function (self,str)
        if self.error_button == nil then 
            return 
        end
        for index,value in ipairs(self.error_message_list) do
            if value == str then 
                return
            end
        end
        table.insert(self.error_message_list,str)
        if self.error_button.is_show == false then 
            self.error_button:show()
            self.error_button:enter_message()
            timer.add('error_'..self.id, nil,function (left_time, total_time,self)
                if #self.error_message_list == 0 then 
                    self.error_button:hide()
                    timer.stop('error_'..self.id)
                    return 
                end
                self.error_button:show()
                self.error_button:enter_message()
            end,function ()
                
            end,self,1000)
        end
    end,


    clear_text_str = function (self)
        for index,text in ipairs(self.children) do
            text:set_text("")
        end
    end,

    --注册一个指向时 改变z轴的事件
    on_panel_clicked = function (self)
    --[[
        for id,panel in pairs(self.panel_map) do
            if panel.parent == nil and panel.is_show == true then
                if panel.z_index == 1000 then 
                    panel:set_z_index(2)
                else
                    panel:set_z_index(1)
                end
            end
        end
        self:set_z_index(1000)]]
    end,
})


local panel_event = {}
--鼠标指向面板事件
panel_event.on_panel_mouse_enter = function (panel_id)
    local panel = panel_class.panel_map[panel_id]
    if panel ~= nil and panel.parent == nil and panel.on_panel_mouse_enter~=nil then
        panel:on_panel_mouse_enter()
    end
end

--鼠标离开面板事件
panel_event.on_panel_mouse_leave = function (panel_id)
    local panel = panel_class.panel_map[panel_id]
    if panel ~= nil and panel.parent == nil and panel.on_panel_mouse_leave~=nil then
        panel:on_panel_mouse_leave()
        ui_base_class.remove_tooltip()
    end
end

--鼠标点击面板事件
panel_event.on_panel_clicked = function (panel_id)
    local panel = panel_class.panel_map[panel_id]
    if panel ~= nil and panel.parent == nil and panel.on_panel_clicked~=nil then
        panel:on_panel_clicked()
    end
end

js.register_event(panel_event)--注册事件


return panel_event 