import myglobal from "../../mygolbal.js"
cc.Class({
    extends: cc.Component,

    properties: {
        gameingUI: cc.Node,
        card_prefab:cc.Prefab,
    },

    onLoad () {
        this.cards_nods = []
        this.card_width = 0
        myglobal.socket.onPushCards(function(data){
            console.log("onPushCards"+JSON.stringify(data))
            this.card_data = data
            this.cur_index_card = data.length - 1
            this.pushCard(data)
             //左边移动定时器
            this.scheduleOnce(this._runactive_pushcard.bind(this),0.2)
            this.node.parent.emit("pushcard_other_event")
           
        }.bind(this))
    },

    start () {
     
    },

    _runactive_pushcard(){
        console.log("_runactive_pushcard:"+this.cur_index_card)
        if(this.cur_index_card<0){
            return
        }
        
        var move_node = this.cards_nods[this.cur_index_card]
        move_node.active = true
        var newx = move_node.x + (this.card_width * 0.4*this.cur_index_card) - (this.card_width * 0.4)
        var action = cc.moveTo(0.1, cc.v2(newx, -250));
        move_node.runAction(action)
        this.cur_index_card--
        this.scheduleOnce(this._runactive_pushcard.bind(this),0.2)
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
      
      for(var i=0;i<17;i++){
        
        var card = cc.instantiate(this.card_prefab)
        card.scale=0.8
        //console.log("gameUI this.card_node.parent"+ this.node.parent.name)
        card.parent = this.node.parent
      
        card.x = card.width * 0.4 * (17 - 1) * (-0.5) + card.width * 0.4 * 0;
        card.y = -250
        card.active = false
        card.getComponent("card").showCards(data[i])
        this.cards_nods.push(card)
        this.card_width = card.width
      }
      
    },
    // update (dt) {},
  

});
