import { HistoryManager } from "./history.js";
import { Alert } from "/static/js/desktop/vanilla/ui/alert.js";

export class Http extends XMLHttpRequest {
    constructor(href, context = { title: document.title }) {
        super();
        this.context = context;
        this.title = context.title;
        this.href = href;
    }

    processRequest() {
        this.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        this.onload = () => {
            this.processResponse();
        };

        this.onerror = () => {
            if(this.context.error)
                /* run custom error function */
                this.context.error?.(this);
            else
                /* popup standart http alert */
                Alert.popMessage(this);
        }

        this.send(this.context.data ? JSON.stringify(this.context.data) : null);
    }

    processResponse() {
        /* Display an error message for non-200 statuses */
        if (this.status != 200 || this.status > 300) 
            Alert.popMessage(this);

        let response;
        if (this.getResponseHeader('Content-Type') === 'application/json') {
            response = { json: JSON.parse(this.responseText) };
        } else {
            response = { html: this.responseText };
        }

        /* Run context.success function if exists */
        if(this.context.success) 
            this.context.success?.(response);

        /* Or process normal response */
        Object.assign(response, this.context); /* Merge context into response */

        // Navigation.render(response); render response here or call view function

        /* Update history if not explicitly disabled in the context */
        if (this.context && !this.context.history && this.context.defaultView) {
            HistoryManager.pushState(this);
        }
    }
}