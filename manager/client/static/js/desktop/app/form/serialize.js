function serialize(){
	let i, j, q = [];
	let data = new FormData();
	for (i = this.elements.length - 1; i >= 0; i = i - 1) {
		if (this.elements[i].name === "") {
			continue;
		}
		switch (this.elements[i].nodeName) {
		case 'INPUT':
			switch (this.elements[i].type) {
			case 'text':
			case 'hidden':
			case 'password':
			case 'button':
			case 'reset':
			case 'submit':
			case 'number':
			case 'date':
				if(this.elements[i].value)
					data.append(this.elements[i].name, this.elements[i].value);
				break;
			case 'checkbox':
			case 'radio':
				if (this.elements[i].checked) {
					data.append(this.elements[i].name, this.elements[i].value);
				}
				break;
			case 'file':
				file = this.elements[i].files[0];
				if(file){
					data.append(file.name, file);
				}
				break;
			}
			break; 
		case 'TEXTAREA':
			if(this.elements[i].value)
				data.append(this.elements[i].name, this.elements[i].value);
			break;
		case 'SELECT':
			switch (this.elements[i].type) {
			case 'select-one':
				if(this.elements[i].value)
					data.append(this.elements[i].name, this.elements[i].value);
				break;
			case 'select-multiple':
				for (j = this.elements[i].options.length - 1; j >= 0; j = j - 1) {
					if (this.elements[i].options[j].selected) {
						data.append(this.elements[i].name, this.elements[i].options[j].value);
					}
				}
				break;
			}
			break;
		case 'BUTTON':
			switch (this.elements[i].type) {
			case 'reset':
			case 'submit':
			case 'button':
				data.append(this.elements[i].name, this.elements[i].value);
				break;
			}
			break;
		}
	}
	return data;
}

function cleanValue(value){
	if(value && value[0] == '{'){
		return JSON.parse(value);
	}
	return value;
}
function serializeJSON(e){
	let i, j, q = [];
	let data = {};
	let elements = this.elements;
	if(!this.elements)
		elements = this.find('*');
	for (i = elements.length - 1; i >= 0; i = i - 1) {
		if (elements[i].name === "") {
			continue;
		}
		switch (elements[i].nodeName) {
		case 'INPUT':
			switch (elements[i].type) {
			case 'text':
			case 'hidden':
			case 'password':
			case 'button':
			case 'reset':
			case 'submit':
			case 'number':
			case 'date':
			case 'email':
			case 'tel':
				if(elements[i].name.includes('[]') && elements[i].value){
					let name = elements[i].name.replace('[]','');
					if(!data[name])
						data[name] = [];
					data[name].push(elements[i].value);
				}
				else if(elements[i].value)
					data[elements[i].name] = elements[i].value;
				break;
			case 'checkbox':
			case 'radio':
				if(elements[i].name.includes('[]') && elements[i].value){
					let name = elements[i].name.replace('[]','');
					if(!data[name])
						data[name] = [];
					if(elements[i].checked){
						if(elements[i].value[0] == '{')
							data[name].push(JSON.parse(elements[i].value));
						else{
							data[name].push(elements[i].value);
						}
					}
				}
				else if (elements[i].checked) {
					data[elements[i].name] = elements[i].value;
				}
				break;
			case 'file':
				if(elements[i].name.includes('[]') && elements[i].value){
					let name = elements[i].name.replace('[]','');
					if(!data[name])
						data[name] = [];
					data[name].push(elements[i].value);
				}else{
					if(elements[i].name == 'images'){
						if(!data['images'])
							data['images'] = [];
						data['images'].push(elements[i].get('value'));
					}else{
						data[elements[i].name] = elements[i].get('value');
					}
				}

				break;
			}
			break; 
		case 'TEXTAREA':
			if(elements[i].value)
				data[elements[i].name] = elements[i].value;
			break;
		case 'SELECT':
			switch (elements[i].type) {
				case 'select-one':
					if(elements[i].name.includes('[]') && elements[i].value){
						let name = elements[i].name.replace('[]','');
						if(!data[name])
							data[name] = [];
						data[name].push(cleanValue(elements[i].value));
					}
					else if(elements[i].value)
						data[elements[i].name] = cleanValue(elements[i].value);
					break;
				case 'select-multiple':
					for (j = elements[i].options.length - 1; j >= 0; j = j - 1) {
						if (elements[i].options[j].selected) {
							data[elements[i].name] = cleanValue(elements[i].options[j].value);
						}
					}
					break;
			}
			break;
		case 'BUTTON':
			switch (elements[i].type) {
			case 'reset':
			case 'submit':
			case 'button':
				data[elements[i].name] = elements[i].value;
				break;
			}
			break;
		}
	}
	for(key in data){
		try{
			val = JSON.parse(data[key]);
			if(Array.isArray(val))
				data[key] = val;
		}catch(e){

		}
	}
	return data;
}
HTMLFormElement.prototype.serializeJSON = serializeJSON;
HTMLFormElement.prototype.serialize = serialize;
Array.prototype.serialize = function(){
	return this[0].serialize();
};
Array.prototype.serializeJSON = function(){
	return this[0].serializeJSON();
};
Element.prototype.serializeJSON = serializeJSON;