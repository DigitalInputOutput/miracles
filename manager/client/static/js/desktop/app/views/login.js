import { GET,POST } from "/static/js/desktop/vanilla/http/method.js";
import { Form } from "/static/js/desktop/vanilla/ui/form/form.js";
import { Dom } from "/static/js/desktop/vanilla/ui/dom.js";

export class Login{
	constructor(){
		var that = this;
		this.form = new Form();

		Dom.query('body').on('keypress',function(event){
			if(event.keyCode == 13){
				that.signin(event);
			}
		});

		Dom.query('#login-button').on('click',this.signin.bind(this));
	}
	signin(){
		var data = Dom.query('#login-form form')[0].serializeJSON();

		POST('/',{
			View: this.login.bind(this),
			data: data
		});
	}
	login(response){
		if(response.errors){
			this.form.render_errors(response.errors);
		}
		else if(response.json && response.json.next){
			Dom.query('#login-form-wrap').addClass('fadeout');

			setTimeout(() => {
				Dom.query('#login-form-wrap').remove();
			},500);

			GET(response.json.next,{
				View:(response) => {
					Dom.query('body').html(response.html);
				}
			});
		}
	}
}