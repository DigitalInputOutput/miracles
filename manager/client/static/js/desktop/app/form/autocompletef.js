import { GET } from '/static/js/desktop/vanilla/http/navigation.js';

export class AutocompleteF{
	constructor(context){
		var container = context.container;

		this.container = container;
		this.AdminModel = context.AdminModel;
		this.variants = container.find('.variants')[0];
		this.hidden = container.find(`input[type="hidden"]`)[0];
		this.textInput = container.find('input[type="text"]')[0];
		this.removeButton = container.find('.remove');
		this.values = container.find('.values');

		this.textInput.on('paste keypress',this.autocomplete.bind(this));
		this.removeButton.on('click',this.remove.bind(this));
	}
	press_enter(e){

	}
	autocomplete(e){
		if(e.keyCode == 13){
			this.press_enter();
			return;
		}

		if(this.timeout)
			clearTimeout(this.timeout);

		const that = this;
		that.timeout = setTimeout(() => {
			GET(`/autocomplete/${that.AdminModel}/${e.target.value}`,{
				success: (response) => {
					Dom.render("#variants", that.variants, response);
					that.container.find(`.variant`).on('click',that.add.bind(that));
					that.variants.show();
				}
			});
		},500);

		e.stopPropagation();
		return false;
	}
	add(event){
		let id = event.target.get('value');
		let name = event.target.text();

		if(!this.hidden){
			this.textInput.value = name;
			this.variants.hide();
			return;
		}

		let value = this.hidden.value;
		if(value){
			value = eval(value);
		}

		if(Array.isArray(value)){
			value.push(parseInt(id));
			value = JSON.stringify(value);
		}else{
			value = id.toString();
		}

		Dom.render("#autocomplete_value", this.values,{
			"id": id, 
			"name": name, 
			"AdminModel": this.AdminModel.title()
		});

		this.hidden.value = value;
		this.variants.hide();
		this.textInput.value = '';

		Dom.query(`.autocomplete.${this.AdminModel} .remove[value="${id}"]`).on('click',this.remove.bind(this));
	}
	remove(e){
		let id = parseInt(e.target.get('value'));
		if(!id){
			e.target.parent().click();
			return false;
		}
		let input = this.hidden;
		let value = input.value;

		if(value){
			value = eval(value);

			if(Array.isArray(value)){
				value.remove(id);
				value = JSON.stringify(value);
			}
			else{
				value = '';
			}

			input.value = value;
			e.target.parent().remove();
		}

		Dom.query('#save').removeAttr('disabled');
	}
}