import { GET } from "method.js";
import { HistoryManager } from "history.js";
import { default_urlpatterns } from "urls";

export class Navigation {
    constructor(urlpatterns){
        this.urlpatterns = Object.assign(default_urlpatterns, urlpatterns);

        window.onpopstate = () => {
            let href = HistoryManager.popState.bind(this); /* Handle browser back/forward events */

            /* Load the view using GET and mark it as triggered by history navigation */
            GET(href, { history: true });
        }
    }

    static init() {
        /* Logic to determine the view based on the current URL */
        const { pathname, search } = location;
        const href = pathname + search;

        for (const [pattern, methods] of this.urlpatterns) {
            const regex = new RegExp(pattern);
            if (regex.test(href)) {
                const matches = href.match(regex).groups || {};
                const context = {
                    href: matches.href || href,
                    Model: matches.Model,
                    View: methods.GET,
                    filters: matches.filters || undefined,
                    id: matches.id || undefined,
                    anchor: matches.anchor || undefined,
                };

                return Router.render(context);
            }
        }

        throw new Error("No matching view found for the current URL");
    }

    static click(e) {
        const target = e.target.closest('a'); /* Ensure you're interacting with a link */
        if (!target || !target.href) return;

        e.preventDefault();
        e.stopPropagation();

        const href = target.href;

        GET(context.href, Navigation.parse_url(href));
        return false;
    }

    static render(context){
        let view = context.View;

        if (typeof view === "string") {
            /* Convert string to class/function dynamically */
            view = this.resolveView(view);
        }

        if (view.prototype?.constructor) {
            new view(context); /* Class-based view */
        } else if (typeof view === "function") {
            view(context); /* Functional view */
        } else if (typeof view === 'object') {
            Router.render(context); /* Handle custom object-based Views */
        } else {
            throw new Error("Invalid View type");
        }
    }

    static async resolveView(viewName) {
        /* Securely resolve the view name to a class or function */
        if (typeof window[viewName] === "function") {
            return window[viewName];
        } else {
            switch(viewName){
                case "Login": const module = await import('./Login.js');
                return module.Login; // Assumes 'Login.js' exports the 'Login' class
            default:
                throw new Error(`View "${viewName}" not found in global scope`);
            }
        }
    }

    static parse_url(href = location.href, method = 'GET') {
        /* Handle special case for dynamic filters with '?' */
        if (href.startsWith('?') && method === 'GET') {
            method = 'POST'; /* Change the method to POST because of Django logic */
            const currentParams = new URLSearchParams(location.search);
            const newParams = new URLSearchParams(href);

            for (const [key, value] of newParams.entries()) {
                currentParams.set(key, value); /* Merge parameters */
            }

            /* Construct the final href */
            href = `${location.pathname}?${currentParams.toString()}`;
        }

        /* Parse the URL and extract query parameters */
        const url = new URL(href, location.origin);

        Navigation.resolve_url(url);
    }

    static resolve_url(url){
        /* Match the URL against urlpatterns to gather context */
        for (const [pattern, defaultViews] of Object.entries(urlpatterns)) {
            const regex = new RegExp(pattern);

            if (regex.test(url.href)) {
                const match = regex.exec(url.href);

                if (match?.groups) {
                    match.groups.href = url.href;
                    match.groups.defaultView = defaultViews[method];
                    return match.groups;
                }

                return {
                    defaultView: defaultViews[method],
                    View: defaultViews[method],
                    href: url.href
                };
            }
        }

        /* If no match is found, return null or throw an error */
        throw new Error(`No matching pattern found for URL: ${href}`);
    }

    static set_default_limit(url, href, method, View) {
        if (href.match("/(?<Model>[A-Z][a-z]+)($|\\?[\\s\\S])") && !['PUT', 'DELETE'].includes(method)) {
            url.searchParams.set('limit', View?.limit || 10);
        }
        return url;
    }
}