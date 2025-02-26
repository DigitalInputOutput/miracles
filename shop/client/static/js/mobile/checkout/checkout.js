export class Checkout{
	constructor(){
		this.cart();

		this.nonPrefixRe = /([0-9]{2,3})([0-9]{3})([0-9]{2})([0-9]{2})/;
		this.prefixRe = /([0-9]{2})([0-9]{3})([0-9]{3})([0-9]{2})([0-9]{2})/;
		this.plusPrefixRe = /(\+[0-9]{2})([0-9]{3})([0-9]{3})([0-9]{2})([0-9]{2})/;
		this.phoneInput = Dom.query('#id_phone');

		Dom.query('#checkoutForm .remove').on('click',this.remove.bind(this));

		Dom.query('body').on('click',function(){
			if(Dom.query('#departament .variants').css('display') == 'block' && Dom.query('#id_departament').value)
				Dom.query('#departament .variants').hide();
			if(Dom.query('#city .variants').css('display') && Dom.query('#id_city').value)
				Dom.query('#city .variants').hide();
		});

		if(Dom.query('#id_phone').value)
			this.replacePhone();

		Dom.query('#id_phone').on('change paste', this.replacePhone.bind(this));

		Dom.query('#id_phone').on('keypress', function (event) {
			var regex = new RegExp("^[a-zA-Z]+$");
			var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
			if (regex.test(key)) {
				event.preventDefault();
				return false;
			}
			var that = this;
			if(timeout)
				clearTimeout(timeout);
			timeout = setTimeout(function(){
				that.replacePhone();
			},1000);
		}.bind(this));

		this.delivery = new Delivery();

		this.form = Dom.query('#checkoutForm');

		Dom.query('#checkoutForm button').on('click',this.submit.bind(this));

		customizeSelect('.custom-select');
	}
	cart(){
		for(var i of Object.keys(cartJson)){
			pageObject.cart[i] = cartJson[i];
		}
	}
	submit(){
		this.form.submit();
	}
	remove(event){
		var target = event.target.parent();
		var productId = target.get('product-id');
		var itemId = target.get('data');

		if(itemId){
			http.action = function(){
				if(http.json){
					delete pageObject.cart[productId];

					storage.cart = JSON.stringify(pageObject.cart);
					storage.qty = parseInt(storage.qty) - 1;
					pageObject.cartQty.text(storage.qty);

					if(http.json.total == '0'){
						Dom.query('#checkoutForm').remove();
						Dom.query('h1')[0].text('Ваша корзина пуста.');
					}else{
						Dom.query('#total #sum').text(http.json.total);
						if(http.json.discount == 0){
							Dom.query('#discount').parent().remove();
						}else{
							Dom.query('#discount').text(http.json.discount);
						}
						target.parent().remove();
					}
				}else{
					Alert.popMessage('Ой!','Что то пошло не так. Приносим извинения.');
				}
			};
			http.get(`/checkout/remove/${itemId}/`);
		}
	}
	replacePhone(){
		var phoneValue = this.phoneInput.value;
		if(phoneValue.match(this.nonPrefixRe))
			this.phoneInput.value = phoneValue.replace(this.nonPrefixRe,'($1)-$2-$3-$4');
		if(phoneValue.match(this.prefixRe))
			this.phoneInput.value = phoneValue.replace(this.prefixRe,'+$1-($2)-$3-$4-$5');
		if(phoneValue.match(this.plusPrefixRe))
			this.phoneInput.value = phoneValue.replace(this.plusPrefixRe,'$1-($2)-$3-$4-$5');
	}
}
