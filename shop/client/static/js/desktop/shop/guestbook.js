export class Guestbook{
	constructor(){
		Dom.query('#leave-review').on('click',this.review);

		Dom.query('#review-form textarea').on('change',function(){
			if(this.value.length > 20)
				this.css('border','1px solid grey');
		});

		Dom.query('.reply').on('click',function(){
			Dom.query('#review-form').show();
		});
	}
	review(){
		if(Dom.query('#review-form').css('display') == 'block'){
			if(Dom.query('#review-form textarea')[0].value.length > 20){
				http.action = function(){
					if(typeof http.json !== 'undefined' && http.json.result){
						Dom.query('#review-form').hide();
						Alert.popMessage('Спасибо за отзыв! Он появится на сайте после модерации.',7000);
						Dom.query('#leave-review').remove();
						Dom.query('#review-form').remove();
					}else if(http.json && http.json.authenticate){
						pageObject.user.signinForm();
					}else{
						Alert.popMessage('Форма не валидна' + http.json.errors);
					}
					Dom.query('#bg').hide();
				};
				http.post('/leave_review',Dom.query('#review-form').serializeJSON());
			}else{
				Dom.query('#review-form textarea').css('border','1px solid red');
				Alert.popMessage('Форма не валидна Минимум 20 сиволов для текста отзыва.');
			}
		}else{
			Dom.query('#review-form').show();
		}
	}
}