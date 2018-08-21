require 'ui.base.class'
--[[

    进度条类 

]]
progress_bar_class = extends( ui_base_class, {
    --需要文本属性 就写在最后一个参数里 作为table类型 相同的属性连接到object上
    --shape 为形状 是string类型 如果填 'rect' 则表示是 矩形进度条 填 'round' 则是圆形进度条 不填默认为矩形进度条
    create = function (image_path,x,y,width,height,shape,info_table)
        local index = ui_base_class.create()
        local object = {
            id ='progress_bar_class'..tostring(index),
            x = x,
            y = y,
            w = width,
            h = height,
            show_text = type(info_table) == 'table' and info_table.font_size ~= nil
        }
        if type(info_table) == 'table' then
            for key,value in pairs(info_table) do 
                object[key] = value
            end
        end
        if shape == 'round' then 
            object.type = 'rounded_progress_bar'
            object.mask_image = image_path
        else
            object.background_image = image_path
            object.type = 'progress_bar'
        end
        js.add_child(  json.encode(object))
        object._index = index
        setmetatable(object,{__index = progress_bar_class})
        return object
    end,

    add_child = function (parent_object,image_path,x,y,width,height,shape,info_table)
        local index = ui_base_class.create()
        local object = {
            id ='progress_bar_class'..tostring(index),
            x = x,
            y = y,
            w = width,
            h = height,
            show_text = type(info_table) == 'table' and info_table.font_size ~= nil
        }
        if type(info_table) == 'table' then
            for key,value in pairs(info_table) do 
                object[key] = value
            end
        end
        if shape == 'round' then 
            object.type = 'rounded_progress_bar'
            object.mask_image = image_path
        else
            object.background_image = image_path
            object.type = 'progress_bar'
        end
        js.add_child( parent_object.id, json.encode(object))
        object._index = index
        object.parent = parent_object
        setmetatable(object,{__index = progress_bar_class})
        return object
    end,

    destroy = function (self)
        if self.is_dead ~= true then 
            self.is_dead = true
            ui_base_class.destroy(self._index)
            js.remove_control(self.id)   
        end
        
    end,

    set_max_value = function (self,max_value)
        js.set_max_value(self.id,max_value)
    end,
    set_current_value = function(self,value)
        js.set_current_value(self.id,value)
    end,

})
