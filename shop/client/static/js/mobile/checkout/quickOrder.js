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
        var regex = new RegExp("^[a-zA-Z]+$");
        var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
        if (regex.test(key)) {
            event.preventDefault();
            return false;
        }
    }
    submit(event){
        http.action = function(){
            if(window.http.json && window.http.json.href){
                location.href = http.json.href;
            }
        };
        http.post(`/checkout/quick_order/${this.id}/${this.qty}`,Dom.query('#quickOrderForm').serializeJSON());
        return false;
    }
}