var MANIFEST_FILE = "/manifest.data.json"; // One file that cannot change
var DEBUG = function(x){console.log(x);};
//var DEBUG = $.noop;
var manifest = {};
var info = {};
var wall = {};

$.ajaxSetup({ processData: false });

function load_manifest(){
    DEBUG("loading manifest");
    $.get(MANIFEST_FILE, null, function(data){
        manifest = data;
        DEBUG("manifest loaded");
        DEBUG(manifest);
        load_info();
    });
}

function load_info(){
    DEBUG("loading info");
    $.get(manifest.data.info, null, function(data){
        info = data;
        DEBUG("info loaded");
        DEBUG(info);
        //update_info();
        load_friends();
    });
}

function load_friends(){
    //TODO
    load_wall();
}

function load_wall(){
    DEBUG("loading wall");
    $.get(manifest.data.wall, null, function(data){
        wall = data;
        DEBUG("wall loaded");
        DEBUG(wall);
        draw_wall();
    });
}

function update_wall(path, obj){
    path = path || manifest.data.wall;
    obj = obj || wall;
    
    obj.posts.sort(function(a, b){ return (new Date(b.time)) - (new Date(a.time)); });
    $.post(path, JSON.stringify(obj, null, 2));
    DEBUG("updating wall to: " + path);
}


function draw_wall(obj){
    obj = obj || wall;
    var walldiv = $("div#wallposts");
    walldiv.html(""); // clear
    for(var i = 0; i < obj.posts.length; i++){
        $("#wall_post").render(obj.posts[i]).appendTo(walldiv);
    }
}

$(document).ready(function(){
    /* Test -- copy manifest.data.json to wall.data.json
    $.get("http://localhost:8000/manifest.data.json", "", function(data){
        console.log(data);
        $.post("http://localhost:8000/wall.data.json", data, console.log);
    }, "text");
    */
    load_manifest();
});

$("div#new-wall-post input:button").click(function(){
    var text = $(this).siblings("textarea").val();
    $(this).siblings("textarea").val("");
    wall.posts.push({ user : info.user,
                      time : (new Date()).toUTCString(),
                      content : text });
    
    update_wall();
    draw_wall();
});

