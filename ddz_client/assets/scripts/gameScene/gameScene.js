import myglobal from "../../mygolbal.js"

cc.Class({
    extends: cc.Component,

    properties: {
        di_label:cc.Label,
        beishu_label:cc.Label,
        roomid_label:cc.Label,
        player_node_prefabs:cc.Prefab,
        //绑定玩家座位,下面有3个子节点
        players_seat_pos:cc.Node,

    },
    //本局结束，做状态清除
    gameEnd(){

    },
    onLoad () {
        this.playerNodeList = []
        this.di_label.string = "底:" +  myglobal.playerData.bottom
        this.beishu_label.string = "倍数:" + myglobal.playerData.rate
        this.roomstate = RoomState.ROOM_INVALID
        //监听，给其他玩家发牌(内部事件)
        this.node.on("pushcard_other_event",function(){
            console.log("gamescene pushcard_other_event")
            for(var i=0;i<this.playerNodeList.length;i++){
                    var node = this.playerNodeList[i]
                    if(node){
                    //给playernode节点发送事件
                        node.emit("push_card_event")
                    }
            }
        }.bind(this))

        //监听房间状态改变事件
        myglobal.socket.onRoomChangeState(function(data){
            //回调的函数参数是进入房间用户消息
            console.log("onRoomChangeState:"+data)
            this.roomstate = data
        }.bind(this))
        //
        this.node.on("canrob_event",function(event){
            console.log("gamescene canrob_event:"+event)
            //通知给playernode子节点
            for(var i=0;i<this.playerNodeList.length;i++){
                var node = this.playerNodeList[i]
                if(node){
                    //给playernode节点发送事件
                    node.emit("playernode_canrob_event",event)
                }
            }
        }.bind(this))

        this.node.on("choose_card_event",function(event){
            console.log("--------choose_card_event-----------")
            var gameui_node =  this.node.getChildByName("gameingUI")
            if(gameui_node==null){
               console.log("get childer name gameingUI")
               return
            }
            gameui_node.emit("choose_card_event",event)
           
        }.bind(this))

        this.node.on("unchoose_card_event",function(event){
            console.log("--------unchoose_card_event-----------")
            var gameui_node =  this.node.getChildByName("gameingUI")
            if(gameui_node==null){
               console.log("get childer name gameingUI")
               return
            }
            gameui_node.emit("unchoose_card_event",event)
        }.bind(this))
        //监听给玩家添加三张底牌
        // this.node.on("add_three_card",function(event){
        //     console.log("add_three_card:"+event)
        //     for(var i=0;i<this.playerNodeList.length;i++){
        //         var node = this.playerNodeList[i]
        //         if(node){
        //             //给playernode节点发送事件
        //             node.emit("playernode_add_three_card",event)
        //         }
        //     }
        // }.bind(this))

        myglobal.socket.request_enter_room({},function(err,result){
            console.log("enter_room_resp"+ JSON.stringify(result))
            if(err!=0){
               console.log("enter_room_resp err:"+err)
            }else{
             
              //enter_room成功
              //notify ={"seatid":1,"playerdata":[{"accountid":"2117836","nick_name":"tiny543","avatarUrl":"http://xxx","goldcount":1000}]}
                var seatid = result.seatindex //自己在房间里的seatid
                this.playerdata_list_pos = []  //3个用户创建一个空用户列表
                this.setPlayerSeatPos(seatid)

                var playerdata_list = result.playerdata
                var roomid = result.roomid
                this.roomid_label.string = "房间号:" + roomid
                myglobal.playerData.housemanageid = result.housemanageid
                
                for(var i=0;i<playerdata_list.length;i++){
                    //consol.log("this----"+this)
                    this.addPlayerNode(playerdata_list[i])
                }

                if(isopen_sound){
                    cc.audioEngine.stopAll()
                    cc.audioEngine.play(cc.url.raw("resources/sound/bg.mp3"),true) 
                 }
            }
            var gamebefore_node = this.node.getChildByName("gamebeforeUI")
            gamebefore_node.emit("init")
        }.bind(this))

        //在进入房间后，注册其他玩家进入房间的事件
        myglobal.socket.onPlayerJoinRoom(function(join_playerdata){
            //回调的函数参数是进入房间用户消息
            console.log("onPlayerJoinRoom:"+JSON.stringify(join_playerdata))
            this.addPlayerNode(join_playerdata)
        }.bind(this))
        
        //回调参数是发送准备消息的accountid
        myglobal.socket.onPlayerReady(function(data){
            console.log("-------onPlayerReady:"+data)
            for(var i=0;i<this.playerNodeList.length;i++){
                var node = this.playerNodeList[i]
                if(node){
                    node.emit("player_ready_notify",data)
                }
            }
        }.bind(this))

        myglobal.socket.onGameStart(function(){
            for(var i=0;i<this.playerNodeList.length;i++){
                var node = this.playerNodeList[i]
                if(node){
                    node.emit("gamestart_event")
                }
            }

        //隐藏gamebeforeUI节点
        var gamebeforeUI = this.node.getChildByName("gamebeforeUI")
            if(gamebeforeUI){
                gamebeforeUI.active = false
            }
        }.bind(this))

              //监听服务器玩家抢地主消息
        myglobal.socket.onRobState(function(event){
                console.log("-----onRobState"+JSON.stringify(event))
                //onRobState{"accountid":"2162866","state":1}
                for(var i=0;i<this.playerNodeList.length;i++){
                    var node = this.playerNodeList[i]
                    if(node){
                        //给playernode节点发送事件
                        node.emit("playernode_rob_state_event",event)
                    }
                }
        }.bind(this))

        //注册监听服务器确定地主消息
        myglobal.socket.onChangeMaster(function(event){
            console.log("onChangeMaster"+event)
            //保存一下地主id
            myglobal.playerData.master_accountid = event
            for(var i=0;i<this.playerNodeList.length;i++){
                var node = this.playerNodeList[i]
                if(node){
                    //给playernode节点发送事件
                    node.emit("playernode_changemaster_event",event)
                }
            }
        }.bind(this))
        
        //注册监听服务器显示底牌消息
        myglobal.socket.onShowBottomCard(function(event){
           console.log("onShowBottomCard---------"+event)
           var gameui_node =  this.node.getChildByName("gameingUI")
           if(gameui_node==null){
              console.log("get childer name gameingUI")
              return
           }
           gameui_node.emit("show_bottom_card_event",event)
        }.bind(this))
    },

    //seat_index自己在房间的位置id
    setPlayerSeatPos(seat_index){
        if(seat_index < 1 || seat_index > 3){
            console.log("seat_index error"+seat_index)
            return
        }

        console.log("setPlayerSeatPos seat_index:" + seat_index)
       
        //界面位置转化成逻辑位置
        switch(seat_index){
            case 1:
                   this.playerdata_list_pos[1] = 0
                   this.playerdata_list_pos[2] = 1 
                   this.playerdata_list_pos[3] = 2
              break
             case 2:
                   

                    this.playerdata_list_pos[2] = 0
                    this.playerdata_list_pos[3] = 1
                    this.playerdata_list_pos[1] = 2
                    break
             case 3:
                    this.playerdata_list_pos[3] = 0     
                    this.playerdata_list_pos[1] = 1
                    this.playerdata_list_pos[2] = 2
                    break
            default: 
              break      
        } 

    },

    addPlayerNode(player_data){
        var playernode_inst = cc.instantiate(this.player_node_prefabs)
        playernode_inst.parent = this.node
        //创建的节点存储在gamescene的列表中
        this.playerNodeList.push(playernode_inst)

        //玩家在room里的位置索引(逻辑位置)
        var index = this.playerdata_list_pos[player_data.seatindex]
        console.log("index "+player_data.seatindex+ " "+index)
        playernode_inst.position = this.players_seat_pos.children[index].position
        playernode_inst.getComponent("player_node").init_data(player_data,index)
    },

    start () {
    },

    /*
     //通过accountid获取用户出牌放在gamescend的位置 
     做法：先放3个节点在gameacene的场景中cardsoutzone(012)
           
    */
    getUserOutCardPosByAccount(accountid){
        console.log("getUserOutCardPosByAccount accountid:"+accountid)
        for(var i=0;i<this.playerNodeList.length;i++){
            var node = this.playerNodeList[i]
            if(node){
                //获取节点绑定的组件
                var node_script = node.getComponent("player_node")
                //如果accountid和player_node节点绑定的accountid相同
                //接获取player_node的子节点
                if(node_script.accountid===accountid){
                  var seat_node = this.players_seat_pos.children[node_script.seat_index]
                  var index_name = "cardsoutzone"+node_script.seat_index
                  //console.log("getUserOutCardPosByAccount index_name:"+index_name)
                  var out_card_node = seat_node.getChildByName(index_name)
                  //console.log("OutZone:"+ out_card_node.name)
                  return out_card_node
                }
            }
        }

        return null
    },
    // update (dt) {},
});
