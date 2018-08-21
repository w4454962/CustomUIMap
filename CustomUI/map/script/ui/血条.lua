local life_bar = {}

local LifeBarClass 
--继承面板类 绘制一个血条对象 
LifeBarClass = extends(panel_class,{
    create = function (unit)
        --创建一个面板用于绑定UI对象
        local panel = panel_class.create('image/黑色.png',0,0,300,32)
        
        --给面板 添加一个 进度条对象  rect = 矩形进度条 
        panel.bar = panel:add_progress_bar('image/黄色.png',0,0,300,32,'rect')

        --给面板添加一个文本  center 是居中
        panel.text = panel:add_text('0',0,4,300,32,21,'center')
        panel.text:set_color(255,0,255,1)
        panel.unit = unit 

        setmetatable(panel,{__index = LifeBarClass})
        panel:hide()
        return panel
    end,

    on_update = function (self)

        local life = GetUnitState(self.unit, UNIT_STATE_LIFE)
        local max_life = GetUnitState(self.unit, UNIT_STATE_MAX_LIFE)
    
        local x,y,z = GetUnitX(self.unit),GetUnitY(self.unit),GetUnitFlyHeight(self.unit)
        local screenX,screenY = ui.WorldToScreen(x,y,z + 200)
        --不在窗口内 不绘制 or 生命小于 0 不绘制
        if screenX < -self.w or screenX > 1920 + self.w 
        or screenY < -self.h or screenX > 1080 + self.h
        or life < 1 then 
            self:hide()
            return 
        end 
        
        self:show()
        self:set_position(screenX - self.w / 2,screenY)

        local str = string.format("%.0f / %.0f (%.2f%%)",life,max_life,life / max_life * 100)
        self.text:set_text(str)
    
        self.bar:set_current_value(life)
        self.bar:set_max_value(max_life)

    end,

})

life_bar.unit_map = {}

life_bar.create_bar = function (unit)
    if life_bar.unit_map[unit] ~= nil then 
        return life_bar.unit_map[unit]
    end 

    life_bar.unit_map[unit] = LifeBarClass.create(unit) 
    return bar
end 


--逻辑帧事件
life_bar.on_update = function ()
    for unit,bar in pairs(life_bar.unit_map) do 
        bar:on_update()
    end 
end 

js.register_event(life_bar)


return life_bar