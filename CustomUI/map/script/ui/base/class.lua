--[[

    基础类的封装 主要重载一些UI功能为对象形式

]]
--类的继承 子类继承父类
function extends (parent_class,child_class)
    setmetatable(child_class,{__index = parent_class})
    return child_class
    
end


function event_callback (event_name,controls,...)
    local retval = true
    if controls[event_name]~= nil then
        retval = controls[event_name](controls,...)
    end
    if retval == nil then 
        retval = true
    end
    --将消息转发到父类对象里
    local object = controls.parent
    while object ~= nil and retval ~= false do
        local method = object[event_name]
        if method ~= nil then
            retval = method(object,controls,...)
        end
        object = object.parent
    end
end


handle_system_class = {
    create = function ()
        local object = {}
        object.top = 1 
        object.stack = {}
        object.map = {}
        object.id_table = {}
        setmetatable(object,{__index = handle_system_class})
        return object
    end,

    destroy = function (self)
        
    end,
    create_handle = function (self)
        local id = self.top
        local stack = self.stack
        if #stack == 0 then
            id = self.top
            self.top = self.top + 1
        else
            id = stack[#stack]
            table.remove(stack,#stack)
            self.map[id] = nil
        end
        self.id_table[id] = 1
        return id
    end,

    close_handle = function (self,id)
        if self.id_table[id] == nil and self.map[id] ~= nil then
            ui_print('重复回收',id)
        elseif self.id_table[id] == nil then
            ui_print('非法回收',id)
        end
        if self.map[id] == nil and self.id_table[id] ~= nil then
            self.map[id] = 1
            self.id_table[id] = nil
            table.insert(self.stack,id)
        end
    end,


}


ui_base_class = {
    ui_handle_system = handle_system_class.create(),
    create = function ()
        local handle = ui_base_class.ui_handle_system:create_handle()
        return handle
    end,
    destroy = function (id)
        ui_base_class.ui_handle_system:close_handle(id)
    end,
    show = function (self)
        self.is_show = true 
        js.show(self.id)
    end,
    
    hide = function (self)
        self.is_show = false
        js.hide(self.id)
    end,
    set_position = function (self,x,y)
        self.x = x 
        self.y = y
        js.set_position(self.id,x,y)
    end,
    set_control_size = function (self,width,height)
        self.w = width
        self.h = height
        js.set_control_size(self.id,width,height)
    end,
    set_z_index = function (self,z_index)
        self.z_index = z_index
        js.set_z_index(self.id,z_index)
    end,

    set_background_image = function (self, image_path)
        if type(image_path)=='string' then
            if image_path:find('.png')==nil and image_path:find('.PNG')==nil then 
                js.set_background_image(self.id,'image/ItemIcon/'..image_path..'.png')   
            else 
                js.set_background_image(self.id,image_path)   
            end
        end
    end,
    
    set_normal_image = function (self,image_path)
        if type(image_path)=='string' then
            if image_path:find('.png')==nil and image_path:find('.PNG')==nil then 
                js.set_normal_image(self.id,'image/ItemIcon/'..image_path..'.png')   
            else 
                js.set_normal_image(self.id,image_path)   
            end
        end
    end,

    set_tooltip = function (self,tip,x,y,width,height,font_size,offset)
        offset = offset or 1
        if type(tip) == 'string' then 
            local panel = {
                id = "ui_tool_tip",
                type = "panel",
                w = width,
                h = height,
                z_index = 1500,
                children ={
                    {
                        
                        id = "ui_tool_tip_text",
                        type = "label",
                        x = 0,
                        y = 0,
                        w = width,
                        font_size = font_size,
                        text_align = "center",
                        text = tip,
                    }
                }
            }
            js.set_tooltip( self.id, json.encode(panel),x,y)
        elseif type(tip) == 'table' then
            for index,data in pairs(tip) do
                local title = data[1]
                local desc = data[2] 
                local panel = {
                    id = "ui_tool_tip" .. tostring(index),
                    type = "panel",
                    w = width,
                    h = height,
                    z_index = 1500,
                    children ={
                        {   
                            id = "ui_tooltip_title"..tostring(index),
                            type = "label",
                            x = 0,
                            y = 0,
                            w = width,
                            h = height,
                            font_size = font_size,
                            text_align = "center",
                            text = title,
                        },
                        {
                            id = "ui_tooltip_tip" .. tostring(index),
                            type = "label",
                            x = 0,
                            y = font_size,
                            w = width,
                            font_size = font_size,
                            text_align = "left",
                            text = desc,
                        }
                    }
                }
                local ox = x + (index - 1) * (width + 50) * offset
                js.set_tooltip( self.id, json.encode(panel),ox,y)
                
            end
        end
    end,
    remove_tooltip = function ()
        common.InvokeFrontEndMethod("remove_tooltip")
    end,

    get_this_class = function (self)
        local metatable = getmetatable(self)
        return metatable.__index
    end,
    get_parent_class = function (self)
        local class = self:get_this_class()
        if class ~= nil then
            local metatable = getmetatable(class)
            return metatable.__index
        end
        return nil
    end,
    show_with_animation = function(self,animation)
        self.is_show = true
        js.show_with_animation( self.id, animation)
    end,
    hide_with_animation = function(self,animation)
        self.is_show = false
        js.hide_with_animation( self.id, animation)
    end,

    point_in_rect = function (self,x,y)
        if x >= self.x and 
            y >= self.y and
            x <= self.x + self.w and
            y <= self.y + self.h 
            
        then
            return true
        end
        return false
    end,
    --获取实际坐标 父控件坐标 + 子控件偏移
    get_real_position = function (self)
        local ox,oy,oz = 0,0,0
        local object = self 
        while object ~= nil do
            ox = ox + (object.x or 0)
            oy = oy + (object.y or 0)
            oz = oz + (object.z_index or 0)
            object = object.parent
        end
        return ox,oy,oz
    end,

    insert = function (self,tbl)
        if type(tbl) ~= 'table' then
            return 
        end
        for key,value in pairs(tbl) do
            self[key] = value
        end
        return self
    end,
   
}

