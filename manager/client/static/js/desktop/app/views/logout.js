import { GET } from "/static/js/desktop/vanilla/http/navigation.js";
import { Dom } from "/static/js/desktop/vanilla/ui/dom.js";

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