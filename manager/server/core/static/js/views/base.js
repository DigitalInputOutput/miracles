export class SimpleView{
	static block = 'main';

	constructor(context){
		this.deleteButton = Dom.query('#delete');

		document.ready(() => {
			Dom.query('a').on('click',Http.click);

			var menuParams = {
				container: Dom.query('#menu'),
				titleText: '#menu-title-text',
				prev: '#prev',
				delay: 0,
				toggleButton: Dom.query('#toggleMenu'),
				left: 0,
				choice:function(e){
					if(e.target.tagName == 'SPAN'){
						e.target.parent().click();
						return;
					}
					location.href = e.target.get('href');
					Dom.query('#search-text').set('model',e.target.get('model'));
					e.stopPropagation();
					e.preventDefault();
					return false;
				}
			};
			this.menu = new Menu(menuParams);

			Dom.query('.burger').on('click',function(e){
				Dom.query('menu').active();
				Dom.query('#right').toggleClass('full');

				e.stopPropagation();
				return false;
			});
		});

		Dom.query('#shop').on('click',function(){
			location.href = this.href;
		});

		Dom.query('#signout').on('click',function(){
			location.href = this.href;
		});

		if(!context)
			return;

		this.context = context;

		Dom.query(`${this.block} a`).on('click',Http.click);

		document.title = context.title;

		try{
			this.Model = context.Model ? context.Model : context.context.Model;
		}catch(e){}
	}
}

export class BaseView extends SimpleView{
	constructor(context){
		super(context);

		if(!storage.theme)
			storage.theme = 'black';

		if(!storage.LANG_ORDER)
			storage.LANG_ORDER = '[]';

		Dom.query('header').set('class',storage.theme);

		Dom.query('#theme .color').on('click',function(event){
			theme(this.get('color'));
		});

		Dom.query('#nav,#nav *').on('click',function(e){
			e.stopPropagation();
			return false;
		});

		Dom.query('body').on('click',function(e){
			Dom.query('#panel-menu').removeClass('active');
			Dom.query('#panel #filter').removeClass('active');
			Dom.query('#panel #edit').removeClass('active');
			Dom.query('#left #nav.active').removeClass('active');
			Dom.query('#product-info').removeClass('active');
			Dom.query('#right').removeClass('full');
			Dom.query('#filters').removeClass('active');
		});
	}
	toString(){
		return this.__proto__.constructor.name;
	}
	change_theme(color){
		storage.theme = color;
		Dom.query('header').set('class',color);
	}
}