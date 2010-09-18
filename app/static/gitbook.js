var MANIFEST_FILE = "/manifest.data.json"; // One file that cannot change
var $INFO = function(x){console.log(x);};
var $DEBUG = function(x){console.log(x);};
var $ERROR = function(x){console.log(x);};
//var DEBUG = $.noop;
var manifest = {};
var info = {};
var wall = {};

$.ajaxSetup({ processData: false });

function load_manifest(){
    $INFO("loading manifest");
    $.get(MANIFEST_FILE, null, function(data){
        manifest = data;
        $INFO("manifest loaded");
        $INFO(manifest);
        load_info();
    });
}

function load_info(){
    $INFO("loading info");
    $.get(manifest.data.info, null, function(data){
        info = data;
        $INFO("info loaded");
        $INFO(info);
        draw_info();
        
        load_friends();
    });
}

function update_info(path, obj){
    path = path || manifest.data.info;
    obj = obj || info;
    
    $.post(path, JSON.stringify(obj, null, 2));
    $INFO("updating info to: " + path);
}

function draw_info(obj){
    obj = obj || info;
    $("div#info").html( $("#info_pane").render(obj) );
}


function load_friends(){
    $INFO("loading friends");
    $.get(manifest.data.friends, null, function(data){
        friends = data;
        $INFO("friends loaded");
        $INFO(friends);
        draw_friends();
        load_wall();
    });
}

function draw_friends(obj){
    obj = obj || friends;
    $("div#friends").html($("#friends_pane").render(obj));
}

function load_wall(){
    $INFO("loading wall");
    $.get(manifest.data.wall, null, function(data){
        wall = data;
        $INFO("wall loaded");
        $INFO(wall);
        draw_wall();
    });
}

function update_wall(path, obj){
    path = path || manifest.data.wall;
    obj = obj || wall;
    
    obj.posts.sort(function(a, b){ return (new Date(b.time)) - (new Date(a.time)); });
    $.post(path, JSON.stringify(obj, null, 2));
    $INFO("updating wall to: " + path);
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

