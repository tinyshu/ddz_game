const mysql = require("mysql")
var mysqlHandle = undefined

const query = function(sql,callback){
    //获取一个连接
    console.log("query:" + sql)
    mysqlHandle.getConnection(function(err,conn){
       
        if(err){
           
            console.log(err+ " sql:"+ sql)
            if(callback){
                callback(err)
            }
        }else{
           
            conn.query(sql,function(err,result){
                 if(err){
                    console.log(err+ " sql:"+ sql)
                    if(callback){
                       callback(err,nil)   
                    }
                 }else{
                   
                    if(callback){
                       console.log("result:" + result)
                       callback(null,result)      
                    }
                    
                 } 

                 conn.release()
            })
        }
    })   
}

exports.getPlayerInfoByAccountID = function(accountID,callback) {
    var sql = 'select * from t_account where account_id = ' + accountID + ';';
    query(sql,callback)
}

exports.getPlayerInfoByUniqueID = function(uniqueID,callback){
   var sql =  'select * from t_account where unique_id = ' + uniqueID + ';';
   query(sql,callback)
}

exports.createPlayer = function(userinfo){
    var sql = 'insert into t_account(unique_id, account_id, nick_name,gold_count, avatar_url) values('
        + "'" +userinfo.uniqueID
        + "'" + ','
        + "'" + userinfo.accountID
        + "'" + ','
        + "'" +userinfo.nickName
        + "'" + ',' +
        userinfo.goldCount +','
        + "'" + userinfo.avatarUrl
        + "'" + ');' ;
    console.log("createPlayer sql:"+sql)
    query(sql, (err, data)=>{
        if (err){
            console.log('create player info = ' + err);
        }else
        {
            // console.log('create player info = ' + JSON.stringify(data));
        }
    });
}

exports.connect = function(config){
    mysqlHandle = mysql.createPool(config)
}
