import { GET } from "/static/js/vanilla-js/http/navigation.js";
import { Dom } from "/static/js/vanilla-js/ui/dom.js";

export class Logout {
	constructor(){
		GET('/logout',{
			success: this.success.bind(this),
		});
    }
	toString(){
		return "Logout class-based view";
	}
	success(response){
		location.reload();
	}
}