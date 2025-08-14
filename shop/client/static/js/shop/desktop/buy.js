import { Dom } from "/static/js/vanilla/ui/dom.js";
import { Alert } from "/static/js/vanilla/ui/alert.js";

export class Buy{
    constructor(){
        this.timeout = NaN;
        this.cartButton = Dom.query('#panel .cart');

        Dom.query('.buy').on('click',this.buy.bind(this));

        Dom.query('.quantity .minus').on('click',this.minus.bind(this));
        Dom.query('.quantity .plus').on('click',this.plus.bind(this));
        Dom.query('.quantity input').on('change',this.input.bind(this));
    }
    input(event){
        const target = event.target;
        this.qty = target.value;

        if(qty < 1 || isNaN(qty)){
            this.qty = 1;
            target.value = 1;
        }
    }
    minus(event){
        const target = event.target;
        const input = target.next();
        this.qty = input.value * 1 - 1;

        if(this.qty > 0){
            input.value = qty;
        }
        return false;
    }
    plus(event){
        const target = event.target;
        const input = target.prev();
        this.qty = input.value * 1 + 1;

        if(this.qty > 1){
            input.value = qty;
        }
    }
    buy(event){
        const target = event.target;
        this.qty = target.closer('input[name="quantity"]');
        const id = target.get('value');

        Dom.query('#panel .cart').show();

        if(!storage.qty || storage.qty == 'NaN')
            storage.qty = Object.keys(cart).length;

        if(!qty){
            this.qty = 1;
        }else{
            this.qty = qty.value ? qty.value : 1;
        }

        if(!pageObject.cart[id]){
            pageObject.cart[id] = this.qty;
            storage.qty++; 
            pageObject.cartQty.text(storage.qty);
        }
        else{
            pageObject.cart[id] = parseInt(pageObject.cart[id]) + qty * 1;
        }

        Alert.popMessage(`${target.get('name')} ${qty}cnt.`);

        storage.cart = JSON.stringify(pageObject.cart);

        this.animate(this.getDataToAnimate(target));
    }
    getDataToAnimate(target){
        const img = target.closer('img');
        const item = target.parent().getBoundingClientRect();
        const toTarget = Dom.query('#panel .cart')[0];

        return [img,item,toTarget]
    }
    animate(data){
        const img = data[0];
        const item = data[1];
        const toTarget = data[2];
        const toTargetData = toTarget.getBoundingClientRect();

        let i = create('img');
        i.set('src',img.src);
        i.css('left',`${item['x']}px`);
        i.css('top',`${item['y']}px`);
        i.css('z-index','9999');
        i.set('class','animateBuy');
        body[0].append(i);

        setTimeout(() => {
            i.css('left',`${toTargetData['x']}px`);
            i.css('top',`${toTargetData['y']}px`);
            i.css('height',`20px`);
            i.css('width',`20px`);
            setTimeout(() => {
                i.remove();
                toTarget.active();
                setTimeout(() => {
                    toTarget.active();
                },300);
            },700);
        },300);
    }
}