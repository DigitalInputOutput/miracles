export class CategoryList extends SimpleView{
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