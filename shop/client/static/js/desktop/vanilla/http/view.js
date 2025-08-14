export class View {
    static registry = new Map();

    static register(viewClass) {
        if (View.registry.has(viewClass.name)) {
            throw new Error(`View ${viewClass.name} is already registered.`);
        }
        View.registry.set(viewClass.name, viewClass);
    }

    static render(context){
        let requested_view = context.View;
        let model = context.AdminModel || '';

        if (typeof requested_view === "string") {
            try{
                requested_view = View.resolve(`${model}${requested_view}`);
            } catch(e) {
                requested_view = View.resolve(context.defaultView);
            }
        }

        if (requested_view.prototype?.constructor) {
            return new requested_view(context); /* Class-based view */
        } else if (typeof requested_view === "function") {
            return requested_view(context); /* Functional view */
        // } else if (typeof view === 'object') {
        //     View.render(context); /* Handle custom object-based Views */
        } else {
            throw new Error("Invalid View type");
        }
    }

    static resolve(viewName) {
        /* Securely resolve the view name to a class or function */
        if (View.registry.has(viewName)) {
            return View.registry.get(viewName);
        }

        if (typeof window[viewName] === "function") {
            return window[viewName];
        }

        throw new Error(`View ${viewName} not found`);
    }

}