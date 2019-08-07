const eventLister = function(obj){
    var register = {}

    obj.on = function(type,method){
        if(register.hasOwnProperty(type)){
            register[type].push(method)
        }else{
            register[type] = [method]
        }
    }

    obj.fire = function(type){
        if(register.hasOwnProperty(type)) {
            var methodList = register[type]
            for(var i=0;i<methodList.length;++i){
                var handle = methodList[i]
                var args = []
                for(var i = 1;i<arguments.length;++i){
                    args.push(arguments[i])
                }

                //handle.call(this,args)
                console.log("handle.call(this,args) type:"+type)
                handle.apply(this,args)
            } 
        }
    }

    obj.removeLister = function(type){
        register[type] = []
    }

    obj.removeAllLister = function(){
        register = {}
    }

    return obj
}

export default eventLister