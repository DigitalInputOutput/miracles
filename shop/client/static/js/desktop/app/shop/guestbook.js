import { Dom } from "/static/js/desktop/vanilla/ui/dom.js";
import { Alert } from "/static/js/desktop/vanilla/ui/alert.js";

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
				POST('/leave_review',{
					success: (response) => {
						if(response.result){
							Dom.query('#review-form').hide();
							Alert.popMessage('Спасибо за отзыв! Он появится на сайте после модерации.',7000);
							Dom.query('#leave-review').remove();
							Dom.query('#review-form').remove();
						}else if(response.authenticate){
							pageObject.user.signinForm();
						}else{
							Alert.popMessage('Форма не валидна' + response.errors);
						}
						Dom.query('#bg').hide();
					},
					data: Dom.query('#review-form').serializeJSON()
				});
			}else{
				Dom.query('#review-form textarea').css('border','1px solid red');
				Alert.popMessage('Форма не валидна Минимум 20 сиволов для текста отзыва.');
			}
		}else{
			Dom.query('#review-form').show();
		}
	}
}