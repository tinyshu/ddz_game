import myglobal from "../../mygolbal.js"

cc.Class({
    extends: cc.Component,

    properties: {
        btn_ready:cc.Node,

    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

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
                 break    
            default:
                break
        }
    }
});
