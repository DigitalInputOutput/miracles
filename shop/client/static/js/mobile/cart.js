export class Cart{
	constructor(){
		Dom.query('#cart-form .quantity .minus').on('click',this.minus.bind(this));
		Dom.query('#cart-form .quantity .plus').on('click',this.plus.bind(this));
		Dom.query('#cart-form .quantity input').on('change',this.input.bind(this));

		Dom.query('#continue').on('click',this.continue.bind(this));
		Dom.query('#clear').on('click',this.clear.bind(this));
		Dom.query('#cart-form .remove').on('click',this.remove.bind(this));
		this.form = Dom.query('#cart-form');
		Dom.query('.checkoutButton').on('click',this.checkout.bind(this));
	}
	checkout(e){
		Dom.query('.checkoutButton').active();
		Dom.query('.checkoutButton .loading').active();

		http.action = function(){
			if(http.json && http.json.result){
				location.href = language + '/checkout/';
			}
			Dom.query('.checkoutButton').active();
			Dom.query('.checkoutButton .loading').active();
		};
		var data = Dom.query('form.cart')[0].serializeJSON();
		http.post(language + '/checkout/',data);
	}
	input(e){
		var target = e.target;
		var qty = target.value;
		var price = target.get('data-price');

		if(qty < 1 || isNaN(qty)){
			qty = 1;
			target.value = 1;
		}
		target.parent().parent().find('.total span').text(qty * price);
		this.total();
	}
	minus(e){
		var target = e.target;
		var input = target.next();
		var qty = input.value * 1 - 1;
		var productId = input.get('name');
		var price = input.get('data-price');

		if(qty > 0){
			input.set('value',qty);
			input.value = qty;
			cart[productId] = qty;
			storage.cart = JSON.stringify(cart);
			target.parent().parent().find('.total span').text((qty) * (price * 1));
			this.total();
		}
		return false;
	}
	plus(e){
		var target = e.target;
		var input = target.prev();
		var qty = input.value * 1 + 1;
		var productId = input.get('name');
		var price = input.get('data-price');

		if(qty > 1){
			input.value = qty;
			cart[productId] = qty;
			storage.cart = JSON.stringify(cart);
			target.parent().parent().find('.total span').text((qty) * (price * 1));
			this.total();
		}
	}
	remove(e){
		var remove = e.target;

		var that = this;
		http.action = function(){
			if(http.json && http.json.result){
				delete pageObject.cart[remove.get('product-id')];

				storage.cart = JSON.stringify(pageObject.cart);
				if(storage.qty > 0){
					storage.qty = parseInt(storage.qty) - 1;
					pageObject.cartQty.text(storage.qty);
				}
				remove.parent().remove();
				if(!storage.qty || storage.qty == 0)
					that.clear(e);

				that.total();
			}
		};
		http.get(`/cart/remove/${remove.get('item-id')}/`);
	}
	clear(e){
		var that = this;
		http.action = function(){
			pageObject.renderForm();
			pageObject.clearCart();
		};
		http.get('/cart/clear/');

		e.stopPropagation();
		e.preventDefault();
		return false;
	}
	continue(e){
		Dom.query('#form').hide();
		Dom.query('#bg').hide();

		e.stopPropagation();
		e.preventDefault();
		return false;
	}
	total(){
		var summa = 0;
		Dom.query("#cart-form .cart_item .total").each(function(elem){
			summa = summa + (elem.find('span').text() * 1);
		});
		Dom.query('#cart-form #sum').text(summa);
	}
}