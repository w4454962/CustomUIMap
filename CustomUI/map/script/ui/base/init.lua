require 'ui.base.class'
require 'ui.base.panel'
require 'ui.base.button'
require 'ui.base.text'
require 'ui.base.texture'
require 'ui.base.canvas'
require 'ui.base.progress'
require 'ui.base.input'
if base_is_loaded ~= nil  then 
    return base_is_loaded
end

local ui = {}
local message_index = 0

base_is_loaded = ui


ui.base_event = {
    OnInitUnit = function (unit_id)
        ui.unit = unit_data_class.get_object(unit_id)
    end,
    
    on_print = function (str)
        ui_print(str)
    end,

}
ui.event = {}


ui.StringHash = common.StringHash



ui.register_event = function (name,event_table)
    ui.event[name]=event_table
end
--你的自定义消息写在这 分开
ui.on_message = function (event_id,message)
   
end

ui.send_message = function (info)
    if info == nil and type(info) ~= 'table' then 
        return
    end
    message_index = message_index + 1
    info._index = message_index
    local msg = string.format("ui,%s",ui.encode(info))
    --debugf('Client Send '..msg)
    game.SendCustomMessage(msg)
end

ui.on_custom_ui_event = function (event_id,message)
    if string.sub(message,1,3)~="ui," then
	    ui.on_message(event_id,message)
		return
    end
    --debugf('Client Recv '..message)
    local data = message:sub(4,message:len())
    local info_table = ui.decode(data)
    if info_table == nil then
        return
    end
    local event_type = info_table.type
    local func_name = info_table.func_name
    local params = info_table.params
    if event_type and func_name then
        local event_table = ui.event[event_type]
        if event_table ~= nil then
            local func = event_table[func_name]
            if func ~= nil then
                ui.player = player
                if params == nil then
                    func()
                else
                    func(table.unpack(params,1,#params))
                end
            end
        end
    end

end

--将lua表编码成字符串
ui.encode = function (tbl)
    local type = type
    local pairs = pairs
    local format = string.format
    local find = string.find
    local tostring = tostring
    local tonumber = tonumber
    local mark = {}
    local buf = {}
    local count = 0
    local function dump(v)
        local tp = type(v)
        if mark[v] then
            error('表结构中有循环引用')
        end
        mark[v] = true
        buf[#buf+1] = '{'
        for k, v in pairs(v) do
            count = count + 1
            if count > 10000 then
                error('表太大了')
            end
            local tp = type(k)
            if tp == 'number' then
                buf[#buf+1] = format('[%s]=', k)
            elseif tp == 'string' then
                if find(k, '[^%w_]') then
                    buf[#buf+1] = format('[%q]=', k)
                else
                    buf[#buf+1] = k..'='
                end
            else
                error('不支持的键类型：'..tp)
            end
            local tp = type(v)
            if tp == 'table' then
                dump(v)
                buf[#buf+1] = ','
            elseif tp == 'number' then
                buf[#buf+1] = format('%q,', v)
            elseif tp == 'string' then
                buf[#buf+1] = format('%q,', v)
            elseif tp == 'boolean' then
                buf[#buf+1] = format('%s,', v)
            else
                error('不支持的值类型：'..tp)
            end
        end
        buf[#buf+1] = '}'
    end
    dump(tbl)
    return table.concat(buf)
end
--将字符串 加载为lua表
ui.decode = function (buf)
    local f, err = load('return '..buf)
    if not f then
        print(err)
        return nil
    end
    local suc, res = pcall(f)
    if not suc then
        print(res)
        return nil
    end
    return res
end

ui.copy_table = function (old)
    local new = {}
    for key,value in pairs(old) do
        if type(value) == 'table' then
            new[key] = ui.copy_table(value)
        else
            new[key] = value
        end
    end
    return new
end
ui.get_table_size = function (tbl)
    local count = 0 
    for key,value in pairs(tbl) do
        count = count + 1
    end
    return count
end

ui.get_mouse_pos = function ()
    local x = japi.GetMouseVectorX() / 1024
    local y = (-(japi.GetMouseVectorY() - 768)) / 768 
    x = x * 1920
    y = y * 1080
    return x,y
end

ui.set_mouse_pos = function (x,y)
    x = x / 1920 * 1024
    y = 768 - y / 1080 * 768
    japi.SetMousePos(x,y)
end 

js.register_event(ui)--注册事件
--ui.register_event('base',ui.base_event)
return ui