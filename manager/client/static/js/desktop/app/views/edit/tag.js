import { Image } from "/static/js/desktop/vanilla/ui/view/edit.js";

export class Tag extends Image{
	constructor(context){
		super(context);
		this.model = 'tag';
	}
}