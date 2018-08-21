
Interface.rect = function (control_id,top,right,bottom,left) {
    var object = $("#" + control_id);

    if (top != "nil"){
        top = top + "px ";
    } else {
        top = "auto ";
    }

    if (right != "nil"){
        right = right + "px ";
    } else {
        right = "auto ";
    }
    
    if (bottom != "nil"){
        bottom = bottom + "px ";
    } else {
        bottom = "auto ";
    }

    if (left != "nil"){
        left = left + "px ";
    } else {
        left = "auto ";
    }

    object.css("clip","rect(" + top + right + bottom + left + ")");
}


$(function () {
    engine.on("rect", Interface.rect);
});