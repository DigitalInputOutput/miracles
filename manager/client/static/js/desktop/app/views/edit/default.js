import { OneToOne } from "./fgk";
import { Edit } from "../../../vanilla/ui/view/edit";

export class AttributeEdit extends OneToOne{
	static block = 'main';

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