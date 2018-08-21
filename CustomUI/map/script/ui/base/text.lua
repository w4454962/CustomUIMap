require 'ui.base.panel'

--[[
        text 文本类
        
    将label 拆分成 text 跟 texture   
    text只负责显示文本
    texture 负责显示图像跟其他动画效果 还有 label的响应事件

]]

text_class = extends ( panel_class , {
    --最后一个参数的默认参数 是left 可填 可不填       
    create = function (str,param_x, param_y, width, height, size,param_align)
        local align = param_align or "left"
        local index = ui_base_class.create()
        local ui =  {
            id ='text_object_'..tostring(index),
            type = "label",
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
        setmetatable(object,{__index = text_class})
        return object
    end,
    add_child = function (parent_object,str,param_x, param_y, width, height, size,param_align)
        local align = param_align or "left"
        local index = ui_base_class.create()
        local ui = {
            id ='text_object_'..tostring(index),
            type = "label",
            x = param_x,
            y = param_y,
            w = width,
            h = height,
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
        setmetatable(object,{__index = text_class})
        return object
    end,
    --拷贝对象函数 除了self 其余均可填 不填 不填时默认照self对象里的进行拷贝
    copy = function (self,str,param_x, param_y, width, height, size, param_align)
        local align = param_align or "left"
        local index = ui_base_class.create()
        local ui = {
            id ='text_object_'..tostring(index),
            type = "label",
            x = param_x or self.x,
            y = param_y or self.y,
            w = width or self.w,
            h = height or self.h,
            text = str or self.text,
            font_size = size or self.size,
            text_align = param_align or self.text_align,
            children = {}
        }
        local parent_id = "nil"
        if self.parent~=nil then
            parent_id = self.parent.id or parent_id
        end
        js.add_child(parent_id,ui)
        ui._index = index
        ui.parent = self.parent
        
        for key,value in pairs(self) do
            if ui[key] == nil then
                ui[key]=value
            end
        end
        setmetatable(ui,{__index = text_class})
        return ui
    end,
    destroy = function (self)
        for i,child in ipairs(self.children) do
            child:destroy()
        end
        if self.is_dead ~= true then
            self.is_dead = true
            ui_base_class.destroy(self._index)
            js.remove_control(self.id)    
        end
    end,

    set_text = function (self,str)
        self.text = str
        js.set_text(self.id,str)
    end,

    set_color = function (self,red,green,blue,alpha)
        local color = string.format("rgba(%d,%d,%d,%f)",red,green,blue,alpha)
        self.color = {
            r = red,
            g = green,
            b = blue,
            a = alpha
        }
        js.set_color(self.id,color)
    end,

    set_alpha = function (self,alpha)
        self:set_color(self.color.r,self.color.g,self.color.b,alpha)
    end,
})
