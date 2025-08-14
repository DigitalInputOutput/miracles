// import {view} from './view.js';
// import {BASE_URL} from '/vanilla/js/base.js';

export const templates = {
	address: function(){
		if(view.address)
			return `<input type="text" name="address" value="${view.address}" placeholder="Адрес" id="id_address">`;
		else{
			return `<input type="text" name="address" value="" placeholder="Адрес" id="id_address">`;
		}
	},
	variants: function(items){
		result = '';
		for(item of items){
			result += `<div class="variant" value="${item.id}">${item.address}</div>`;
		}
		return result;
	},
	departaments: function(items,type){
		options = '<option value="-----" selected disabled>-----</option>';
		for(item in items){
			options += `<option value="${item}">${items[item]}</option>`;
		}
		return `<select autocomplete="off" id="id_${type}" name="${type}">${options}</select>`;
	},
	product: function(json){
			return `
				<div class="remove-wrap">
					<div class="remove" item-id="${json.id}"><i class="fas fa-times"></i></div>
				</div>
				<div class="name">
					<a href="http://${BASE_URL}/${json.slug}" target="_blank">${json.name}</a>
				</div>
				<div>
					<input type="text" name="qty" value="1">
				</div>
				<div>
					<input type="text" name="price" value="${json.price}">
				</div>
				<div class="total">${json.total} грн.</div>
				<div class="storage">${json.storage}</div>
				`;
		}
	};