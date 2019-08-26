module.exports = function(info,socket,callindex,gamectr){
   //console.log("playerinfo:"+ JSON.stringify(info))
   var that = {}
   that._nickName = info.nick_name;    //用户昵称
   that._accountID = info.account_id;  //用户账号
   that._avatarUrl = info.avatar_url;  //头像
   that._gold = info.gold_count;       //当前金币
   that._socket = socket
   that._gamesctr = gamectr
   that._room = undefined //所在房间的引用
   that._seatindex = 0   //在房间的位置
   that._isready = false //当前在房间的状态 是否点击了准备按钮
   that._cards = []      //当前手上的牌
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

   //删除玩家出过的牌
   that.removePushCards = function(remve_cards){
        if(remve_cards.length==0){
            return 
        }

        for(var i=0;i<remve_cards.length;i++){
            var rcard = remve_cards[i]
            if(rcard==null){
                continue
            } 
            
            for(var j=0;j<that._cards.length;j++){
                if(rcard.cardid==that._cards[j].cardid){
                    that._cards.splice(j,1)
                }
            }
           
        }
   }

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
                     case "player_start_notify": //客户端:房主发送开始游戏消息
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
                      case "player_rob_notify":  //客户端发送抢地主消息
                           if(that._room){
                            that._room.playerRobmaster(that,data)
                           }
                           break 
                       case "chu_bu_card_req":   //客户端发送出牌消息
                            if(that._room){
                                that._room.playerBuChuCard(that,data)
                            }
                           break   
                       case "chu_card_req":
                            if(that._room){
                               
                                console.log("that._room")
                                that._room.playerChuCard(that,data,function(err,result){
                                    if(err){
                                      console.log("playerChuCard cb err:"+err+" "+result)
                                      _notify("chu_card_res",err,result.data,callindex)
                                                
                                    }
                                     _notify("chu_card_res",err,result.data,callindex)
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
       //console.log("sendplayerReady accountid:"+data)
       _notify("player_ready_notify",0,data,0)
   }

   that.gameStart = function(){
       //console.log("player gameStart")
       _notify("gameStart_notify",0,{},0)
   }

   that.sendPlayerChangeManage = function(data){
         console.log("sendPlayerChangeManage: account:"+data)
         _notify("changehousemanage_notify",0,data,0)
   }

   that.sendCard = function(data){
    that._cards = data
    _notify("pushcard_notify",0,data,0)
   }
   
   //发送谁可以抢地主
    that.SendCanRob = function(data){
        console.log("SendCanRob"+data)
        _notify("canrob_notify",0,data,0)
    }

    //通知抢地主状态
    that.sendRobState = function(data){
        _notify("canrob_state_notify",0,data,0)
    }

    //发送当前地主是谁
    that.SendChangeMaster = function(data){
        _notify("change_master_notify",0,data,0)
    }

    //发送给客户端:显示底牌
    that.SendShowBottomCard = function(data){
        _notify("change_showcard_notify",0,data,0)
    }

    that.SendChuCard = function(data){
        _notify("can_chu_card_notify",0,data,0)
    }

    that.sendRoomState = function(data){
        _notify("room_state_notify",0,data,0)
    }

    //通知：其他玩家出牌广播
    that.SendOtherChuCard = function(data){
        _notify("other_chucard_notify",0,data,0)
    }
    return that
}
