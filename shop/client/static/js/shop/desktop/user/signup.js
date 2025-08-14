import { Dom } from "/static/js/vanilla-js/ui/dom.js";
import { GET, POST } from "/static/js/vanilla-js/http/navigation.js";

export class Signup{
	constructor(){
		this.loadForm();
	}
	submit(){
		POST('/user/signup/',{
			success: (response) => {
				if(response.href){
					Dom.query('#form').hide();
					Dom.query('#bg').hide();
					location.href = response.href;
				}
			},
			data: Dom.query('#signup').serializeJSON()
		});
		return false;
	}
	loadForm(){
		GET('/user/signup/',{
			success: (response) => {
				pageObject.renderForm();
				Dom.query('#signup').on('submit', this.submit);

				Dom.query('#id_phone').on('keypress', (event) => {
					var regex = new RegExp("^[a-zA-Z]+$");
					var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
					if (regex.test(key)) {
						event.preventDefault();
						return false;
					}
				});
			}
		});
	}
}