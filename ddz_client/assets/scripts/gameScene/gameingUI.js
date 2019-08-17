import myglobal from "../../mygolbal.js"

cc.Class({
    extends: cc.Component,

    properties: {
        gameingUI: cc.Node,
        card_prefab:cc.Prefab,
        robUI:cc.Node,
        bottom_card_pos_node:cc.Node,
        playingUI_node:cc.Node,
    },

    onLoad () {
        this.cards_nods = []
        this.card_width = 0
        //当前可以抢地主的accountid
        this.rob_player_accountid = 0
        //发牌动画是否结束
        this.fapai_end = false
        //底牌数组
        this.bottom_card = []
        //底牌的json对象数据
        this.bottom_card_data=[]
        //监听服务器:下发牌消息
        myglobal.socket.onPushCards(function(data){
            console.log("onPushCards"+JSON.stringify(data))
            this.card_data = data
            this.cur_index_card = data.length - 1
            this.pushCard(data)
            if(isopen_sound){
                //循环播放发牌音效
                this.fapai_audioID = cc.audioEngine.play(cc.url.raw("resources/sound/fapai.mp3"),true)
                console.log("start fapai_audioID"+this.fapai_audioID) 
            }
             //左边移动定时器
            this.scheduleOnce(this._runactive_pushcard.bind(this),0.3)
            this.node.parent.emit("pushcard_other_event")
           
        }.bind(this))

        //监听服务器:通知抢地主消息,显示相应的UI
        myglobal.socket.onCanRobState(function(data){
            console.log("onCanRobState"+JSON.stringify(data))
            //这里需要2个变量条件：自己是下一个抢地主，2发牌动画结束
            this.rob_player_accountid = data
            if(data==myglobal.playerData.accountID && this.fapai_end==true){
                this.robUI.active = true
            }
          
        }.bind(this))
        
        //监听服务器可以出牌消息
        myglobal.socket.onCanChuCard(function(data){
            console.log("onCanRobState"+JSON.stringify(data))
            //判断是不是自己能出牌
            if(data==myglobal.playerData.accountID){
                this.playingUI_node.active = true
            }
        }.bind(this))

        //内部事件:显示底牌事件,data是三张底牌数据
        this.node.on("show_bottom_card_event",function(data){
            this.bottom_card_data = data
            console.log("----show_bottom_card_event",+data)
            for(var i=0;i<data.length;i++){
                var card = this.bottom_card[i]
                //card.getComponent("card").showCards(data[i])
                var show_data = data[i]
                var call_data = {
                    "obj":card,
                    "data":show_data,
                }
                console.log("bottom show_data:"+JSON.stringify(show_data))
                var run =  cc.callFunc(function(target,activedata){
                   
                    var show_card = activedata.obj
                    var show_data = activedata.data
                    //console.log("cc.callFunc:"+JSON.stringify(show_data))
                    show_card.getComponent("card").showCards(show_data)
                   
                },this,call_data)

                card.runAction(cc.sequence(cc.rotateBy(0,0,180),cc.rotateBy(0.2,0,-90), run,
                cc.rotateBy(0.2,0,-90)));
               
                if(isopen_sound){
                    cc.audioEngine.play(cc.url.raw("resources/sound/start.mp3")) 
                 }
            }
            //如果自己地主，给加上三张底牌
            if(myglobal.playerData.accountID==myglobal.playerData.master_accountid){
                this.scheduleOnce(this.pushThreeCard.bind(this),0.2)
            }
            
              
        }.bind(this))


    },

    start () {
     
    },

    _runactive_pushcard(){
        console.log("_runactive_pushcard:"+this.cur_index_card)
        if(this.cur_index_card < 0){
            //发牌动画完成，显示抢地主按钮
            //this.robUI.active = true
            this.fapai_end = true
            if(this.rob_player_accountid==myglobal.playerData.accountID){
                this.robUI.active = true
            }

            if(isopen_sound){
                console.log("start fapai_audioID"+this.fapai_audioID) 
                cc.audioEngine.stop(this.fapai_audioID)
            }
            console.log("pushcard end")

              //通知gamescene节点，倒计时
            var sendevent = this.rob_player_accountid
            this.node.parent.emit("canrob_event",sendevent)

            return
        }
        
        var move_node = this.cards_nods[this.cur_index_card]
        move_node.active = true
        var newx = move_node.x + (this.card_width * 0.4*this.cur_index_card) - (this.card_width * 0.4)
        var action = cc.moveTo(0.1, cc.v2(newx, -250));
        move_node.runAction(action)
        this.cur_index_card--
        this.scheduleOnce(this._runactive_pushcard.bind(this),0.3)
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
      this.cards_nods = []
      for(var i=0;i<17;i++){
        
        var card = cc.instantiate(this.card_prefab)
        card.scale=0.8
        card.parent = this.node.parent
        card.x = card.width * 0.4 * (17 - 1) * (-0.5) + card.width * 0.4 * 0;
        card.y = -250
        card.active = false

        card.getComponent("card").showCards(data[i])
        //存储牌的信息,用于后面发牌效果
        this.cards_nods.push(card)
        this.card_width = card.width
      }
      
      //创建3张底牌
      this.bottom_card = []
      for(var i=0;i<3;i++){
        var di_card = cc.instantiate(this.card_prefab)
        di_card.scale=0.4
        di_card.position = this.bottom_card_pos_node.position 
        if(i==0){
            
            di_card.x = di_card.x - di_card.width*0.4
        }else if(i==2){
            di_card.x = di_card.x + di_card.width*0.4
        }
        

        //di_card.x = di_card.width-i*di_card.width-20
        //di_card.y=60
        di_card.parent = this.node.parent
        //存储在容器里
        this.bottom_card.push(di_card)
      }

    },

    //给地主发三张排，并显示在原有牌的后面
    pushThreeCard(){
        //每张牌的其实位置 
        var last_card_x =  this.cards_nods[ this.cards_nods.length-1].x
        for(var i=0;i<this.bottom_card_data.length;i++){
            var card = cc.instantiate(this.card_prefab)
            card.scale=0.8
            card.parent = this.node.parent
          
            card.x = last_card_x + ((i+1)*this.card_width * 0.4)
            card.y = -250
           
            console.log("pushThreeCard x:"+card.x)
            card.getComponent("card").showCards(this.bottom_card_data[i])
            card.active = true
            this.cards_nods.push(card)
        }
    },
    // update (dt) {},
    onButtonClick(event,customData){
        switch(customData){
            case "btn_qiandz":
                console.log("btn_qiandz")
                myglobal.socket.requestRobState(qian_state.qian)
                this.robUI.active = false
                if(isopen_sound){
                    cc.audioEngine.play(cc.url.raw("resources/sound/woman_jiao_di_zhu.ogg")) 
                 }
                break
            case "btn_buqiandz":
                console.log("btn_buqiandz")
                myglobal.socket.requestRobState(qian_state.buqiang)
                this.robUI.active = false
                if(isopen_sound){
                    cc.audioEngine.play(cc.url.raw("resources/sound/woman_bu_jiao.ogg")) 
                 }
                 break    
             case "nopushcard":  //不出牌
                 myglobal.socket.request_chu_card([],null)
                 this.playingUI_node.active = false
                 break
             case "pushcard":   //出牌
                 //先获取本次出牌数据
                 var chu_card_list = []
                 for(var i=0;i<3;i++){
                    chu_card_list[i]=this.cards_nods[i].getComponent("card").card_id
                 }
                 console.log("chu_card_list"+chu_card_list)
                 myglobal.socket.request_chu_card(chu_card_list,null)
                 this.playingUI_node.active = false
                 break
             case "tipcard":
                 break            
            default:
                break
        }
    }


});
