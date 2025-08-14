import { HistoryManager } from "./history.js";
import { View } from "/static/js/vanilla/http/view.js";
import { Request } from "./request.js";
import { Alert } from "/static/js/vanilla/ui/alert.js";

export class Navigation {
    static urlpatterns = {};
    static page_context = {};
    static currentPath = null;
    static currentView = null;

    static init(urlpatterns){
        Navigation.urlpatterns = urlpatterns;
        window.onpopstate = Navigation.handlePopState;
        [Navigation.currentPath, Navigation.currentView] = Navigation.resolveCurrentUrl();
    }

    static handlePopState(event) {
        if (location.hash) return; 

        const state = event.state;

        if(!state){
            const url = new URL(location.href);
            GET(url.pathname + url.search, {history: true});
        }else{
            state.html ? Navigation.render(state) : GET(state.href, state);
        }
    }

    static popMessage(text){
        Alert.popMessage(text);
    }

    static render(context){
        if(context.success) {
            context.success?.(context);
            return;
        }

        context.title = context.title || context.AdminModel;

        if (!context.history)
            HistoryManager.pushState(context);

        Navigation.currentPath = context.href;

        if(context.html && Navigation.currentView?.container)
            Dom.insert(context.html, Navigation.currentView.container, Navigation.click);

        if(context.View)
            Navigation.currentView = View.render(context);
        else
            [Navigation.currentPath, Navigation.currentView] = Navigation.resolveCurrentUrl();
    }

    static resolveCurrentUrl(){
        const href = location.pathname + location.search + location.hash;

        for (const [pattern, methods] of Object.entries(Navigation.urlpatterns)) {
            const regex = new RegExp(pattern);
            if (!regex.test(href)) continue;

            const params = href.match(regex)?.groups || {};
            const context = {
                href,
                View: methods.GET,
                defaultView: methods.GET,
                AdminModel: params.AdminModel || '',
                filters: params.filters,
                id: params.id,
                anchor: params.anchor,
                ...Navigation.page_context
            };

            return [href, View.render(context)];
        }

        return [href, null];
    }

    static click(e) {
        const target = e.target.closest('a'); 

        if (!target?.href) return;

        e.preventDefault();
        e.stopPropagation();

        let context = Navigation.parseUrl(target.href);

        GET(context.href, context);
        return false;
    }

    static parseUrl(href = location.href, method = 'GET') {
        if (href.startsWith('?') && method === 'GET') {
            method = 'POST'; 
            const params = new URLSearchParams(location.search);
            new URLSearchParams(href).forEach((val, key) => params.set(key, val));

            href = `${location.pathname}?${params}`;
        }

        return Navigation.resolveUrl(method, new URL(href, location.origin));
    }

    static resolveUrl(method, url){
        for (const [pattern, views] of Object.entries(Navigation.urlpatterns)) {
            const regex = new RegExp(pattern);
            if (!regex.test(url.pathname)) continue;

            const params = regex.exec(url.pathname)?.groups || {};

            if (["List","ReloadList"].includes(views[method]) && !['PUT', 'DELETE'].includes(method)) {
                url = Navigation.setLimit(url);
            }

            return {
                ...params,
                href: url.pathname + url.search,
                defaultView: views[method],
                View: views[method]
            };
        }

        throw new Error(`No matching pattern found for URL: ${url.pathname}`);
    }

    static setLimit(url) {
        const headHeight = 105;
        const paginationHeight = 91;
        const productHeight = 101;
        const columnsCount = 2;
	    let limit = parseInt((window.screen.availHeight - (headHeight + paginationHeight)) / (productHeight / columnsCount));

        limit = limit % 2 === 0 ? limit : limit - 1;

        url.searchParams.set('limit', limit || 10);

        return url;
    }
}

export function GET(href, context) {
    return new Request('GET', href, context, Navigation.render).send();
}

export function POST(href, context) {
    return new Request('POST', href, context, Navigation.render).send();
}

export function PUT(href, context) {
    return new Request('PUT', href, context, Navigation.render).send();
}

export function DELETE(href, context) {
    return new Request('DELETE', href, context, Navigation.render).send();
}

export function OPTIONS(href, context) {
    return new Request('OPTIONS', href, context, Navigation.render).send();
}