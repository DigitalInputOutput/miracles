import { Dom } from "/static/js/desktop/vanilla/ui/dom.js";
import { GET, POST } from "/static/js/desktop/vanilla/http/navigation.js";
import { Callback } from "/static/js/desktop/app/checkout/callback.js";

export class Product extends Buy{
	constructor(){
		super();
		this.id = Dom.query('.product')[0].get('data-id');

		this.activeTab = Dom.query('.tabs label.active');
		Dom.query('.tabs label').on('click',this.tabs.bind(this));
		Dom.query('.call-back').on('click', this.callback.bind(this));

		Dom.query('#feedback-form button').on('click',this.feedback.bind(this));

		Dom.query('.quick-order').on('click',this.quickOrder.bind(this));

		this.gallery = new Gallery(gallery);

		if(pageObject.compare.includes(this.id))
			Dom.query('#product .fas.fa-balance-scale').active();
		else{
			Dom.query('#product .fas.fa-balance-scale').on('click',this.comparef.bind(this));
		}

		if(pageObject.favorite.includes(this.id))
			Dom.query('#product .fas.fa-star').active();
		else{
			Dom.query('#product .fas.fa-star').on('click',this.favoritef.bind(this));
		}

		this.rating = new Rating();
	}
	comparef(event){
		if(!pageObject.compare.includes(this.id)){
			pageObject.compare.push(this.id);
			storage.compare = JSON.stringify(pageObject.compare);
		}
		var className = event.target.classList[1];
		var target = Dom.query(`header .${className}`)[0];
		target.prev().text(pageObject.compare.length);
		target.parent().show();
		event.target.active();
		this.animate(this.getDataAnimateToHeader(target));
	}
	favoritef(event){
		if(!pageObject.favorite.includes(this.id)){
			pageObject.favorite.push(this.id);
			storage.favorite = JSON.stringify(pageObject.favorite);
		}
		var className = event.target.classList[1];
		var target = Dom.query(`header .${className}`)[0];
		target.prev().text(pageObject.favorite.length);
		target.parent().show();
		event.target.active();
		this.animate(this.getDataAnimateToHeader(target));
	}
	getDataAnimateToHeader(target){
		const img = Dom.query('#big-photo img')[0];
		const item = Dom.query('#big-photo').getBoundingClientRect();

		return [img,item,target.parent()]
	}
	getDataToAnimate(target){
		const img = Dom.query('#big-photo img')[0];
		const item = Dom.query('#big-photo').getBoundingClientRect();
		const toTarget = Dom.query('#panel .cart')[0];

		return [img,item,toTarget]
	}
	quickOrder(){
		let qty;
		try{
			qty = Dom.query('#product .quantity input')[0].value;
		}catch(e){
			qty = 1;
		}

		GET(`/checkout/quick_order/${this.id}/${qty}`,{
			success: (response) => {
				if(response.href !== 'undefined')
					location.href = response.href;
				else{
					pageObject.renderForm();
				}

				new Callback(that.id, qty);
			}
		});

		ga('send', 'event', 'заказ 1 клик', 'отправить заказ в 1 клик', '');

		return false;
	}
	tabs(event){
		activeTab.removeClass('active');
		activeTab = this;
		this.addClass('active');
	}
	callback(){
		GET(`/checkout/callback/${this.id}`,{
			success: (response) => {
				pageObject.renderForm();
				new Callback(that.id);
			}
		});
	}
	feedback(){
		var data = Dom.query('#feedback-form').serializeJSON();
		data['product'] = this.id;
		if(data['text'].length < 20)
			return false;
		POST('/catalog/feedback',{
			success: (response) => {
				if(response.result){
					let text = Dom.query('#id_text').value;
					let template = Dom.render('#feedbackTemplate');
					template.querySelector('h4').text(response.author);
					template.querySelector('p').text(text);
					Dom.query('#reviews').before(template);
					Dom.query('#feedback-form').remove();
					Dom.query('#id_text').value = '';
				}else if(response.authenticate){
					pageObject.user.signinForm();
				}else{
					Alert.popMessage('Странно','Мы обработали ваш запрос, но ничего не вышло.');
				}
			},
			data: data
		});
	}
}