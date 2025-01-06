export class HistoryManager {
    constructor() {
        this.history = window.history; /* Access browser's history API */
    }

    pushState(request) {
        /* Avoid adding certain request methods to history */
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

        this.history.pushState(state, request.title, request.href); /* Push state into browser history */
    }

    popState(event) {
        let state = event.state; /* Retrieve the state object from the pop event */

        if (location.hash) return; /* Do nothing if a hash exists in the URL */

        if (!state) {
            /* If no state is available, find the current view */
            state = Http.findView();
            state.href = state.href.replace(location.hash, '');
        }

        const url = new URL(state.href, location.origin);
        return url.pathname + url.search;
    }
}