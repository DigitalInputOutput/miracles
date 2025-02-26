export class View {
    static registry = new Map();

    static register(viewClass) {
        if (View.registry.has(viewClass.name)) {
            throw new Error(`View ${viewClass.name} is already registered.`);
        }
        View.registry.set(viewClass.name, viewClass);
    }

    static render(context){
        let view = context.View;
        let model = context.Model || '';

        if (typeof view === "string") {
            /* Convert string to class/function dynamically */
            view = View.resolve(`${model}${view}`);
        }

        if (view.prototype?.constructor) {
            new view(context); /* Class-based view */
        } else if (typeof view === "function") {
            view(context); /* Functional view */
        // } else if (typeof view === 'object') {
        //     View.render(context); /* Handle custom object-based Views */
        } else {
            throw new Error("Invalid View type");
        }

        throw new Error("No matching view found for the current URL");
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