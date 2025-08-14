import { Dom } from "/static/js/vanilla/ui/dom.js";
import { POST } from "/static/js/vanilla/http/navigation.js";

export class QuickOrder{
    constructor(id,qty){
        this.id = id;
        this.qty = qty;
        try{
            Dom.query("#id_phone")[0].focus();
            Dom.query('#id_phone').on('keypress', this.keypress.bind(this));
            Dom.query('#quickOrderForm').on('submit',this.submit.bind(this));
        }catch(e){}
    }
    keypress(event){
        const regex = new RegExp("^[a-zA-Z]+$");
        const key = String.fromCharCode(!event.charCode ? event.which : event.charCode);

        if (regex.test(key)) {
            event.preventDefault();
            return false;
        }
    }
    submit(event){
        let href = `/checkout/quick_order/${this.id}/${this.qty}`;

        POST(href,{
            success: (response) => {
                if(response.href){
                    location.href = response.href;
                }
            },
            data: Dom.query('#quickOrderForm').serializeJSON()
        });

        return false;
    }
}