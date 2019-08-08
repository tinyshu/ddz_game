module.exports = function(info,socket,callindex,gamectr){
   //console.log("playerinfo:"+ JSON.stringify(info))
   var that = {}
   that._nickName = info.nick_name;
   that._accountID = info.account_id;
   that._avatarUrl = info.avatar_url;
   that._gold = info.gold_count;
   that._socket = socket
   that._gamesctr = gamectr
   that._room = undefined
   that._seatindex = 0
   that._isready = false
   //内部使用的发送数据函数
   const _notify = function (type, result ,data, callBackIndex) {
    console.log('notify =' + JSON.stringify(data));
    that._socket.emit('notify', {
        type: type,
        result:result,
        data: data,
        callBackIndex: callBackIndex
    });
};
   

   //通知客户端登录成功，返回数据
   _notify("login_resp",0,{goldcount:that._gold},callindex)

   that._socket.on("disconnect",function(){
        console.log("player disconnect")
        if(that._room){
            that._room.playerOffLine(that)
        }
   })

   //data分3个部分 cmd,{data},callindex
   that._socket.on("notify",function(req){
        var cmd = req.cmd
        var data = req.data
        var callindex = req.callindex
        console.log("_notify" + JSON.stringify(req))
        switch(cmd){
            case "createroom_req":
                that._gamesctr.create_room(data,that,function(err,result){
                    if(err!=0){
                        console.log("create_room err:"+ err)
                    }else{
                        that._room = result.room
                        console.log("create_room:"+ result)
                    }
                   
                    _notify("createroom_resp",err,result.data,callindex)
                })

                break;
                case "joinroom_req":
                   
                    that._gamesctr.jion_room(req.data,that,function(err,result){
                        if(err){
                            console.log("joinroom_req err"+ err)
                            _notify("joinroom_resp",err,null,callindex)
                        }else{
                            //加入房间成功
                            that._room = result.room
                            _notify("joinroom_resp",err,result.data,callindex)
                        }

                    })
                    break
                    case "enterroom_req":
                        if(that._room) {
                            that._room.enter_room(that,function(err,result){
                                if(err!=0){
                                    _notify("enter_room_resp",err,{},callindex)
                                }else{
                                    //enterroom成功
                                    that._seatindex =  result.seatindex
                                    _notify("enter_room_resp",err,result,callindex)
                                }
                              
                            })
                           
                        }else{
                            console.log("that._room is null")
                        }
                        
                        break
                     case "player_ready_notify":   //玩家准备消息通知
                         if(that._room){
                            that._isready = true 
                            that._room.playerReady(that)
                         }
                         break 
                     case "player_start_notify":
                           if(that._room){
                            that._room.playerStart(that,function(err,result){
                                if(err){
                                    console.log("player_start_notify err"+ err)
                                    _notify("player_start_notify",err,null,callindex)
                                }else{ 
                                    //加入房间成功
                                    
                                    _notify("player_start_notify",err,result.data,callindex)
                                }
        
                            })
                           }
                           break    
            default:
                break;    
        }
   })

   that.sendPlayerJoinRoom = function(data){
    console.log("player join room notify" + JSON.stringify(data))
     _notify("player_joinroom_notify",0,data,0)
   }

   //发送有玩家准备好消息
   that.sendplayerReady = function(data){
       console.log("sendplayerReady accountid:"+data)
       _notify("player_ready_notify",0,data,0)
   }

   that.gameStart = function(){
       console.log("player gameStart")
       _notify("gameStart_notify",0,{},0)
   }
   return that
}
