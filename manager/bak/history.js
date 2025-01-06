export class HistoryManager {
    constructor() {
        window.onpopstate = this.popState.bind(this);
        this.history = window.history;
    }

    pushState(request) {
        if (['PUT', 'DELETE'].includes(request.method)) return;

        const state = {
            href: request.href,
            Model: request.context.Model,
            View: request.View ? request.View.constructor.name : undefined,
            defaultView: request.context.defaultView.constructor.name,
            title: request.title,
            data: request.context.data || undefined,
            method: request.method,
        };

        // Push the state into browser history
        this.history.pushState(state, request.title, request.href);
    }

    popState(e) {
        let state = e.state;

        // Handle case where there is a hash in the URL
        if (location.hash) return;

        // If no state is available, fallback to finding the current view
        if (!state) {
            state = this.findViewState();
            if (state.href) {
                state.href = state.href.replace(location.hash, '');
            }
        }

        // Extract the URL without hash and make GET request
        const url = new URL(state.href, location.origin);
        const href = url.pathname + url.search;

        this.loadView(href, { history: true });
    }

    findViewState() {
        // Simulated method to find view state
        // This needs to be defined based on your specific app's logic.
        // This could be an interaction with the Http or view management system.
        return Http.find_view();
    }

    loadView(href, context) {
        // Decouple this from the direct GET call
        // This function could be a callback or emit event to handle view rendering
        GET(href, context);
    }
}

export class HistoryManager {
    constructor() {
        window.onpopstate = this.popState.bind(this);
        this.history = window.history;
    }

    pushState(request) {
        if (['PUT', 'DELETE'].includes(request.method)) return;

        const state = {
            href: request.href,
            Model: request.context.Model,
            View: request.View ? request.View.constructor.name : undefined,
            title: request.title,
            data: request.context.data || undefined,
            method: request.method,
        };

        this.history.pushState(state, request.title, request.href);
    }

    popState(e) {
        const state = e.state;
        if (location.hash) return;

        let url = new URL(state ? state.href : location.href);
        let href = url.pathname + url.search;

        const context = { history: true };
        // Use the factory to handle popState
        GET(href, context);
    }
}