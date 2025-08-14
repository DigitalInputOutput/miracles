import { Gallery } from "/static/js/desktop/app/view/gallery.js";
import { Dom } from "/static/js/desktop/vanilla/ui/dom.js";
import { POST } from "/static/js/desktop/vanilla/http/navigation.js";
import { Alert } from "/static/js/desktop/vanilla/ui/alert.js";
import { t } from "/static/js/desktop/app/i18n.js";

export class ProductEdit extends Gallery{
	static container = 'main';

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
			onSort: (e) => {
				let ordering = {};
				let position = 1;
				Dom.query('#gallery-items .remove').each((elem) => {
					if(elem.get('item-id')){
						ordering[elem.get('item-id')] = position;
						position++;
					}
				});

				POST(`/gallery/${that.model}/${that.id}/ordering`,{
					success: (response) => {
						if(response && response.result)
							Alert.popMessage(t('saved_succesfully'));
					},
					data: ordering
				});
			}
		});
	}
	extraAction(){
		if(Dom.query('input[type="file"]').length){
			Dom.query('input[type="file"]').each(function(elem){
				elem.remove();
			});
		}
	}
	get_data(){
		let data = super.get_data();

		// Delete description for export
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