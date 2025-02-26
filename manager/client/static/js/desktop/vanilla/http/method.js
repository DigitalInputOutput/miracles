import { Http } from "./http.js";
import { Cookie } from "/static/js/desktop/vanilla/ui/cookie.js";

export class HttpMethod extends Http{
    constructor(method, href, context = {}) {
        this.method = method;
        this.href = href;
        this.context = context;

        this.send();
    }

    send() {
        this.open(this.method, this.href, true);

        /* Set headers, if needed */
        if (['POST', 'PUT'].includes(this.method)) {
			this.setRequestHeader("X-CSRFToken", Cookie.get('csrftoken'));

			if(typeof this.context.data == 'object'){
				this.context.data.csrf_token = Cookie.get('csrftoken');
				this.context.data = JSON.stringify(this.context.data);
				this.setRequestHeader("Content-Type", "application/json");
			}
			else{
				this.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			}
        }

        this.processResponse();
    }
}

export function GET(href, context) {
    return new HttpMethod('GET', href, context);
}

export function POST(href, context) {
    return new HttpMethod('POST', href, context);
}

export function PUT(href, context) {
    return new HttpMethod('PUT', href, context);
}

export function DELETE(href, context) {
    return new HttpMethod('DELETE', href, context);
}

export function OPTIONS(href, context) {
    return new HttpMethod('OPTIONS', href, context);
}