export class Dom {
	/**
	 * Selects elements from the DOM.
	 * @param {string} selector - A CSS selector.
	 * @returns {Element|Element[]} - A single element or an array of elements.
	*/
	static query (selector) {
		if (selector.includes('#') && (!selector.includes(' ') || selector.includes(','))) {
			var item = document.querySelector(selector);
			return item ? item : [];
		} else {
			return Array.prototype.slice.call(document.querySelectorAll(selector));
		}
	}

	/**
	 * Creates a new element.
	 * @param {string} element - The tag name of the element.
	 * @returns {Element} - The created element.
	*/
	static create (element){
		return document.createElement(element);
	};

	static cond_regex = /{\?if (?<cond>[a-z ]+)\?}(?<exp1>[\S\s]*)(?:{\?else\?})(?<exp2>[\S\s]*)(?:{\?endif\?})/g;
	static renderHtml(node,json){
		var html = node.innerHTML;

		var items = [...html.matchAll(/{~(?<name>\w+)~}/g)];

		var conds = [...html.matchAll(Dom.cond_regex)];

		for(var cond of conds){
			if(cond && cond.groups){
				var text = '';
				if(json && Object.keys(json).includes(cond.groups.cond))
					text = cond.groups.exp1;
				else{
					text = cond.groups.exp2 ? cond.groups.exp2 : '';
				}


				html = html.replace(cond[0],text)
			}
		}

		for(var item of items){
			var name = item.groups.name;
			var text = '';
			if(json && json[name])
				text = json[name];

			html = html.replace(new RegExp(`{~${name}~}`),text);
		}

		if(json || items.length || conds.length)
			return html;
		else{
			return node.content.cloneNode(true);
		}
	}
}