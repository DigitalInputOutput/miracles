import { GET } from "/static/js/vanilla/http/navigation.js";
import { Dom } from "/static/js/vanilla/ui/dom.js";
import { BaseScreen } from "/static/js/manager/desktop/app/views/base/screen.js";

export class CategoryList extends BaseScreen{
	constructor(context){
		super(context);
		Dom.query('.parent-arrow').on('click',function(){
			this.active();
		});

		Dom.query('#add').on('click',(e) => {
			GET(this.get('href'));
		});

		new Sortable(Dom.query('#root'), {
			animation: 150,
			ghostClass: 'blue-background-class',
			onSort: function(e){}
		});
	}
}