const defines = {};
defines.serverUrl = "http://localhost:3000";
const isopen_sound = 1;
//exports.roomFullPlayerCount = 3;
exports.createRoomConfig = {
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

exports.qian_state = {
    buqiang:0,
    qian:1,
}
window.defines = defines;
