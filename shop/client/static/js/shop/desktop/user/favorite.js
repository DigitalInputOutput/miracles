import { Dom } from "/static/js/vanilla-js/ui/dom.js";
import { POST } from "/static/js/vanilla-js/http/navigation.js";

export class Favorite{
    constructor(){
        document.ready(this.ready.bind(this));
        this.favorite = JSON.parse(storage.favorite);
    }
    ready(){
        if(!Dom.query('#content .item').length){
            POST(`${language}/user/favorite/`,{
                success: (response) => {
                    Dom.query('#content').html(response);
                },
                data: {'favorite':this.favorite},
            });
        }
    }
}