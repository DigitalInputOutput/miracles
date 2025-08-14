import { Image } from "/static/js/manager/desktop/app/views/base/edit.js";

export class Tag extends Image{
	constructor(context){
		super(context);
		this.model = 'tag';
	}
}