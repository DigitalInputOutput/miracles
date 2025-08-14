import { Dom } from "/static/js/desktop/vanilla/ui/dom.js";
import { GET, POST } from "/static/js/desktop/vanilla/http/navigation.js";

export class Cart{
	constructor(){
		Dom.query('#cart-form .quantity .minus').on('click',this.minus.bind(this));
		Dom.query('#cart-form .quantity .plus').on('click',this.plus.bind(this));
		Dom.query('#cart-form .quantity input').on('change',this.input.bind(this));

		Dom.query('#continue').on('click',this.continue.bind(this));
		Dom.query('#clear').on('click',this.clear.bind(this));
		Dom.query('#cart-form .remove').on('click',this.remove.bind(this));
		Dom.query('#cart-form .checkout').on('click',this.checkout.bind(this));
		this.form = Dom.query('#cart-form');
	}
	checkout(e){
		Dom.query('.checkout').active();
		Dom.query('.checkout .loading').active();

		POST(language + '/checkout/',{
			success: () => {
				if(response.result){
					location.href = language + '/checkout/';
				}

				Dom.query('.checkout').active();
				Dom.query('.checkout .loading').active();
			},
			data: Dom.query('#cart-form').serializeJSON()
		});
	}
	input(event){
		const target = event.target;
		const qty = target.value;
		const price = target.get('data-price');

		if(qty < 1 || isNaN(qty)){
			qty = 1;
			target.value = 1;
		}

		target.parent().parent().find('.total span').text(qty * price);

		this.total();
	}
	minus(event){
		const target = event.target;
		const input = target.next();
		const qty = input.value * 1 - 1;
		const productId = input.get('name');
		const price = input.get('data-price');

		if(qty > 0){
			input.set('value',qty);
			input.value = qty;

			this.cart[productId] = qty;

			storage.cart = JSON.stringify(this.cart);

			target.parent().parent().find('.total span').text((qty) * (price * 1));

			this.total();
		}

		return false;
	}
	plus(event){
		const target = event.target;
		const input = target.prev();
		const qty = input.value * 1 + 1;
		const productId = input.get('name');
		const price = input.get('data-price');

		if(qty > 1){
			input.value = qty;
			this.cart[productId] = qty;
			storage.cart = JSON.stringify(this.cart);

			target.parent().parent().find('.total span').text((qty) * (price * 1));

			this.total();
		}
	}
	remove(event){
		let rmBtn;
		if(event.target.nodeName == 'I')
			rmBtn = event.target.parent();
		else{
			rmBtn = event.target;
		}

		let href = `/cart/remove/${rmBtn.get('item-id')}/`;
		GET(href,{
			success: (response) => {
				if(response.result){
					delete pageObject.cart[rmBtn.get('product-id')];

					storage.cart = JSON.stringify(pageObject.cart);

					if(storage.qty > 0){
						storage.qty = parseInt(storage.qty) - 1;
						pageObject.cartQty.text(storage.qty);
					}

					rmBtn.parent().remove();

					if(!storage.qty || storage.qty == 0)
						this.clear(event);

					this.total();
				}
			}
		});
	}
	clear(event){
		GET('/cart/clear/',{
			success: () => {
				pageObject.renderForm();
				pageObject.clearCart();
			}
		});

		event.stopPropagation();
		event.preventDefault();

		return false;
	}
	continue(event){
		Dom.query('#form').hide();
		Dom.query('#bg').hide();

		event.stopPropagation();
		event.preventDefault();

		return false;
	}
	total(){
		let summa = 0;

		Dom.query("#cart-form .productItem .total").each((elem) => {
			summa = summa + (elem.find('span').text() * 1);
		});

		Dom.query('#cart-form #sum').text(summa);
	}
}