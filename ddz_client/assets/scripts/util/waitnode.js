
cc.Class({
    extends: cc.Component,

    properties: {
        loadimage_target:cc.Node,
        _isShow:false,
        lblContent:cc.Label,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        this.node.active = this._isShow;
    },

    update (dt) {
        this.loadimage_target.rotation = this.loadimage_target.rotation - dt*45;
    },

    //content为label显示的内容
    show(content){
        this._isShow = true;
        if(this.node){
            this.node.active = this._isShow;   
        }
        if(this.lblContent){
            if(content == null){
                content = "";
            }
            this.lblContent.string = content;
        }
    },

    hide(){
        this._isShow = false;
        if(this.node){
            this.node.active = this._isShow;   
        }
    }

});
