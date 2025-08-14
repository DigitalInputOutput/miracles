import { Dom } from "/static/js/vanilla/ui/dom.js";
import { POST } from "/static/js/vanilla/http/navigation.js";

export class Compare{
    constructor(){
        document.ready(this.ready.bind(this));
        this.compare = JSON.parse(storage.compare);
    }
    ready(){
        if(!Dom.query('#content .item').length){
            POST(`${language}/user/compare/`,{
                success: (response) => {
                    Dom.query('#content').html(response);
                },
                data: {'compare':this.compare},
            });
        }
    }
}