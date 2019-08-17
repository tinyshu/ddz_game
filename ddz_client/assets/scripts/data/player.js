const getRandomStr = function (count) {
    var str = '';
    for (var i = 0 ; i < count ; i ++){
        str += Math.floor(Math.random() * 10);
    }
    return str;
};

const playerData = function(){
    var that = {}

    //that.uniqueID = "200000";
    //that.uniqueID = "1328014"
    that.uniqueID = 1 + getRandomStr(6)
    that.accountID = "2" + getRandomStr(6)
    that.nickName = "tiny" + getRandomStr(3)
    var str = "avatar_" + (Math.floor(Math.random() * 3) + 1)
    that.avatarUrl = str   //随机一个头像
    that.gobal_count = 0
    that.master_accountid=0
    return that;
}

export default playerData
