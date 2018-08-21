package.path = package.path .. ';'
.. '?\\init.lua;'
.. 'script\\?.lua;'
.. 'script\\?\\init.lua;'


require 'script'

--[[

 local panel = {
    id ='button_object',
    type = "button",
    x = 0,
    y = 0,
    w = 64,
    h = 64,
    toggle = true,
    normal_image = "image/宝箱.png",
    toggle_image = "image/blood1.png",
}
js.create(panel)


local button = button_class.create("image/blood1.png",300,100,256,256)

button.on_button_clicked = function (button)
    print(button.id)
end 



message.hook = function (msg)

    if msg.type == "key_down" and msg.code == 512 then 
        print("aa")
        
    end 
    return true
end 
]]

--[[
local label2 =   {
    id = 'name',
    type = "label",
    x = 500,
    y = 500,
    w = 64,
    h = 64,
    text = "名字",
    font_size = 32,
    normal_image = "image/blood1.png",
}

ui.InvokeFrontEndMethod("add_child","nil",json.encode(label2))


local video = {
    id ='video_object',
    type = "video",
    x = 1920/2-768/2,
    y = 1080/2-512/2,
    w = 768,
    h = 512,
}

ui.InvokeFrontEndMethod("add_child","nil",json.encode(video))
ui.InvokeFrontEndMethod("play_video","video_object","mv.webm","","true","false")

]] 
local life_bar = require 'ui.血条'
local unit = jass.CreateUnit(jass.Player(0), string.unpack(">I4",'Hpal'), - 522.8, - 737.9, 337.983)

life_bar.create_bar(unit)


japi.hide_interface(0)
jass.TimerStart(jass.CreateTimer(),1,false,function ()
    jass.DestroyTimer(jass.GetExpiredTimer())
    japi.set_black_borders(0,0)
end)
