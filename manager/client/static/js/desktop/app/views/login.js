import { GET,POST } from "/static/js/desktop/vanilla/http/navigation.js";
import { Form } from "/static/js/desktop/vanilla/ui/form/form.js";
import { Dom } from "/static/js/desktop/vanilla/ui/dom.js";
import { t } from "/static/js/desktop/app/i18n.js";
import { Validator } from "/static/js/desktop/vanilla/ui/form/validate.js";
import { debounce } from "/static/js/desktop/vanilla/ui/utils.js";

export class Login extends Form{
	constructor(){
		super();

		this.form = Dom.query('#login-form form')[0];

		this.validatorRules = {
			'phone':{
				'required': true,
				'rules':{
					'min_length':4,
					'regex':/[а-яА-Яa-zA-Z0-9\-\_\.]/,
				},
				'errors':{
					'regex':t('login_regex'),
					'required':t('required_error')
				}
			},
			'password':{
				'required': true,
				'rules':{
					'min_length':6,
				},
				'errors':{
					'required':t('required_error')
				}
			},
		};

        this.validator = new Validator(this.form, this.validatorRules);

		Dom.query('body').on('keypress', debounce(this.onKeyPress.bind(this), 300));
		Dom.query('#login-button').on('click', this.signin.bind(this));
	}
	onKeyPress(event){
		if(event.keyCode == 13){
			this.signin(event);
		}
	}
	toString(){
		return "Login class-based view";
	}
	signin(event){
		event.preventDefault();

		if(!this.validator.is_valid())
			return;

		let data = this.form.serializeJSON();

		POST(Navigation.currentPath,{
			success: this.success.bind(this),
			data: data
		});
	}
	success(response){
		if(response.errors){
			this.render_errors(response.errors);
		}
		else if(response.next){
			Dom.query('#login-form-wrap').addClass('fadeout');

			setTimeout(() => {
				Dom.query('#login-form-wrap').remove();
			},500);

			GET(response.next,{
				success:(response) => {
					Dom.query('body').html(response.html);

					location.reload();
				}
			});
		}
	}
}