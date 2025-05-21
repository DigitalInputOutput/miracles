export class Dom {
	/**
	 * Selects elements from the DOM.
	 * @param {string} selector - A CSS selector.
	 * @returns {Element|Element[]} - A single element or an array of elements.
	*/
	static var_regex = /{~(?<name>[\w.]+)~}/g;
	static cond_regex = /{\?if (?<cond>[a-z ]+)\?}(?<exp1>[\S\s]*)(?:{\?else\?})(?<exp2>[\S\s]*)(?:{\?endif\?})/g;
	static loop_regex = /{\?for (?<item>\w+) in (?<list>\w+)\?}(?<body>[\s\S]*?){\?endfor\?}/g;

	static render(templateName, container, context = {}) {
		let templateNode = Dom.query(templateName);

		let html = templateNode.innerHTML;

		html = Dom.renderLoops(html, context);
		html = Dom.renderConditions(html, context);
		html = Dom.renderVariables(html, context);

		if(!context || typeof context !== 'object' || Object.keys(context).length === 0) {
			return container.append(html);
		} else {
			return html;
		}
	}

	static renderConditions(html, context) {
		return html.replace(Dom.cond_regex, (_, __, ___, ____, offset, string, groups) => {
			let { cond, exp1, exp2 } = groups;
			return context[cond] ? exp1 : (exp2 ?? '');
		});
	}

	static renderLoops(html, context) {
		return html.replace(Dom.loop_regex, (_, __, ___, ____, offset, string, groups) => {
			let { item, list, body } = groups;
			let arr = context[list];
			if (!Array.isArray(arr)) return '';

			return arr.map(entry => {
				return body.replace(Dom.var_regex, (__, name) => {
					if (name.startsWith(item + ".")) {
						let key = name.split(".")[1];
						return entry[key] ?? '';
					}
					return '';
				});
			}).join('');
		});
	}

	static renderVariables(html, context) {
		return html.replace(Dom.var_regex, (_, name) => {
			if (name.includes('.')) {
				const [obj, prop] = name.split('.');
				return context[obj]?.[prop] ?? '';
			}
			return context[name] ?? '';
		});
	}

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

	static getTemplate(templateName){
		return Dom.query(templateName).content.cloneNode(true);
	}

	static insert(html, container, aCallback) {
		Dom.query(container).html(html);
		Dom.query(`${container} a`).on('click', aCallback);
	
		const scripts = Dom.query(`${container} script`);
		scripts.forEach(oldScript => {
			const newScript = Dom.create('script');
			if (oldScript.src) {
				newScript.src = oldScript.src;
				newScript.async = true;
			} else {
				newScript.textContent = oldScript.textContent;
			}
			oldScript.replaceWith(newScript);
		});
	}
}