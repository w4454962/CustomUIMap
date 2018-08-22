package.path = package.path .. ';'
.. '?\\init.lua;'
.. 'script\\?.lua;'
.. 'script\\?\\init.lua;'


require 'script'

--[[

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
jass.TimerStart(jass.CreateTimer(),0.1,false,function ()
    jass.DestroyTimer(jass.GetExpiredTimer())
    japi.set_black_borders(0,0)
end)
