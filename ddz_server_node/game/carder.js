//发牌管理器
const cardobj = require("./card.js")
const cardvalue = {
    "A": 12,
    "2": 13,
    "3": 1,
    "4": 2,
    "5": 3,
    "6": 4,
    "7": 5,
    "8": 6,
    "9": 7,
    "10": 8,
    "J": 9,
    "Q": 10,
    "K": 11,
}

// 黑桃：spade
// 红桃：heart
// 梅花：club
// 方片：diamond
const CardShape = {
    "S": 1,
    "H": 2,
    "C": 3,
    "D": 4,
};

//大小玩分开写是因为只有一张，并且没有黑桃这些区分
const Kings = {
    "kx": 14, //小王
    "Kd": 15,  //大王
};

module.exports = function(){
    var that = {}
    that.card_list = []
    
    //发牌
    const creatleCard = function(){
        //实例化52张牌
        for(var iv in cardvalue){
            for(js in CardShape){
                //实例化牌对象
                var card = cardobj(cardvalue[iv],CardShape[js],undefined)
                card.index = that.card_list.length;
                that.card_list.push(card)
            }
        }

        for (var i in Kings) {
            var card = cardobj(undefined, undefined, Kings[i]);
            card.index = that.card_list.length;
            that.card_list.push(card)
        }

    } 

    const shuffleCard = function(){
        for(var i = that.card_list.length-1; i>=0; i--){
            var randomIndex = Math.floor(Math.random()*(i+1));
            //随机交换
            var tmpCard = that.card_list[randomIndex];
            that.card_list[randomIndex] = that.card_list[i];
            that.card_list[i] = tmpCard;
        }

        // for(var i=0;i<that.card_list.length;i++){
        //     console.log("card value:"+that.card_list[i].value+" shape:"+that.card_list[i].shape+" king"+that.card_list[i].king)
        // }
        return that.card_list
    }
    //创建牌
    creatleCard()
    //洗牌
    shuffleCard()

    //把牌分成三份和三张带翻的牌
    //每份牌17张
    that.splitThreeCards = function(){
        var threeCards = {}
        for(var i=0;i<17;i++){
           for(var j=0;j<3;j++){
                if (threeCards.hasOwnProperty(j)) {
                    threeCards[j].push(that.card_list.pop());
                } else {
                    threeCards[j] = [that.card_list.pop()];
                }
           }
        }

        return [threeCards[0],threeCards[1],threeCards[2],that.card_list]
    }

    return that
}