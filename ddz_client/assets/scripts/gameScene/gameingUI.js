import myglobal from "../../mygolbal.js"
cc.Class({
    extends: cc.Component,

    properties: {
        gameingUI: cc.Node,
        card_prefab:cc.Prefab,
    },

    onLoad () {
        myglobal.socket.onPushCards(function(data){
            console.log("onPushCards"+JSON.stringify(data))
            this.pushCard(data)
            //左边移动
            this.node.parent.emit("pushcard_other_event")
            //console.log("parent.name"+this.node.parent.name)
           
        }.bind(this))
    },

    start () {
     
    },

    pushCard(data){
    if (data) {
            data.sort(function (a, b) {
                if (a.hasOwnProperty('value') && b.hasOwnProperty('value')) {
                    return b.value - a.value;
                }
                if (a.hasOwnProperty('king') && !b.hasOwnProperty('king')) {
                    return -1;
                }
                if (!a.hasOwnProperty('king') && b.hasOwnProperty('king')) {
                    return 1;
                }
                if (a.hasOwnProperty('king') && b.hasOwnProperty('king')) {
                    return b.king - a.king;
                }
            });
        }
      //创建card预制体
      var cards_nods = []
      for(var i=0;i<17;i++){
        
        var card = cc.instantiate(this.card_prefab)
        card.scale=0.8
        //console.log("gameUI this.card_node.parent"+ this.node.parent.name)
        card.parent = this.node.parent
      
        card.x = card.width * 0.4 * (17 - 1) * (-0.5) + card.width * 0.4 * 0;
        card.y = -250
        card.active = false
        //var action = cc.moveTo(1, cc.v2(newx, newy));
        //card.runAction(action)
        //console.log("card_prefab position"+card.position)
        card.getComponent("card").showCards(data[i])
        cards_nods.push(card)
      }
      
      for(var i=16;i>0;i--){
        var move_node = cards_nods[i]
        move_node.active = true
        var newx = move_node.x + (card.width * 0.4*(-0.5)) + (card.width * 0.4*i)
        var action = cc.moveTo(0.5, cc.v2(newx, -250));
        move_node.runAction(action) 

      }
      
    }
    // update (dt) {},


});
