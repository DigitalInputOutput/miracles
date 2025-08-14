import { Dom } from "/static/js/vanilla/ui/dom.js";

export class Delivery{
    constructor(){
        this.departament = Dom.query('#departament');
        this.city = Dom.query('#city');
        this.messageBox = Dom.query('#delivery_message');
        this.paymentTypeBox = Dom.query('#id_payment_type');
        this.lname = Dom.query('#id_lname');
        this.sname = Dom.query('#id_sname');
        this.paymentOptions = Dom.query('#id_payment_type option');
        this.timeout = NaN;

        this.npMessage = 'Внимание! Курьерская доставка осуществляется транспортной компанией \
            Новая Почта согласно их тарифам и по 100%й предоплате. Оплата самой доставки осуществляется \
            наличными при получении товара, курьеру Новой Почты.';
        this.prepayMessage = 'Внимание! Доставка возможна только по предоплате.';

        Dom.query('#id_delivery_type').on('change select',this.delivery_type.bind(this));
    }
    delivery_type(event){
        var target = event.target;
        var val = target.value;

        this.initials(val);
        this.paymentType(val);

        switch(val){
            case "1": this.delivery(val); break;
            case "2": this.delivery(val); break;
            case "3": this.address(); break;
            case "5": this.address();this.deliveryMessage(this.npMessage); break;
            default: this.default(); break;
        }
    }
    message(message){
        this.messageBox.show();
        Dom.query('#id_payment_type option[value="1"]')[0].set('disabled','disabled');
    }
    address(){
        this.departament.clear();
        this.city.clear();
        this.city.append(getTemplate(Dom.query('#addressTemplate')));
        this.city.show();
    }
    deliveryMessage(message){
        this.paymentTypeBox.value = '2';
        this.message(message);
        Dom.query('#id_payment_type option[value="1"]')[0].set('disabled','disabled');
    }
    initials(val){
        if(val == 4){
            this.lname.parent().hide();
            this.sname.parent().hide();
            this.lname.required = false;
        }else{
            this.lname.parent().show();
            this.sname.parent().show();
            this.lname.required = true;
        }
    }
    paymentType(val){
        if(val == 2 || val == 3){
            this.paymentTypeBox.value = '2';
            this.message(this.prepayMessage);
        }
    }
    delivery(val){
        if(val == 1){
            this.messageBox.hide();
            this.paymentTypeBox.value = '';
            this.paymentOptions.removeAttr('disabled', 'disabled');
        }

        var that = this;
        if(val == 2 || val == 1){
            this.city.clear();
            this.departament.clear();
            this.city.append(getTemplate(Dom.query('#cityTemplate')));
            Dom.query('#id_city').on('input paste keypress',function(){
                if(that.timeout)
                    clearTimeout(that.timeout);
                if(Dom.query('#city .variants').css('display') == 'block')
                    Dom.query('#city .variants').hide();
                that.timeout = setTimeout(function(){
                    var value = Dom.query('#id_city').value;
                    if(value && value.length > 1)
                        that.field = new DeliveryField(Dom.query('#id_delivery_type').value,'city',Dom.query('#id_city').value);
                },500);
            });
        }
    }
    default(){
        this.city.clear();
        this.departament.clear();
        this.messageBox.hide();
        this.paymentOptions.removeAttr('disabled', 'disabled');
        this.paymentTypeBox.value = '';
    }
}