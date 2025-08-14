import { OneToOne } from "./fgk.js";
import { Edit } from "/static/js/desktop/app/view/edit.js";

export class AttributeEdit extends OneToOne{
	static container = 'main';

	constructor(context){
		context.field = 'value';
		super(context);
	}
}
export class Export extends Edit{
	constructor(context){
		super(context);
		this.model = 'Export';
	}
}