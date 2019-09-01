const socket  = require("socket.io")
const mydb = require("./db.js")
const gamectr = require("./game/game_ctr.js")
const app = socket(3000)
const db_config = require("./db_config.js")

mydb.connect({
   "host": db_config.dbconfig.host,
   "port": db_config.dbconfig.port,
   "user": db_config.dbconfig.user,
   "password": db_config.dbconfig.password,
   "database": db_config.dbconfig.database,
})

app.on("connection",function(socket){
   console.log("a new connectin")
   socket.emit("connection","connection  sucess")

   socket.on("notify",function(req){
      console.log("notify" + JSON.stringify(req))
      console.log("msg: "+req.cmd)
     
      var data = req.data
      switch(req.cmd){
         case "wxlogin":
            var uniqueId = data.uniqueID
            //console.log("login uniqueId:"+uniqueId)
            mydb.getPlayerInfoByUniqueID(uniqueId,function(err,result){
               if (err){
                  console.log("getPlayerInfoByUniqueID err"+err)
               }else{
                  if(result.length===0){
                     //没有用户数据，创建一个
                    
                    var userinfo = {
                        uniqueID:data.uniqueID,
                        accountID:data.accountID,
                        nickName:data.nickName,
                        goldCount:1000,
                        avatarUrl:data.avatarUrl,
                    }
                    mydb.createPlayer(userinfo)
                    //data = [{"unique_id":"1328014","account_id":"2117836",
                    //"nick_name":"tiny543","gold_count":1000,
                    //"avatar_url":"http://xxx"}]
                    gamectr.create_player(
                       {
                        unique_id:data.uniqueID,
                        account_id:data.accountID,
                        nick_name:data.nickName,
                        gold_count:1000,
                        avatar_url:data.avatarUrl,
                       },
                       socket,
                       req.callindex
                    )
                  }else{
                     //取到数据
                     console.log('data = ' + JSON.stringify(result));
                     gamectr.create_player(result[0],socket,req.callindex)
                  }
               }
            })
            break
         default:
            console.log("default process msg: "+req.cmd)
            break;
      }
   })
})



