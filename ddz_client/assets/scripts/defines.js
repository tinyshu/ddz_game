const defines = {};
defines.serverUrl = "http://localhost:3000";
const isopen_sound = 1;
//exports.roomFullPlayerCount = 3;
qian_state = {
    "buqiang":0,
    "qian":1,
};
const RoomState = {
    ROOM_INVALID: -1,
    ROOM_WAITREADY: 1,  //等待游戏
    ROOM_GAMESTART: 2,  //开始游戏
    ROOM_PUSHCARD: 3,   //发牌
    ROOM_ROBSTATE:4,    //抢地主
    ROOM_SHOWBOTTOMCARD:5, //显示底牌
    ROOM_PLAYING:6,     //出牌阶段  
};
createRoomConfig = {
//exports.createRoomConfig = {
    'rate_1': {
        needCostGold: 10,
        bottom: 1,
        rate: 1
    },
    'rate_2': {
        needCostGold: 100,
        bottom: 10,
        rate: 2
    },
    'rate_3': {
        needCostGold: 200,
        bottom: 20,
        rate: 3
    },
    'rate_4': {
        needCostGold: 500,
        bottom: 50,
        rate: 4
    }
};

  //牌型定义
  const CardsValue = {
    'one': {
        name: 'One',
        value: 1
    },
    'double': {
        name: 'Double',
        value: 1
    },
    'three': {
        name: 'Three',
        value: 1
    },
    'boom': { //炸弹
        name: 'Boom',
        value: 2
    },
    'threeWithOne': {
        name: 'ThreeWithOne',
        value: 1
    },
    'threeWithTwo': {
        name: 'ThreeWithTwo',
        value: 1
    },
    'plane': {
        name: 'Plane',
        value: 1
    },
    'planeWithOne': {
        name: 'PlaneWithOne',
        value: 1
    },
    'planeWithTwo': {
        name: 'PlaneWithTwo',
        value: 1
    },
    'scroll': { //顺子
        name: 'Scroll',
        value: 1
    },
    'doubleScroll': {  //连队
        name: 'DoubleScroll',
        value: 1
    },
    'kingboom':{ //王炸
        name: 'kingboom',
        value: 3
    },
};

window.defines = defines;

//https://www.iqiyi.com/v_19rshq4vz0.html
