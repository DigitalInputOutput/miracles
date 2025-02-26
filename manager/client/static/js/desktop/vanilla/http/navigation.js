import { GET } from "./method.js";
import { HistoryManager } from "./history.js";
import { default_urlpatterns } from "./urls.js";
import { View } from "./view.js";

export class Navigation {
    constructor(page_context, urlpatterns){
        this.urlpatterns = Object.assign(default_urlpatterns, urlpatterns);

        window.onpopstate = () => {
            let href = HistoryManager.popState.bind(this); /* Handle browser back/forward events */

            /* Load the view using GET and mark it as triggered by history navigation */
            GET(href, { history: true });
        }

        this.currentView = this.resolve_current_url(page_context);
    }

    resolve_current_url(page_context){
        /* Logic to determine the view based on the current URL */
        const { pathname, search } = location;
        const href = pathname + search;

        for (const [pattern, methods] of Object.entries(this.urlpatterns)) {
            const regex = new RegExp(pattern);
            if (regex.test(href)) {
                const matches = href.match(regex).groups || {};
                const context = {
                    href: href,
                    View: methods.GET,
                    Model: matches.Model || '',
                    filters: matches.filters || undefined,
                    id: matches.id || undefined,
                    anchor: matches.anchor || undefined,
                };

                return View.render(context);
            }
        }
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