import { Dom } from '/static/js/desktop/vanilla/ui/dom.js';
import { POST } from '/static/js/desktop/vanilla/http/navigation.js';

export class Validator {
	constructor(form, rules) {
		this.valid = new Set();
		this.invalid = new Set();
		this.form = form;
		this.rules = rules;
		this.submitButton = this.form.find('#submit');
		this.form.valid = false;

		if (this.submitButton) {
			this.form.on('submit', this.submit.bind(this));
		}

		for (let [field, rulesList] of Object.entries(rules)) {
			const element = this.getElement(field);
			if (element) this.listenRules(element, rulesList);
		}
	}

	getElement(name) {
		return this.form.find(`[name=${name}]`)[0] || null;
	}

	listenRules(elem, rule) {
		const eventTypes = rule.event || 'paste keydown focusout';
		elem.on(eventTypes, (event) => this.handleValidation(event, elem, rule));
	}

	handleValidation(event, elem, rule) {
		if (elem.timeout) clearTimeout(elem.timeout);

		if (event.type === 'focusout') {
			if (!elem.value && rule.required) {
				this.error(elem, [rule.errors.required]);
				return;
			} else if (elem.invalid) {
				return false;
			}
		}

		this.clearError(elem);

		if (!event.metaKey && ![8, 9].includes(event.keyCode)) {
			if (rule.rules.max_length && elem.value.length >= rule.rules.max_length) {
				if (elem.selectionEnd === elem.selectionStart) {
					event.preventDefault();
					return false;
				}
			}
			if (event.key && rule.rules.allow_symbols && !event.key.match(rule.rules.allow_symbols)) {
				event.preventDefault();
				return false;
			}
		}

		elem.timeout = setTimeout(() => {
			if (!elem.value && !rule.required) return;
			this.cleanWhitespaces(elem);
			this.validate(elem, rule);
			if (!elem.invalid && rule.unique) this.unique(elem, rule.errors.unique);
		}, rule.timeout || 1000);

		event.stopPropagation();
		return false;
	}

	validate(elem, rules) {
		let errorMsg = [];
		for (let [rule, constraint] of Object.entries(rules.rules)) {
			const isValid = this[rule](elem, constraint);
			isValid ? this.markValid(elem, rules) : errorMsg.push(rules.errors[rule]);
		}

		if(errorMsg.length)
			this.error(elem, errorMsg);
	}

	is_valid() {
		for (let [key, rule] of Object.entries(this.rules)) {
			let elem = this.getElement(key);
			if (elem) this.validate(elem, rule);
		}

		if (this.invalid.size) {
			this.invalid.values().next().value.focus();
			return false;
		}
		return true;
	}

	submit(event) {
		for (let [key, rule] of Object.entries(this.rules)) {
			let elem = this.getElement(key);
			if (elem) {
				this.validate(elem, rule);
				if (!elem.invalid && rule.unique) this.unique(elem, rule.errors.unique);
			}
		}

		const recaptcha = Dom.query("#g-recaptcha-response");
		if (!Array.isArray(recaptcha) && !recaptcha.value) {
			event.preventDefault();
			return false;
		}

		if (this.invalid.size) {
			this.invalid.values().next().value.focus();
			event.preventDefault();
			return false;
		}
	}

	cleanWhitespaces(elem) {
		elem.value = elem.value.trim();
	}

	checked(elem) {
		return elem.checked;
	}

	radio(elem) {
		return !!Dom.query(`[name="${elem.name}"]:checked`)[0];
	}

	equal(elem, rule) {
		return elem.value === this.getElement(rule).value;
	}

	min_length(elem, rule) {
		return elem.value.length >= rule;
	}

	max_length(elem, rule) {
		return elem.value.length <= rule;
	}

	min(elem, rule) {
		return parseFloat(elem.value) >= rule;
	}

	max(elem, rule) {
		return parseFloat(elem.value) <= rule;
	}

	regex(elem, rule) {
		return rule.test(elem.value);
	}

	unique(elem, error) {
		POST(`/match/${this.Model}`, {
			data: { phone: elem.value },
			success: (response) => {
				if (response && !response.result) {
					this.error(elem, [error]);
				}
			},
		});
	}

	markValid(elem, rules) {
		this.invalid.delete(elem);
		this.valid.add(elem);
		elem.invalid = false;
		if (!this.invalid.size) this.form.triggerValid();
	}

	error(elem, errorMsg) {
		elem.triggerError(errorMsg);
		this.invalid.add(elem);
		this.valid.delete(elem);
		elem.invalid = true;
	}

	clearError(elem) {
		elem.removeError();
		this.invalid.delete(elem);
		elem.invalid = false;
	}
}