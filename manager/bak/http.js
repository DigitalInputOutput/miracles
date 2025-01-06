export class Http {
    static CSRF_METHODS = ['POST', 'PUT', 'DELETE'];
    static requests = [];
    static history = new History();
    static cache = {};

    constructor(href, context = { title: document.title }) {
        this.context = context;
        this.title = context.title;
        this.href = href;
    }

    static async request(method, href, context = {}) {
        if (Http.cache[href]) {
            return Http.cache[href];
        }

        const response = await fetch(href, {
            method,
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                ...(Http.CSRF_METHODS.includes(method) && {
                    'X-CSRFToken': cookie.get('csrftoken'),
                }),
            },
            body: context.data ? JSON.stringify(context.data) : undefined,
        });

        if (response.ok) {
            const data = await response.text();
            Http.cache[href] = data;
            return data;
        } else {
            throw new Error(`HTTP Error: ${response.status}`);
        }
    }

    static click(event) {
        const href = event.target.closest('a').getAttribute('href');
        if (!href) return;

        event.preventDefault();
        const context = Http.parseUrl(href);
        if (context) {
            context.title = event.target.title || event.target.textContent;
            Http.request('GET', href, context).then((html) => {
                // Process the response and update the view
            });
        }
    }

    static parseUrl(href, method = 'GET') {
        // Parse and return the context from the href (use patterns)
        // Simplified version of your existing logic
        return { href, method };
    }
}

export class Http extends XMLHttpRequest {
    constructor(href, context = { title: document.title }) {
        super();
        this.context = context;
        this.title = context.title;
        this.href = href;
    }

    process_request() {
        this.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        this.onreadystatechange = () => {
            if (this.readyState === 4) {
                this.process_response();
            }
        };
        this.send(this.context.data ? this.context.data : undefined);
    }

    process_response() {
        if (this.status !== 200) {
            return this.alert(this.status);
        }

        let response;
        if (this.getResponseHeader('Content-Type') === 'application/json') {
            response = { json: JSON.parse(this.responseText) };
        } else {
            response = { html: this.responseText };
        }

        Object.assign(response, this.context);

        // Use the factory to get the appropriate view
        const view = ViewFactory.createView(response);
        view.render();

        if (this.context && !this.context.history && this.context.defaultView) {
            HistoryManager.pushState(this);
        }
    }
}