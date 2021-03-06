var MANIFEST_FILE = "/manifest.data.json"; // One file that cannot change
var $INFO = function(x){console.log(x);};
var $DEBUG = function(x){console.log(x);};
var $ERROR = function(x){console.log(x);};
//var DEBUG = $.noop;

$.ajaxSetup({ processData: false });

var profiles = {};
var c_localid = "me";

function Profile(){
    this.dir = "";
    this.manifest;
    this.info;
    this.friends;
    this.wall;
    this.display = true;

    this.load_from_info = function(info){
        this.info = info;
        this.dir = info.dir;
        this.load_manifest();
    }
    
    this.draw = function(){
        this.display = true;
        if(!this.manifest){
            this.load_manifest();
        }else if(!this.info){
            this.load_info();
        }else if(!this.friends){
            this.draw_info();
            this.load_friends();
        }else if(!this.wall){
            this.draw_info();
            this.draw_friends();
            this.load_wall();
        }else{
            this.draw_info();
            this.draw_wall();
            this.draw_friends();
        }
    }
    
    this.load_manifest = function(){
        $INFO("loading manifest");
        $.ajax({ type: 'GET',
                 url: this.dir + MANIFEST_FILE,
                 context: this,
                 success: 
                    function(data){
                        this.manifest = data;
                        $INFO("manifest loaded");
                        $INFO(this.manifest);
                        if(!this.info)
                            this.load_info();
                        else if(!this.friends)
                            this.load_friends();
                        else if(!this.wall)
                            this.load_wall();
                    }
        });
    }

    this.load_info = function(){
        $INFO("loading info");
        $.ajax({ type: 'GET',
                 url: this.dir + this.manifest.data.info,
                 context: this,
                 success: 
                    function(data){
                        this.info = data;
                        $INFO("info loaded");
                        $INFO(this.info);
                        
                        if(this.display)
                            this.draw_info();
                        
                        if(!this.manifest)
                            this.load_manifest();
                        else if(!this.friends)
                            this.load_friends();
                        else if(!this.wall)
                            this.load_wall();
                    }
        });
    }

    this.update_info = function(path, obj){
        $.post(this.dir + this.manifest.data.info, JSON.stringify(this.info, null, 2));
        $INFO("updating info to: " + this.manifest.data.info);
    }

    this.draw_info = function(obj){
        $("div#info").html( $("#info_pane").render(this.info) );
    }


    this.load_friends = function(){
        $INFO("loading friends");
        $.ajax({ type: 'GET',
                 url: this.dir + this.manifest.data.friends,
                 context: this,
                 success:
                     function(data){
                        this.friends = data;
                        $INFO("friends loaded");
                        $INFO(this.friends);
                        
                        if(this.display)
                            this.draw_friends();
                        
                        if(!this.manifest)
                            this.load_manifest();
                        else if(!this.info)
                            this.load_info();
                        else if(!this.wall)
                            this.load_wall();
                    }
        });
    }

    this.draw_friends = function(obj){
        var obj = this.friends;
        $("div#friends").html($("#friends_pane").render(obj));
    }

    this.load_wall = function(){
        $INFO("loading wall");
        $.ajax({ type: 'GET',
                 url: this.dir + this.manifest.data.wall,
                 context: this,
                 success: 
                     function(data){
                        this.wall = data;
                        $INFO("wall loaded");
                        $INFO(this.wall);
                        
                        if(this.display)
                            this.draw_wall();
                        
                        if(!this.manifest)
                            this.load_manifest();
                        else if(!this.friends)
                            this.load_friends();
                        else if(!this.info)
                            this.load_info();
                    }
        });
    }

    this.update_wall = function(){
        var obj = this.wall;
        
        obj.posts.sort(function(a, b){ return (new Date(b.time)) - (new Date(a.time)); });
        $.post(this.dir + this.manifest.data.wall, JSON.stringify(obj, null, 2));
        $INFO("updating wall to: " + this.dir + this.manifest.data.wall);
    }

    this.draw_wall = function(){
        var walldiv = $("div#wallposts");
        walldiv.html(""); // clear
        for(var i = 0; i < this.wall.posts.length; i++){
            $("#wall_post").render(this.wall.posts[i]).appendTo(walldiv);
        }
    }
}

$(document).ready(function(){
    /* Test -- copy manifest.data.json to wall.data.json
    $.get("http://localhost:8000/manifest.data.json", "", function(data){
        console.log(data);
        $.post("http://localhost:8000/wall.data.json", data, console.log);
    }, "text");
    */
    profiles.me = new Profile();
    profiles.me.load_manifest();
    
});

$("div#new-wall-post input:button").click(function(){
    var text = $(this).siblings("textarea").val();
    $(this).siblings("textarea").val("");
    profiles[c_localid].wall.posts.push({ user : profiles.me.info.user,
                                           time : (new Date()).toUTCString(),
                                           content : text });
    
    profiles[c_localid].update_wall();
    profiles[c_localid].draw_wall();
});

$.address.change(function(ev){
    var pathnames = ev.pathNames;
    if(pathnames[0] == "friend"){
        var localid = pathnames[1];
        $DEBUG("load friend: " + localid);
        var fr = get_friend_by_localid(profiles.me, localid);
        if(fr){
            c_localid = localid;
            if(!profiles[localid]){
                profiles[localid] = new Profile();
                profiles[localid].load_from_info(fr);
            }else{
                profiles[localid].draw();
            }
        }else{
            $ERROR("friend not found: " + pathnames[1]);
        }
    }
});

function get_friend_by_localid(profile, localid){
    // Look up friend (of profile) info object by 'localid'
    
    // Make sure it is not yourself
    if(localid == "me"){
        return info;
    }
    
    for(var i = 0; i < profile.friends.friends.length; i++){
        if(profile.friends.friends[i].localid == localid){
            return profile.friends.friends[i];
        }
    }
    
    return null;
}

