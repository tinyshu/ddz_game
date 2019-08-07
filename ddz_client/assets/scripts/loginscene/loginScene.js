import myglobal from "../mygolbal.js"
cc.Class({
    extends: cc.Component,

    properties: {
   
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},
    
    start () {
      myglobal.socket.initSocket()

    },
    
    onButtonCilck(event,customData){
        switch(customData){
            case "wx_login":
                console.log("wx_login request")
                myglobal.socket.request_wxLogin({
                    uniqueID:myglobal.playerData.uniqueID,
                    accountID:myglobal.playerData.accountID,
                    nickName:myglobal.playerData.nickName,
                    avatarUrl:myglobal.playerData.avatarUrl,
                },function(err,result){
                    //请求返回
                    if(err!=0){
                       console.log("err:"+err)
                       return     
                    }

                    console.log("login sucess" + JSON.stringify(result))
                    myglobal.playerData.gobal_count = result.goldcount
                    cc.director.loadScene("hallScene")
                })
                break
            default:
                break
        }
    }
    // update (dt) {},


});
