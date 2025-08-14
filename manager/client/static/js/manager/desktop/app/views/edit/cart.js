import { GET } from "/static/js/vanilla-js/http/navigation.js";
import { Dom } from "/static/js/vanilla-js/ui/dom.js";
import { Autocomplete } from "/static/js/vanilla-js/ui/autocomplete.js";

export class Cart{
	constructor(context){
		Dom.query('.remove').on('click',this.remove.bind(this));
		Dom.query('#add-product').on('click',this.add.bind(this));
		Dom.query('#order .buttons #expand').on('click',this.expand.bind(this));
		Dom.query('input[name="qty"], input[name="price"]').on('change',this.calculate_item.bind(this));
		this.total = Dom.query('#total .sum')[0];
		this.totalSum = parseInt(this.total.text());
		this.discount = Dom.query('#discount .sum')[0];
		this.removeList = [];
		this.order_id = context.id;
		this.items_container = Dom.query('#order-search #items')[0];
		Dom.query('body').on('click',this.hide_variants.bind(this));

		window.onbeforeprint = (e) => {
			this.expand();
		};
	}
	expand(e){
		Dom.query('#order-items').innerHTML = this.items_container.innerHTML;
	}
	hide_variants(){
		if(Dom.query('#order-items .variants').length)
			Dom.query('#order-items .variants')[0].parent().parent().remove();
	}
	calculate(){
		var total = 0;
		var discount = 0;
		var items = Dom.query('#order-items .order-item');

		items.each(function(item){
			var qty = parseInt(item.find('input[name="qty"]')[0].value);
			var price = parseInt(item.find('input[name="price"]')[0].value);
			total += price * qty;
			discount += price * qty;
		});

		if(total > 5000){
			total = 0;
			discount = 0;
			items.each(function(item){
				var qty = parseInt(item.find('input[name="qty"]')[0].value);
				var price = parseInt(item.find('input[name="price"]')[0].value);
				var opt = parseInt(item.find('input[name="price"]')[0].get('opt'));
				total += opt * qty;
				discount += price * qty;
			});
		}

		if(discount > total){
			discount = discount - total;
		}else{
			discount = '0';
		}

		this.discount.text(discount);
		this.totalSum = total;
		this.total.text(total);
	}
	calculate_item(e){
		var item = e.target.parent().parent();
		var qty = parseInt(item.find('input[name="qty"]')[0].value);
		var price = parseInt(item.find('input[name="price"]')[0].value);
		item.find('.total').text(qty * price + ' грн.');
		this.calculate();
	}
	remove(e){
		if(!e.target.get('item-id')){
			e.target.parent().click();
			e.stopPropagation();
			return false;
		}
		var target = e.target;
		this.removeList.push(target.get('item-id'));
		target.parent().parent().remove();
		this.calculate();
		Dom.query('#save').removeAttr('disabled');
	}
	add(event){
		let container = Dom.render('#order-item', this.items_container);
		this.items_container.scrollTop = this.items_container.scrollHeight;

		container = Dom.query('#order-search #items .order-item:last-child')[0];

		container.find('.remove').on('click',function(event){
			this.parent().parent().remove();
			event.stopPropagation();
			return false;
		});

		new Autocomplete({
			container:container,
			Model:'Product',
			success:this.pick.bind(this)
		});

		event.stopPropagation();
		return false;
	}
	pick(e){
		var product_id = e.target.get('value');
		var that = this;
		var item = Dom.query(`.order-item[product-id="${product_id}"]`);
		var parent = e.target.parent().parent().parent();

		if(item.length){
			var qty = item[0].find('input[name="qty"]')[0];
			var price = item[0].find('input[name="price"]')[0];
			var total = item[0].find('.total > div .title')[0];

			qty.value++;
			total.text(qty.value * price.value);

			parent.remove();
		}else{
			GET(`/api/Product/${product_id}/?format=json`,{
				View:function(response){
					let template = Dom.render('#order-item', response);
					that.items_container.replace(template,parent);

					let item = Dom.query(`.order-item[product-id="${response.id}"]`)[0];
					item.find('.remove').on('click',that.remove.bind(that));
				}
			});
		}

		this.calculate();
		e.stopPropagation();
		return false;
	}
}