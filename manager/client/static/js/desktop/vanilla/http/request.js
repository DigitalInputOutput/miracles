import { Alert } from "/static/js/desktop/vanilla/ui/alert.js";
import { Cookie } from "/static/js/desktop/vanilla/ui/cookie.js";

export class Request {
    constructor(method, href, context = { title: document.title }, successCallback) {
        this.method = method;
        this.href = href;
        this.context = context;
        this.title = context.title;
        this.context.method = method;
        this.successCallback = successCallback;
    }

    async send() {
        let headers = { "X-Requested-With": "XMLHttpRequest" };

        if (['POST', 'PUT'].includes(this.method)) {
            headers["X-CSRFToken"] = Cookie.get('csrftoken');

            if (typeof this.context.data === 'object') {
                this.context.data.csrf_token = Cookie.get('csrftoken');
                headers["Content-Type"] = "application/json";
            } else {
                headers["Content-Type"] = "application/x-www-form-urlencoded";
            }
        }

        try {
            const response = await fetch(this.href, {
                method: this.method,
                headers: headers,
                body: this.context.data ? JSON.stringify(this.context.data) : null
            });

            return await this.processResponse(response);
        } catch (error) {
            this.handleError(error);
        }
    }

    async processResponse(response) {
        let data = {};

        if (!response.ok) {
            Alert.popMessage({ status: response.status, responseText: await response.text() });
            return;
        }

        if (response.headers.get("Content-Type")?.includes("application/json")) {
            data = await response.json();
        } else {
            data.html = await response.text();
        }

        Object.assign(data, this.context); // Merge context into response

        this.successCallback(data);
    }

    handleError(error) {
        console.error("Network Error:", error);
        if (this.context.error) {
            this.context.error(error);
        } else {
            Alert.popMessage({ status: "Network Error", responseText: error.message });
        }
    }
}

// export class Request extends XMLHttpRequest {
//     constructor(method, href, context = { title: document.title }, successCallback) {

//         super();
//         this.context = context;
//         this.title = context.title;
//         this.href = href;
//         this.method = method;
//         this.context.method = method;
//         this.successCallback = successCallback;

//         this.prepareRequest();
//     }

//     prepareRequest() {
//         this.open(this.method, this.href, true);

//         /* Set headers, if needed */
//         if (['POST', 'PUT'].includes(this.method)) {
// 			this.setRequestHeader("X-CSRFToken", Cookie.get('csrftoken'));

// 			if(typeof this.context.data == 'object'){
// 				this.context.data.csrf_token = Cookie.get('csrftoken');
// 				this.setRequestHeader("Content-Type", "application/json");
// 			}
// 			else{
// 				this.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
// 			}
//         }

//         this.processRequest();
//     }

//     toString(){
//         return this.href + JSON.stringify(this, null, 2);
//     }

//     processRequest() {
//         this.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
//         this.onload = () => {
//             this.processResponse();
//         };

//         this.onerror = () => {
//             if(this.context.error)
//                 /* run custom error function */
//                 this.context.error?.(this);
//             else
//                 /* popup standart http alert */
//                 Alert.popMessage(this);
//         }

//         this.send(this.context.data ? JSON.stringify(this.context.data) : null);
//     }

//     processResponse() {
//         /* Display an error message for non-200 statuses */
//         if (this.status != 200 || this.status > 300) 
//             Alert.popMessage(this);

//         let response = {};
//         if (this.getResponseHeader('Content-Type') === 'application/json') {
//             response = JSON.parse(this.responseText) ;
//         } else {
//             response.html = this.responseText;
//         }

//         Object.assign(response, this.context); /* Merge context into response */

//         if(this.successCallback){
//             this.successCallback(response);
//         }
//     }
// }