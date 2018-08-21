      

mouse_label = nil 


local function create_mouse_label ()
    local w = 58
    local h = 52

    local label = {
        id ='mouse',
        type = "mouse_label",
        x = 0,
        y = 0,
        w = w * 8,
        h = h * 4,
        normal_image = "UI\\Cursor\\HumanCursor.blp",
        z_index = 9999, --层级
    }
    label.x = label.w / 2 - w / 4
    label.y = label.h / 2 - w / 8
    js.create(label)
    js.rect(label.id,nil,w,h,nil)

    mouse_label = label
end 
        

create_mouse_label()