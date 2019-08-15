const config = require("../defines.js")
const Carder = require("./carder.js")
const RoomState = {
    ROOM_INVALID: -1,
    ROOM_WAITREADY: 1,  //等待游戏
    ROOM_GAMESTART: 2,  //开始游戏
    ROOM_PUSHCARD: 3,   //发牌
    ROOM_ROBSTATE:4,    //抢地主
    ROOM_SHOWBOTTOMCARD:5, //显示底牌
}
const getRandomStr = function (count) {
    var str = '';
    for (var i = 0 ; i < count ; i ++){
        str += Math.floor(Math.random() * 10);
    }
    return str;
}

const getSeatIndex = function(playerlist){
    var seatindex = 1
    if(playerlist.length==0){
        return seatindex
    }

    var index = 1
    for(var i=0;i<playerlist.length;i++){
        if(index!=playerlist[i].seatindex){
            return index
        }
        index++
    }

    return index
}

module.exports = function(roominfo,player){
    var that = {}
    that.room_id = getRandomStr(6)
    that._player_list = []
    console.log("creat room id:"+that.room_id)

    console.log("roominfo.rate:"+roominfo.rate)
    var tconfig = config.createRoomConfig[roominfo.rate]
    //console.log("config"+JSON.stringify(tconfig))

    that.own_player = player
    that.bottom = tconfig.bottom
    that.rate = tconfig.rate
    that.gold =  that.rate * that.bottom
    that.house_manage = player
    that.state = RoomState.ROOM_INVALID
    //初始化发牌器对象
    //实例化牌和洗牌在构造函数完成
    that.carder = Carder()
    that.lostplayer = undefined //下一次抢地主玩家
    that.robplayer = [] //复制一份房间内player,做抢地主操作
    that.room_master = undefined //房间地主引用

    const changeState = function(state){
        if(that.state==state){
            return   
        }
        that.state = state
        switch(state){
            case RoomState.ROOM_WAITREADY:
                break
            case RoomState.ROOM_WAITREADY:
                break
            case RoomState.ROOM_GAMESTART:
                gameStart()
                //切换到发牌状态
                changeState(RoomState.ROOM_PUSHCARD)
                break
            case RoomState.ROOM_PUSHCARD:
                console.log("push card state")
                that.three_cards = that.carder.splitThreeCards()
                for(var i=0;i<that._player_list.length;i++){
                    that._player_list[i].sendCard(that.three_cards[i])
                }
                //切换到抢地主状态
                changeState(RoomState.ROOM_ROBSTATE)
                break
             case RoomState.ROOM_ROBSTATE:
                 console.log("change ROOM_ROBSTATE state")
                 that.robplayer=[]
                 for(var i=that._player_list.length-1;i>=0;i--){
                    that.robplayer.push(that._player_list[i])
                 }
                 turnRob()
                 break   
             case RoomState.ROOM_SHOWBOTTOMCARD:
                 break    
            default:
                break    
        }
    }

    that.jion_player = function(player){
        if(player){
            player.seatindex = getSeatIndex(that._player_list) 
            playerInfo={
                accountid:player._accountID,
                nick_name:player._nickName,
                avatarUrl:player._avatarUrl,
                goldcount:player._gold,
                seatindex:player.seatindex,
            }
            //把用户信息广播个给房间其他用户
            for(var i=0;i<that._player_list.length;i++){
           
                that._player_list[i].sendPlayerJoinRoom(playerInfo)
            }
            that._player_list.push(player)  
          
        }
    }
    
    that.enter_room = function(player,callback){
        //获取房间内其他玩家数据
        var player_data = []
        console.log("enter_room _player_list.length:"+that._player_list.length)
        for(var i=0;i<that._player_list.length;i++){
            var data = {
                accountid:that._player_list[i]._accountID,
                nick_name:that._player_list[i]._nickName,
                avatarUrl:that._player_list[i]._avatarUrl,
                goldcount:that._player_list[i]._gold,
                seatindex:that._player_list[i].seatindex,
                isready:that._player_list[i]._isready,
            }
            player_data.push(data)
            console.log("enter_room userdata:"+JSON.stringify(data))
        }

        
        //var seatid = getSeatIndex(this._player_list) //分配一个座位号
        if(callback){
            var enterroom_para = {
                seatindex: player.seatindex, //自己在房间内的位置
                roomid:that.room_id,      //房间roomid
                playerdata: player_data,  //房间内玩家用户列表
                housemanageid:that.house_manage._accountID, 
            }
            callback(0,enterroom_para)
            //https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1564763901986&di=82c257959de2c29ea027a4c2a00952e0&imgtype=0&src=http%3A%2F%2Fimages.liqucn.com%2Fimg%2Fh1%2Fh988%2Fimg201711250941030_info400X400.jpg
       }
    }
    //重新设置房主
    const changeHouseManage = function(player){
        if(player){
            that.house_manage = player
            //这里需要加上，掉线用户accountid过去
            for(var i=0;i<that._player_list.length;i++){
                that._player_list[i].sendPlayerChangeManage(that.house_manage._accountID)
            }
        }
    }
    //玩家掉线接口
    that.playerOffLine = function(player){
        //通知房间内那个用户掉线,并且用用户列表删除
        for(var i=0;i<that._player_list.length;i++){
            if(that._player_list[i]._accountID === player._accountID){
                that._player_list.splice(i,1)
                //判断是否为房主掉线
                if(that.house_manage._accountID == player._accountID){
                    if(that._player_list.length>=1){
                        changeHouseManage(that._player_list[0])
                    }
                    
                }
            }
        }
    }

    that.playerReady = function(player){
        //告诉房间里所有用户，有玩家ready
        for(var i=0;i<that._player_list.length;i++){
            that._player_list[i].sendplayerReady(player._accountID)
        }
    }

    //下发开始游戏消息
    const gameStart = function(){
        for(var i=0;i<that._player_list.length;i++){
            that._player_list[i].gameStart()
        }
    }
    
    //发送下个玩家，开始抢地主
    const turnRob = function(){
        if(that.robplayer.length==0){
            //都抢过了，需要确定最终地主人选,直接退出
            console.log("rob player end")
            
            return
        }
        //弹出已经抢过的用户
        var can_player = that.robplayer.pop()
        if(that.robplayer.length && that.room_master==undefined){
            //没有抢地主，并且都抢过了,就设置为最后抢的玩家
            that.room_master = can_player  
            //return   
        }
        if(that.robplayer.length==0){
            changeMaster(that.room_master._accountID)
            return
        }
        for(var i=0;i<that._player_list.length;i++){
            //通知下一个可以抢地主的玩家
            that._player_list[i].SendCanRob(can_player._accountID)
        }
    }

    //客户端到服务器: 发送地主改变的消息
    const changeMaster = function(){
        for(var i=0;i<that._player_list.length;i++){
            that._player_list[i].SendChangeMaster(that.room_master._accountID)
        }
    }
    //房主点击开始游戏按钮
    that.playerStart = function(player,cb){
        if(that._player_list.length != 3){
            if(cb){
                cb(-2,null)
            }
            return
        }

        //判断是有都准备成功
        for(var i=0;i<that._player_list.length;i++){
            if(that._player_list[0]._accountID!=that.house_manage._accountID){
                if(that._player_list[0]._isready==false){
                    cb(-3,null)
                    return 
                }
            }
        }

        //开始游戏
        if(cb){
            cb(0,{})
        }

        //下发游戏开始广播消息
        //gameStart()
        changeState(RoomState.ROOM_GAMESTART)
    }

    //客户端到服务器: 处理玩家抢地主消息
    that.playerRobmaster = function(player,data){
        console.log("playerRobmaster value:"+data)
        if(config.qian_state.buqiang==data){
            //记录当前抢到地主的玩家id
        
        }else if(config.qian_state.qian==data){
            this.room_master = player
        }else{
            console.log("playerRobmaster state error:"+data)
        }
        if(player==null){
            console.log("trun rob master end")
            return
        }
        //广播这个用户抢地主状态(抢了或者不抢)
        var value = data
        for(var i=0;i<that._player_list.length;i++){
            data={
                accountid:player._accountID,
                state:value,
            }
            that._player_list[i].sendRobState(data)

        turnRob()
    }
  }
  
  return that
}



