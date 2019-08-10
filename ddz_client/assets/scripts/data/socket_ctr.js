import eventlister from "../util/event_lister.js"

const socketCtr = function(){
    var that = {}
    var respone_map = {} 
    var call_index = 0

    var _socket = null
    var event = eventlister({})
    const _sendmsg = function(cmdtype,req,callindex){
        _socket.emit("notify",{cmd:cmdtype,data:req,callindex:callindex})
    } 
 
    const _request = function(cmdtype,req,callback){
        console.log("send cmd:"+cmdtype+"  "+ JSON.stringify(req))
        call_index++ 
        respone_map[call_index] = callback
        _sendmsg(cmdtype,req,call_index)
    } 
  
        
    that.initSocket = function(){
        var opts = {
            'reconnection':false,
            'force new connection': true,
            'transports':['websocket', 'polling']
        }
        _socket = window.io.connect(defines.serverUrl,opts);

        _socket.on("connection",function(){
            console.log("connect server success!!")
          })

       _socket.on("notify",function(res){
         console.log("on notify cmd:" + JSON.stringify(res))
         if(respone_map.hasOwnProperty(res.callBackIndex)){
           var callback = respone_map[res.callBackIndex]
           if(callback){
               callback(res.result,res.data)
           }
          }else{
           //if(res.callBackIndex!=0){
           //console.log("not found call index",res.callBackIndex)
              
               //提交一个监听的事件给监听器
        //  on notify cmd:{"type":"player_joinroom_notify","result":0,"data":
        //  {"accountid":"2586422","nick_name":"tiny110","avatarUrl":
        //  "avatar_3","goldcount":1000,"seatindex":2},"callBackIndex":null}
              //没有找到回到函数，就给事件监听器提交一个事件
              var type = res.type
              event.fire(type,res.data)
          // }
           
         }

        })

    }

    that.request_wxLogin = function(req,callback){
        _request("wxlogin",req,callback)
    }
    
    that.request_creatroom = function(req,callback){
        _request("createroom_req",req,callback)
    }

    that.request_jion = function(req,callback){
        _request("joinroom_req",req,callback)
    }

    that.request_enter_room = function(req,callback){
        _request("enterroom_req",req,callback)
    }

    //监听其他玩家进入房间消息
    that.onPlayerJoinRoom = function(callback){
         event.on("player_joinroom_notify",callback)
    }

    that.onPlayerReady = function(callback){
        event.on("player_ready_notify",callback)
    }

    that.onGameStart = function(callback){
        if(callback){
           event.on("gameStart_notify",callback)
        }
    }

    that.onChangeHouseManage = function(callback){
        if(callback){
            event.on("changehousemanage_notify",callback)
        }
    }
    //发送ready消息
    that.requestReady = function(){
        _sendmsg("player_ready_notify",{},null)
    }

    that.requestStart = function(callback){
        _request("player_start_notify",{},callback)
    }

    //服务器下发牌通知
    that.onPushCards = function(callback){
        if(callback){
            event.on("pushcard_notify",callback)
         }
    }
    return that
}

export default socketCtr 