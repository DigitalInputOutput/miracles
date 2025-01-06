import { Http } from "http.js" 

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
			this.setRequestHeader("X-CSRFToken", cookie.get('csrftoken'));

			if(typeof this.context.data == 'object'){
				this.context.data.csrf_token = cookie.get('csrftoken');
				this.context.data = JSON.stringify(this.context.data);
				this.setRequestHeader("Content-Type", "application/json");
			}
			else{
				this.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			}
        }

        this.process_request()
        Navigation.render(response);
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