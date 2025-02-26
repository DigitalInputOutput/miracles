import { View } from "/static/js/desktop/vanilla/ui/view/screen.js";
import { GET } from "/static/js/desktop/vanilla/http/method.js";
import { Dom } from "/static/js/desktop/vanilla/ui/dom.js";
import { Sortable } from "/static/js/desktop/vanilla/ui/form/sortable.js";

export class CategoryList extends View{
	constructor(context){
		super(context);
		Dom.query('.parent-arrow').on('click',function(){
			this.active();
		});

		Dom.query('#add').on('click',function(event){
			GET(this.get('href'));
		});

		new Sortable(Dom.query('#root'), {
			animation: 150,
			ghostClass: 'blue-background-class',
			onSort: function(e){}
		});
	}
}