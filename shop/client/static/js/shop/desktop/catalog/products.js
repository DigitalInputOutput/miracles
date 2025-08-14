import { Filter } from './filter.js';
import { Dom } from "/static/js/vanilla-js/ui/dom.js";

export class Category extends Buy{
	constructor(){
		super();
		this.filter = new Filter(window.parameters);
		this.list();

		Dom.query('body').on('click',(e)=>{
			switch(e.target.className){
				case 'fas fa-balance-scale': this.store(e.target,pageObject.compare,storage.compare);break;
				case 'fas fa-star': this.store(e.target,pageObject.favorite,storage.favorite);break;
			}
			e.stopPropagation();
		});
	}
	store(target, object, storage){
		let id = target.closer('model');

		if(!object.includes(id)){
			object.push(id);
			storage = JSON.stringify(object);
		}
		let className = target.classList[1];
		let headerButton = Dom.query(`header .${className}`)[0];

		headerButton.prev().text(object.length);
		headerButton.parent().show();
		headerButton.active();

		this.animate(this.getDataToAnimate(target,headerButton));
	}
	getDataToAnimate(target,headerButton){
		var img = target.closer('img');
		var item = target.parent().getBoundingClientRect();
		var toTarget = headerButton;

		return [img,item,toTarget]
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