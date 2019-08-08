import myglobal from "../../mygolbal.js"

cc.Class({
    extends: cc.Component,

    properties: {
        btn_ready:cc.Node,
        btn_gamestart:cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {

        this.btn_gamestart.active = false
        this.btn_ready.active = false

        this.node.on("init",function(){
            console.log("game beforeui init")
            console.log("myglobal.playerData.housemanageid"+myglobal.playerData.housemanageid)
            console.log("myglobal.playerData.accountID"+myglobal.playerData.accountID)
            if(myglobal.playerData.housemanageid==myglobal.playerData.accountID){
                //自己就是房主
                this.btn_gamestart.active = true
                this.btn_ready.active = false
            }else{
                this.btn_gamestart.active = false
                this.btn_ready.active = true
            }
        }.bind(this))

        myglobal.socket.onGameStart(function(){
            console.log("gamebrforeUI onGameStart revice")
            this.node.active = false
        }.bind(this))
    },

    start () {

    },

    // update (dt) {},
    
    onButtonClick(event,customData){
        switch(customData){
            case "btn_ready":
                console.log("btn_ready")
                myglobal.socket.requestReady()
                break
            case "btn_start":
                 console.log("btn_start")
                 myglobal.socket.requestStart(function(err,data){
                    if(err!=0){
                        console.log("requestStart err"+err)
                    }else{
                        console.log("requestStart data"+ JSON.stringify(data))
                    }
                 })
                 break    
            default:
                break
        }
    }
});
