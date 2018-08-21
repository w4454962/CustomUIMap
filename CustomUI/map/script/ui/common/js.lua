
local ui = require 'jass.ui'
js = {} 

js.module_list = {} 

js.command_list = {}

local mt = {}

setmetatable(js,mt)

function js.register_event(module)
    for index,tbl in ipairs(js.module_list) do 
        if tbl == module then 
            return 
        end 
    end 
    table.insert(js.module_list,module)
end 

function js.callbacks(func_name,...)
    for index,module in ipairs(js.module_list) do 
        local func = module[func_name]
        if func ~= nil then 
            func(...)
        end 
    end 
end 


function js.call(func_name,...)
    local args = {...}
    local buffer = {}
    local paramCount = select('#', ...)
    for i = 1,paramCount do 
        local value = args[i]
        if type(value) == 'string' then 
            buffer[#buffer + 1] = json.encode(value)
        else 
            buffer[#buffer + 1] = tostring(value)
        end 
    end 
    ui.ExecuteJavaScript(func_name,table.unpack(buffer))
end 

function js.tick_call(func_name,...)
    local args = {...}
    local buffer = {}
    local paramCount = select('#', ...)
    for i = 1,paramCount do 
        local value = args[i]
        if type(value) == 'table' then 
            buffer[#buffer + 1] = json.encode(value)
        else 
            buffer[#buffer + 1] = tostring(value)
        end 
    end 
    ui.InvokeFrontEndMethod(func_name,table.unpack(buffer))
end

function js.add_tick_call(func_name,...)
    local args = {...}
    local command = {
        name = func_name,
        args = args
    }
    local paramCount = select('#', ...)
    for i = 1,paramCount do 
        local value = args[i]
        if value == nil then 
            args[i] = "nil"
        end 
    end 
    table.insert(js.command_list,json.encode(command))
end 

function js.create(...)
    js.add_child("nil",...)
end 
function js.init()
    local base_panel = {
        need_clip = false,
        content = {
            {
                id ='base_panel',
                type = "panel",
            }
        }
    }
    js.tick_call("create_custom_ui",base_panel)
end 

mt.__index = function (self,name)
    self.name = name 
    return self 
end 

mt.__call = function (self,...)
    if self.name then 
        self.add_tick_call(self.name,...)
        self.name = nil 
    else 
        self.tick_call(...)
    end 
end 

local event = {}
event.on_update = function ()
    if #js.command_list > 0 then 
        local s = {'['}
        for index,command in ipairs(js.command_list) do 
            s[#s + 1] = command
            s[#s + 1] = ','
        end 
        s[#s + 1] = ']'
        print(table.concat(s))
        ui.InvokeFrontEndMethod("execute_command_list",table.concat(s))
        js.command_list = {}
    end    
end

js.register_event(event)