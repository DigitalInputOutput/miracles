import { GET } from "/static/js/vanilla/http/navigation.js";

class ValueManager {
    constructor(hiddenInput) {
        this.hidden = hiddenInput || null;
    }

    getValues() {
        if (!this.hidden || !this.hidden.value) return [];
        try {
            return JSON.parse(this.hidden.value);
        } catch {
            return this.hidden.value ? [this.hidden.value] : [];
        }
    }

    setValues(values) {
        if (!this.hidden) return;
        if (Array.isArray(values)) {
            this.hidden.value = JSON.stringify(values);
        } else {
            this.hidden.value = values ? values.toString() : '';
        }
    }

    addValue(id) {
        let values = this.getValues();
        if (!values.includes(id)) values.push(id);
        this.setValues(values);
    }

    removeValue(id) {
        let values = this.getValues();
        if (Array.isArray(values)) {
            values = values.filter(v => v !== id);
        } else {
            values = '';
        }
        this.setValues(values);
    }
}

export class Autocomplete {
    constructor(context) {
        this.container = context.container;
        this.model = context.Model || context.AdminModel;
        this.success = context.success || null;
        this.minLength = context.minLength || 3;
        this.delay = context.delay || 500;

        this.variants = this.container.find('.variants')[0];
        this.hidden = this.container.find('input[type="hidden"]')[0] || null;
        this.textInput = this.container.find('input[type="text"]')[0];
        this.valuesContainer = this.container.find('.values')[0] || null;
        this.removeButton = this.container.find('.remove');

        this.valueManager = new ValueManager(this.hidden);

        this.timeout = null;
        this.active = null;

        this.bindEvents();
    }

    bindEvents() {
        this.textInput.on('paste keydown', this.handleKey.bind(this));
        if (this.removeButton) this.removeButton.on('click', this.remove.bind(this));
    }

    handleKey(e) {
        switch (e.keyCode) {
            case 13: this.press_enter(e); break;
            case 38: this.press_up(e); break;
            case 40: this.press_down(e); break;
            default: this.autocomplete(e);
        }
        e.stopPropagation();
        return false;
    }

    autocomplete(e) {
        if (this.timeout) clearTimeout(this.timeout);

        const input = e.target.value;
        if (input.length < this.minLength) return;

        this.timeout = setTimeout(() => {
            GET(`/autocomplete/${this.model}/${input}`, {
                success: (response) => {
                    Dom.render("#variants", this.variants, response.items || response);
                    this.container.find('.variant, .variants div').on('click', this.success || this.add.bind(this));
                    this.variants.show();
                }
            });
        }, this.delay);
    }

    add(event) {
        const id = parseInt(event.target.get('value'));
        const name = event.target.text();

        if (!this.hidden) {
            this.textInput.value = name;
            this.variants.hide();
            return;
        }

        this.valueManager.addValue(id);

        if (this.valuesContainer) {
            Dom.render("#autocomplete_value", this.valuesContainer, {
                id, name, AdminModel: this.model.title ? this.model.title() : this.model
            });
            Dom.query(`.autocomplete.${this.model} .remove[value="${id}"]`).on('click', this.remove.bind(this));
        }

        this.variants.hide();
        this.textInput.value = '';
    }

    remove(e) {
        const id = parseInt(e.target.get('value'));
        if (!id) {
            e.target.parent().click();
            return false;
        }
        this.valueManager.removeValue(id);
        e.target.parent().remove();
        Dom.query('#save').removeAttr('disabled');
    }

    press_enter(e) {
        const item = this.container.find('.variants .active')[0];
        if (item) {
            e = { target: item };
            (this.success || this.add.bind(this))(e);
        }
    }

    press_down() {
        const list = this.container.find('.variants')[0];
        if (!this.active) {
            this.active = list.first();
        } else {
            this.active.removeClass('active');
            this.active = this.active.next() || list.first();
        }
        this.active.addClass('active');
    }

    press_up() {
        const list = this.container.find('.variants')[0];
        if (!this.active) {
            this.active = list.last();
        } else {
            this.active.removeClass('active');
            this.active = this.active.prev() || list.last();
        }
        this.active.addClass('active');
    }
}