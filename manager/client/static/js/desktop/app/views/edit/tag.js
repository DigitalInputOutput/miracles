import { Image } from "../../../vanilla/ui/view/edit";

export class Tag extends Image{
	constructor(context){
		super(context);
		this.model = 'tag';
		jQuery('.meta textarea').redactor({
				plugins: ['source'],
			});
	}
}