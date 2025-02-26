export class ProductEdit extends Gallery{
	static block = 'main';

	constructor(context){
		super(context);

		Dom.query('#panel-menu').on('click',(e) => {
			e.stopPropagation();
		});

		Dom.query('.toggle-panel').on('click',(e) => {
			Dom.query('#panel-menu').active();
			Dom.query('#panel').active();

			e.stopPropagation();
			e.preventDefault();
			return false;
		});

		this.model = 'Product';

		var that = this;
		new Sortable(Dom.query('#gallery-items'), {
			animation: 150,
			ghostClass: 'blue-background-class',
			onSort: function(e){
				var ordering = {};
				var position = 1;
				Dom.query('#gallery-items .remove').each(function(elem){
					if(elem.get('item-id')){
						ordering[elem.get('item-id')] = position;
						position++;
					}
				});

				POST(`/gallery/${that.model}/${that.id}/ordering`,{
					View:function(response){
						if(response.json && response.json.result)
							response.alert('Ok.');
					},
					history:false,
					data:ordering
				});
			}
		});

		customizeSelect('.custom-select');
	}
	extraAction(){
		if(Dom.query('input[type="file"]').length){
			Dom.query('input[type="file"]').each(function(elem){
				elem.remove();
			});
		}
	}
	get_data(){
		let data = Dom.query('#item form')[0].serializeJSON();

		data.export_status = [];
		Dom.query('.export').each((elem) => {
			let status = {
				id:elem.get('type'),
			};
			let load = false;
			if(elem.find('input[type="radio"]').length){
				for(let radio of elem.find('input[type="radio"]')){
					if(radio.checked){
						status.load = eval(radio.value);
						load = true;
						break;
					}
				}
			}

			if(!load)
				return;

			if(elem.find('.meta').length){
				let name = elem.find('.meta input[name="export-name"]')[0].value;
				let text = elem.find('.meta textarea')[0].value.trim();
				if(name || text)
					status.meta = {};

				if(name)
					status.meta.name = name;
				if(text)
					status.meta.text = text;
			}
			data.export_status.push(status);
		});

		return data;
	}
}

export class StorageEdit extends ProductEdit{
	constructor(response){
		super(response);
	}
	save(){
		super.save();
	}
	extraAction(){
		super.extraAction();
		this.active.active();

		if(current)
			current.active();

		current = active;
	}
}