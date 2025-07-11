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
		var img = Dom.query('#big-photo img')[0];
		var item = Dom.query('#big-photo').getBoundingClientRect();

		return [img,item,target.parent()]
	}
	getDataToAnimate(target){
		var img = Dom.query('#big-photo img')[0];
		var item = Dom.query('#big-photo').getBoundingClientRect();
		var toTarget = Dom.query('#panel .cart')[0];

		return [img,item,toTarget]
	}
	quickOrder(){
		try{
			var qty = Dom.query('#product .quantity input')[0].value;
		}catch(e){
			var qty = 1;
		}
		var that = this;
		http.action = function(){
			if(typeof http.json !== 'undefined' && typeof http.json.href !== 'undefined')
				location.href = http.json.href;
			else{
				pageObject.renderForm();
			}
			var quickOrder = new Callback(that.id,qty);
		};
		http.get(`/checkout/quick_order/${this.id}/${qty}`);

		ga('send', 'event', 'заказ 1 клик', 'отправить заказ в 1 клик', '');

		return false;
	}
	tabs(event){
		activeTab.removeClass('active');
		activeTab = this;
		this.addClass('active');
	}
	callback(){
		var that = this;
		http.action = function(){
			pageObject.renderForm();
			var callback = new Callback(that.id);
		};
		http.get(`/checkout/callback/${this.id}`);
	}
	feedback(){
		http.action = function(){
			if(http.json && http.json.result){
				var text = Dom.query('#id_text').value;
				var template = getTemplate(Dom.query('#feedbackTemplate'));
				template.querySelector('h4').text(http.json.author);
				template.querySelector('p').text(text);
				Dom.query('#reviews').before(template);
				Dom.query('#feedback-form').remove();
				Dom.query('#id_text').value = '';
			}else if(http.json.authenticate){
				pageObject.user.signinForm();
			}else{
				Alert.popMessage('Странно','Мы обработали ваш запрос, но ничего не вышло.');
			}
		};
		var data = Dom.query('#feedback-form').serializeJSON();
		data['product'] = this.id;
		if(data['text'].length < 20)
			return false;
		http.post('/catalog/feedback',data);
	}
}