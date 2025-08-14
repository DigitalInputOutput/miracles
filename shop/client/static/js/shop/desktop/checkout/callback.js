import { Dom } from "/static/js/vanilla-js/ui/dom.js";
import { POST } from "/static/js/vanilla-js/http/navigation.js";

export class Callback{
    constructor(id){
        this.id = id;
        try{
            Dom.query('#id_phone').focus();
            Dom.query('#id_phone').on('keypress', this.keypress.bind(this));
            Dom.query('#quickOrderForm').on('submit',this.submit.bind(this));
        }catch(e){

        }
    }
    keypress(event){
        var regex = new RegExp("^[a-zA-Z]+$");
        var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
        if (regex.test(key)) {
            event.preventDefault();
            return false;
        }
    }
    submit(event){
        const target = event.target;

        POST(`/checkout/callback/${this.id}`,{
            success: (response) => {
                pageObject.renderForm();

                try{
                    Dom.query('#id_phone').focus();
                    Dom.query('#quickOrderForm').on('submit',this.submit.bind(this));
                }catch(e){}
            },
            data: target.serializeJSON()
        });
    }
}