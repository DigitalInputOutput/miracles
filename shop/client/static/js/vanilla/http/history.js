export class HistoryManager {
    static history = window.history; /* Access browser's history API */

    static pushState(context) {
        /* Avoid adding certain context methods to history */
        if (['PUT','POST', 'DELETE'].includes(context.method)) return;

        const state = {
            href: context.href,
            AdminModel: context.AdminModel,
            View: context.View ? context.View : undefined,
            defaultView: context.defaultView,
            title: context.title,
            data: context.data || undefined,
            method: context.method,
            html: context.html,
            history: true
        };

        HistoryManager.history.pushState(state, context.title, context.href); /* Push state into browser history */
    }

}