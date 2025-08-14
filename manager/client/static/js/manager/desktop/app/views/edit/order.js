import { Edit } from "/static/js/manager/desktop/app/views/base/edit.js";
import { Dom } from "/static/js/vanilla-js/ui/dom.js";
import { Cart } from "./cart.js";
import { GET, POST, PUT } from "/static/js/vanilla-js/http/navigation.js";
import { Select } from "/static/js/vanilla-js/ui/select.js";
// import { templates } from "/static/js/manager/desktop/app/form/templates.js";
import { Alert } from "/static/js/vanilla-js/ui/alert.js";

var timeout;
export class OrderEdit extends Edit{
	constructor(context){
		super(context);
		this.model = 'order';
		this.panel = Dom.query('#sms-panel');
		this.panelButtons = Dom.query('#sms-panel .buttons');
		this.cart = new Cart(context);
		this.address = Dom.query('#id_address').value;
		this.seats = Dom.query('#seats');
		this.product_names = this.collectNames();
		this.index = 0;

		this.delivery_type = Dom.query('#id_delivery_type').value;

		this.smsButton = Dom.query('#sms');

		this.OptionsSeat = [];

		Dom.query('#add-seat').on('click',this.addSeat.bind(this));
		Dom.query('#order-ttn .close').on('click',this.createTTHwindow);

		Dom.query('#make-ttn').on('click',this.ttn.bind(this));
		this.smsButton.on('click',this.smsPanel.bind(this));
		Dom.query('#sms-panel .sel-items-wrapper > div').on('click',this.sms.bind(this));
		Dom.query('#track').on('click',this.track.bind(this));
		Dom.query('#id_delivery_type').on('change',this.delivery.bind(this));
		Dom.query('#create-ttn').on('click',this.createTTHwindow);
		Dom.query('#create-ttn *').on('click',(event) => {
			event.stopPropagation();
			return false;
		});

		Dom.query('#id_city').on('input keyup paste',this.city.bind(this));

		Dom.query('#id_departament').on('input keyup paste', () => {
			this.departament(Dom.query('#id_delivery_type').value,Dom.query('input[name="city"]')[0].value);
		});

		let type = Dom.query('#id_delivery_type').value;
		if(type == 1 || type == 2){
			Dom.query('#city').show();
			Dom.query('#departament').show();
		}

		Dom.query('body').on('click',this.hide_variants);

		Dom.query('#id_city').on('click', (e) => {
			let variants = Dom.query('#city .variants')[0];
			if(e.target.value && variants.children.length)
				variants.show();
			else{
				this.city(true);
			}
			e.stopPropagation();
			return false;
		});

		Dom.query('#id_departament').on('click', (e) => {
			let variants = Dom.query('#departament .variants')[0];
			if(e.target.value && variants.children.length)
				variants.show();
			else{
				this.departament(Dom.query('#id_delivery_type').value,Dom.query('input[name="city"]')[0].value);
			}
			e.stopPropagation();
			return false;
		});

		Dom.query('#copyFIO').on('click',this.copyFIO);

		Select.customize('.custom-select');
	}
	collectNames(){
		let result = [];
		for(let i of Dom.query('#order-items .item .name')){
			result.push(i.text());
		}
		return result
	}
	calculateSeatCost(){
		let cost = this.cart.totalSum / Dom.query('#seats .seat').length;
		Dom.query('#seats input[name="cost"]').each((elem) => {
			elem.value = cost;
		});
	}
	addSeat(){
		let seat = Dom.render('#seat', this.seats);
		let name;
		this.calculateSeatCost();
		this.seats.find('.remove').on('click',this.removeSeat.bind(this));
		if(this.product_names[this.index])
			name = this.product_names[this.index];
		else{
			name = this.product_names[0];
		}
		Dom.query('#seats .seat input[name="description"]').last().value = name;
		Dom.query('#seats .seat input[name="weight"]').on('change',function(e){
			e.stopPropagation();
			e.preventDefault();
			return false;
		});
		Dom.query('#seats .seat input.calculate').on('change',this.calculateVolumeGeneral);
		this.index++;
	}
	calculateVolumeGeneral(){
		var res = 0;
		Dom.query('#seats .seat').each(function(seat){
			var h = seat.find('input[name="volumetricHeight"]')[0].value;
			var w = seat.find('input[name="volumetricWidth"]')[0].value;
			var l = seat.find('input[name="volumetricLength"]')[0].value;
			if(h && w && l){
				var volumeGenaral = (h * w * l) / 4000;
				res += volumeGenaral;
				seat.find('input[name="weight"]')[0].value = volumeGenaral;
			}
		});

		Dom.query('#order-ttn input[name="volume"]')[0].value = res;
	}
	removeSeat(e){
		if(e.target.parent().hasClass('remove')){
			e.target.parent().click();
			return false;
		}
		e.target.parent().remove();
		this.calculateSeatCost();
	}
	collectSeats(){
		var result = [];
		Dom.query('#seats .seat').each(function(seat){
			result.push(seat.serializeJSON());
		});
		return result;
	}
	copyFIO(){
		var fio = `${Dom.query('#id_lname').value} ${Dom.query('#id_name').value} ${Dom.query('#id_sname').value}`;
		navigator.clipboard.writeText(fio).then(function() {
			/* clipboard successfully set */
		}, function() {
			/* clipboard write failed */
		});
	}
	hide_variants(){
		if(Dom.query('#id_city').value && Dom.query('#city .variants')[0].style.display == 'block')
			Dom.query('#city .variants')[0].hide();
		if(Dom.query('#id_departament').value && Dom.query('#departament .variants')[0].style.display == 'block')
			Dom.query('#departament .variants')[0].hide();
	}
	createTTHwindow(event){
		Dom.query('#order-ttn').active();
		Dom.query('#bg').active();
		event.stopPropagation();
		return false;
	}
	delivery(){
		if(this.delivery_type == Dom.query('#id_delivery_type').value)
			return;

		var type = Dom.query('#id_delivery_type').value;

		Dom.query('#city').hide();
		Dom.query('#departament').hide();
		Dom.query('input[name="city"]')[0].value = '';
		Dom.query('#id_city').value = '';
		Dom.query('input[name="departament"]')[0].value = '';
		Dom.query('#id_departament').value = '';

		if(type != 3 && Dom.query('#address') && !Array.isArray(Dom.query('#address')))
			Dom.query('#address').remove();

		if(type == 1 || type == 2){
			Dom.query('#city').show();
			Dom.query('#departament').show();
		}
		if(type == 3){
			var div = Dom.create('div');
			var address = templates.address();
			div.html(address);
			div.set('id','address');
			Dom.query('#order-info').afterOf(div,Dom.query('#id_payment_type').parent());
		}
	}
	city(click){
		if(timeout)
			clearTimeout(timeout);

		var type = Dom.query('#id_delivery_type').value;
		var city = Dom.query('#id_city').value;

		var that = this;
		timeout = setTimeout(() => {
			if(city && city.length > 1){
				GET(`/delivery/city/${type}/${city}`,{
					View:function(response){
						Dom.query('#city').show();
						Dom.query('#city .variants')[0].clear();
						Dom.query('#city .variants')[0].html(templates.variants(response));
						Dom.query('#city .variant').on('click',function(e){
							Dom.query('#id_city').value = e.target.text();
							Dom.query('input[name="city"]')[0].value = e.target.get('value');
							that.departament(type, e.target.get('value'));
						});
						for(var item of response){
							if(item.address == Dom.query('#id_city').value && !click){
								Dom.query('input[name="city"]')[0].value = item.id;
								that.departament(type, item.id);
								return;
							}
						}
						Dom.query('#city .variants')[0].show();
					}
				});
			}
		},500);
	}
	departament(type, city_id, value){
		if(!value)
			var value = Dom.query('#id_departament').value;

		if(timeout)
			clearTimeout(timeout);
		timeout = setTimeout(() => {
			GET(`/delivery/departament/${type}/${city_id}/${value}`,{
				View:function(response){
					Dom.query('#departament').show();
					Dom.query('#departament .variants')[0].clear();
					Dom.query('#departament .variants')[0].show();
					Dom.query('#departament .variants')[0].html(templates.variants(response));
					Dom.query('#departament .variant').on('click',function(e){
						Dom.query('#id_departament').value = e.target.text();
						Dom.query('input[name="departament"]')[0].value = e.target.get('value');
					});
				}
			});
		},500);
	}
	save(e){
		let items = [];

		Dom.query('#items .order-item').each(function(item){
			let qty = parseInt(item.find('input[name="qty"]')[0].value);
			let price = parseInt(item.find('input[name="price"]')[0].value);
			items.push({id:item.get('product-id'),qty:qty,price:price});
		});

		let context = {};
		context.data = Dom.query('form').serializeJSON();
		context.data.items = items;
		context.data.remove = this.cart.removeList;

		let that = this;
		context.View = function(response){
			if(response.result){
				that.cart.removeList = [];
				if(response.href){
					GET(response.href);
				}else{
					Alert.popMessage('Сохранен успешно.',3000);
				}
			}else if(response.errors){
				let errors = '';
				for(let error in response.errors){
					errors += error + '<br>' + response.errors[error] + '<br>';
				}
				errors += response.nonferrs + '<br>';
				Alert.popMessage(errors,7000);
			}
		};

		PUT(this.href,context);

		e.stopPropagation();
		e.preventDefault();
		return false;
	}
	ttn(e){
		let context = {data:{}};
		context.data.order = Dom.query('#order').serializeJSON();
		context.data.ttn = Dom.query('#order-ttn').serializeJSON();
		context.data.seats = this.collectSeats();
		context.data.total = Dom.query('#total .sum').text();

		context.View = function(response){
			if(response.ref){
				/*win = window.open("https://my.novaposhta.ua/orders/printDocument/orders[]/"+http.json.ref+"/type/html/apiKey/a5d31efa7bc0f7b138a06a130d8e5327",'_blank');
				win.focus();
				win.print();*/
				Dom.query('#id_status').value = 8;
				Alert.popMessage('TTH создана');
			}else if(response && response.errors){
				response.Dom.Errors();
			}
		};
		POST('/order/ttn',context);
	}
	smsPanel(event){
		this.smsButton.active();
		this.panel.active();
		this.panelButtons.active();
		event.stopPropagation();
	}
	sms(e){
		var summ = null;
		var delivery_type = Dom.query('#id_delivery_type');
		var type = e.target.get('id');

		if(delivery_type.value == 3)
			summ = prompt('Введи сумму');
		if(delivery_type.value == 3 && !summ)
			return false;

		if((type == 'ttn' && Array.isArray(Dom.query('#id_ttn'))) || (type == 'ttn' && !Dom.query('#id_ttn').value.length)){
			Alert.popMessage('Создайте ТТН');
			return;
		}

		var context = {};
		context.View = function(response){
			if(response.result){
				Alert.popMessage('Отправлена.');
			}
		};
		if(summ)
			GET(`/order/sms/${this.id}/${type}/${summ}`,context);
		else{
			GET(`/order/sms/${this.id}/${type}`,context);
		}
	}
	track(){
		GET(`/order/track/${this.id}`,{
			View:function(response){
				Alert.popMessage(JSON.stringify(response));
			}
		});
	}
}