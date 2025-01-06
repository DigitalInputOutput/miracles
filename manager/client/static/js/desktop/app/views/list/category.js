import { View } from "../../../vanilla/ui/view/screen"; 

export class CategoryList extends View{
	constructor(context){
		super(context);
		$('.parent-arrow').on('click',function(){
			this.active();
		});

		$('#add').on('click',function(event){
			GET(this.get('href'));
		});

		new Sortable($('#root'), {
			animation: 150,
			ghostClass: 'blue-background-class',
			onSort: function(e){}
		});
	}
}