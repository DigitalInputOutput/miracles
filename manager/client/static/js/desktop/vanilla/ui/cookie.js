export class Cookie{

	static toString = function(){
		return document.cookie;
	}
	
	static get = function (cname) {
		let name = cname + "=";
		let decodedCookie = decodeURIComponent(this);
		let ca = decodedCookie.split(';');
	
		for(let i = 0; i < ca.length; i++) {
			let c = ca[i];
	
			while (c.charAt(0) == ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
				return c.substring(name.length, c.length);
			}
		}
	
		return "";
	}
}