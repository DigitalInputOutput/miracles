export class Category extends Buy{
	constructor(){
		super();
		this.filter = new Filter(window.parameters);
		this.list();
		Dom.query('#filters label.dropdownButton').on('click',this.showFilter.bind(this));
		Dom.query('#filters .close').on('click',this.closeFilter.bind(this));

		this.filters = Dom.query('#filters');
		if(!Array.isArray(this.filters)){
			this.scrollHeight = this.filters.offsetTop - this.filters.height();

			this.scroll();

			addEventListener('scroll',this.scroll.bind(this));
		}
	}
	scroll(){
		if(!this.filters.hasClass('active') && !this.openedFilter){
			if(window.scrollY > this.scrollHeight){
				this.filters.addClass('active');
			}
		}else if(window.scrollY < this.scrollHeight){
			this.filters.removeClass('active');
		}
	}
	showFilter(e){
		var target = e.target;
		target.next().next().toggle();
		target.next().show();
		Dom.query('#bg').toggle();
		this.filters.removeClass('active');
		this.openedFilter = true;
		var closeButton = target.next();
		setTimeout(function(){
			closeButton.toggleClass('show');
		},100);
	}
	closeFilter(e){
		var closeButton = e.target;
		setTimeout(function(){
			closeButton.toggleClass('show');
			closeButton.hide();
		},100);
		this.openedFilter = false;
		closeButton.next().hide();
		Dom.query('#bg').hide();
		this.scroll();
	}
	list(){
		if(!storage.list)
			storage.list = 'grid';

		Dom.query(`#elementStyle i[type="${storage.list}"]`).addClass('active');
		Dom.query('main .items').toggleClass(storage.list);

		Dom.query('#elementStyle i').on('click',function(){
			var type = this.attr('type');
			Dom.query('main .items').toggleClass(storage.list);
			Dom.query('main .items').toggleClass(type);
			Dom.query('#elementStyle i.active').toggleClass('active');
			Dom.query(`#elementStyle i[type="${type}"]`).toggleClass('active');
			storage.list = type;
		});
	}
}

export class Brand extends Category{
	constructor(){
		super();
	}
}

export class Tag extends Category{
	constructor(){
		super();
	}
}
export class Sale extends Category{
	constructor(){
		super();
	}
}
export class Bestsellers extends Category{
	constructor(){
		super();
	}
}
export class New extends Category{
	constructor(){
		super();
	}
}