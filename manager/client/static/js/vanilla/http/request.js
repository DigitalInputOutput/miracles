import { Alert } from "/static/js/vanilla/ui/alert.js";
import { Cookie } from "/static/js/vanilla/ui/cookie.js";

export class Request {
    constructor(method, href, context = { title: document.title }, successCallback) {
        this.method = method;
        this.href = href;
        this.context = context;
        this.title = context.title;
        this.context.method = method;
        this.context.href = href;
        this.successCallback = successCallback;
    }

    async send() {
        let headers = { "X-Requested-With": "XMLHttpRequest" };

        if (['POST', 'PUT', 'DELETE'].includes(this.method)) {
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
            Alert.popMessage(JSON.stringify({ status: response.status }));
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