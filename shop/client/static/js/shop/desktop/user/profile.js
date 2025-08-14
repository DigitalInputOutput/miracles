import { Dom } from "/static/js/vanilla/ui/dom.js";

export class Profile{
    constructor(){
        this.button = Dom.query('#change-order');
        Dom.query('#orderForm').each(function(elem){
            this.change(elem)
        }.bind(this));
    }
    change(elem){
        elem.on('change input paste',function(){
            this.button.removeAttr('disabled');
            this.button.addClass('blue');
        }.bind(this));
    }
}


