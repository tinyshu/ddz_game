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


window.defines = defines;

//https://www.iqiyi.com/v_19rshq4vz0.html
