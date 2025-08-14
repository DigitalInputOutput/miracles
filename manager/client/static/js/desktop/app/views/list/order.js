import { List } from "/static/js/desktop/app/view/list.js";
import { Dom } from "/static/js/desktop/vanilla/ui/dom.js";
import { GET } from "/static/js/desktop/vanilla/http/navigation.js";
import { Select } from "/static/js/desktop/modules/select.js";

export class OrderList extends List{
	constructor(context){
		super(context);
		Dom.query('#tracking button').on('click',this.tracking);
		Dom.query('#sms').on('click',this.sms);
		Select.customize('.custom-select');
	}
	sms(){
		if(confirm('Are you sure?')){
			GET('/order/mass_sms',{
				View:function(response){
					if(response.result)
						Alert.popMessage('SMS разошлись успешно.');
				}
			});
		}
	}
	tracking(){
		GET('/order/tracking',{
			View:function(response){
				if(response.items){
					var items = response.items;
					for(var i in items){
						var item = items[i];
						var ul = create('ul');
						ul.html(`${i}:`);
						for(var value in item){
							var li = create('li');
							li.html(`${value}: ${item[value]}`);
							ul.append(li);
						}
						Dom.query('#tracking #result')[0].append(ul);
					}
					Dom.query('#tracking #result')[0].show();
				}else{
					Alert.popMessage('Нет таких заказов.');
				}
			}
		});
	}
}