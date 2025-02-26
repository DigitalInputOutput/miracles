import { OneToOne } from "./fgk.js";
import { Dom } from "/static/js/desktop/vanilla/ui/dom.js";

export class Gallery extends OneToOne{
	constructor(context){
		super(context);

		this.previewImage = Dom.query('#bigPhoto img')[0];
		this.fullSize = Dom.query('#bigPhoto');
		this.closeButton = Dom.query('#bigPhoto .close');
		this.stop = false;
		this.images = Dom.query('#gallery-items');
		Dom.query('#plus').on('click',this.add.bind(this));
		Dom.query('#images .remove').on('click',this.remove.bind(this));
		Dom.query('#images img').on('click',this.preview.bind(this));

		this.removeListInput = Dom.query('#images input[name="remove_images"]')[0];
		this.removeList = JSON.parse(this.removeListInput.value);

		this.fullSize.on('click',this.next.bind(this));
		this.closeButton.on('click',this.close.bind(this));
	}
	close(e){
		this.fullSize.hide();
		Dom.query('#bg').hide();
	}
	next(e){
		
	}
	preview(e){
		if(this.stop){
			this.stop = false;
			return;
		}
		let image = e.target;
		this.previewImage.set('src',image.get('original'));
		this.fullSize.css('display','flex');
		Dom.query('#bg').show();
	}
	remove(e){
		if(e.target.tagName == 'I'){
			e.target.parent().click();
			e.stopPropagation();
			return false;
		}

		let parent = e.target.parent();
		let agree = confirm('Видалити картину?');
		let target = e.target;

		if(target.get('item-id') && agree){
			this.removeList.push(target.get('item-id'));
			this.removeListInput.value = JSON.stringify(this.removeList);
			parent.remove();
		}else if(agree)
			parent.remove();

		e.stopPropagation();
		return false
	}
	add(){
		let input = Dom.create('input');
		input.set('type','file');
		input.hide();
		this.input = input;
		this.images.append(input);
		input.on('change',this.render.bind(this));
		input.click();
	}
	render(e){
		let file = e.target.files[0];
		let reader = new FileReader();
		let that = this;

		reader.onload = function(e){
			let div = Dom.create('div');
			div.set('class','image ui-sortable-handle');
			div.html('<div class="remove"><i class="fas fa-times"></i></div>');
			div.find('.remove')[0].on('click',that.remove);
			let image = Dom.create('img');
			image.src = e.target.result;
			image.set('original',e.target.result);
			image.on('click',that.preview.bind(that));
			div.append(image);
			that.input.set('name','images');
			that.input.set('value',e.target.result);
			that.images.append(div);
		};
		reader.readAsDataURL(file);
	}
}