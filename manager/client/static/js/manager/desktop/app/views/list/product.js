import { List, ReloadList } from "/static/js/manager/desktop/app/views/base/list.js";
import { Autocomplete } from "/static/js/vanilla-js/ui/autocomplete.js";
import { POST, GET } from "/static/js/vanilla-js/http/navigation.js";
import { Dom } from "/static/js/vanilla-js/ui/dom.js";
import { Select } from "/static/js/vanilla-js/ui/select.js";

export class BaseProductList extends List{
	constructor(context){
		super(context);

		Dom.query('.availability .bool').on('click',this.availability.bind(this));

		Dom.query('.settings-button').on('click',this.addInfo.bind(this));

		this.editors = {};
	}
	availability(e){
		var availability = e.target.hasClass('true') ? true : false;
		var product_id = e.target.closer('.settings-button').get('product-id');

		POST(`/action/${product_id}/availability`,{
			data:{'availability':!availability},
			View:function(response){
				if(response && response.result){
					e.target.removeClass(availability.toString());
					availability = !availability;
					e.target.addClass(availability.toString());
				}
			}
		});
	}
	addInfo(e){
		var target = e.target;
		var productId = target.get('product-id');
		if(!productId){
			target.parent().click();
			return false;
		}
		target.active();

		this.productId = productId;
		this.targetWindow = target;

		GET(`/api/Product/${productId}/?format=json`,{
			View:this.product_info.bind(this),
		});
	}
	product_info(response){
		Dom.query('#panel-menu').active();
		Dom.query('#product-info').active();
		Dom.query('#filters').removeClass('active');
		Dom.query('.edit-action').removeClass('active');
		Dom.query('#product-info').set('product-id',this.productId);
		this.targetWindow.active();

		if(!Object.keys(this.editors).length){
			Dom.query('#panel textarea').each((elem) => {
				let id = elem.parent().parent().parent().get('type');

				elem.hide();
				elem.parent().after(`<div id="editorjs-${id}"></div>`);

				let textarea = Dom.query(`#panel .export[type="${id}"] textarea[name="${elem.name}"]`)[0];

				let dummyDiv = Dom.create('div');
				dummyDiv.html(elem.innerHTML);

				if(!dummyDiv.children && elem.innerHTML){
					let p = Dom.create('p');
					p.html(elem.innerHTML);
					dummyDiv.append(p);
				}

				let parser = edjsHTML();

				let editor = new EditorJS({
					holder: `editorjs-${id}`,
					tools: {
						header: {
							class: Header,
							inlineToolbar: ['marker', 'link'],
							config: {
								placeholder: 'Header'
							},
							shortcut: 'CMD+SHIFT+H'
						},
						image: {
							class: SimpleImage,
							inlineToolbar: true
						},

						list: {
							class: EditorJsList,
							inlineToolbar: true,
							shortcut: 'CMD+SHIFT+L'
						},

						checklist: {
							class: Checklist,
							inlineToolbar: true,
						},

						quote: {
							class: Quote,
							inlineToolbar: true,
							config: {
							quotePlaceholder: 'Enter a quote',
							captionPlaceholder: 'Quote\'s author',
							},
							shortcut: 'CMD+SHIFT+O'
						},

						warning: Warning,

						marker: {
							class: Marker,
							shortcut: 'CMD+SHIFT+M'
						},

						code: {
							class: CodeTool,
							shortcut: 'CMD+SHIFT+C'
						},

						delimiter: Delimiter,

						inlineCode: {
							class: InlineCode,
							shortcut: 'CMD+SHIFT+C'
						},

						linkTool: LinkTool,

						embed: Embed,

						table: {
							class: Table,
							inlineToolbar: true,
							shortcut: 'CMD+ALT+T'
						},
					},
					data: {
						blocks: toJson(dummyDiv),
					},
					placeholder: elem.placeholder,
					onChange: (editor) => {
						editor.saver.save().then((out) => {

							let html = parser.parse(out);

							let result = '';
							if(Array.isArray(html)){
								for(let i of html){
									result += i;
								}
								html = result;
							}

							textarea.innerHTML = html;
							textarea.value = html;
						});
					},
					onReady: (e)=>{this.load_editor(response)}
				});

				this.editors[id] = editor;
			});
		}else{
			this.load_editor(response);
		}
	}
	load_editor(response){
		Dom.query(`.export input[type='radio']`).each((elem) => {elem.checked = false});
		for(let exp of response.export_status){
			Dom.query(`.export[type='${exp.export_id}'] [value='${exp.load}']`)[0].checked = true;
			if(exp.meta){
				let editor = this.editors[exp.export_id];

				Dom.query(`.export[type='${exp.export_id}'] [name='name']`)[0].value = exp.meta.name;
				Dom.query(`.export[type='${exp.export_id}'] [name='text']`)[0].innerHTML = exp.meta.text;

				let dummyDiv = Dom.create('div');
				dummyDiv.html(exp.meta.text);

				if(!dummyDiv.children.length && exp.meta.text){
					let p = Dom.create('p');
					p.html(exp.meta.text);
					dummyDiv.append(p);
				}

				editor.blocks.clear();
				for(let block of toJson(dummyDiv)){
					editor.blocks.insert(block.type,block.data);
				}
			}
		}
	}
}

export class ProductList extends BaseProductList{
	static limit = parseInt((window.screen.availHeight - (95 + 91)) / 88) * 2;

	constructor(context){
		super(context);

		this.min = context.min_price;
		this.max = context.max_price;

		Dom.query('.autocomplete').each(function(elem){
			new Autocomplete({container:elem,Model:elem.get('model')});
		});

		Dom.query(`.export input[type="radio"]`).on('change',this.productExport.bind(this));

		Select.customize('.custom-select');

		this.url.searchParams.set('limit',this.limit);
		this.slider();
	}
	productExport(e){
		let target = e.target;
		let export_id = target.name;
		let value = target.value;
		let productId = Dom.query('#product-info').get('product-id');

		POST(`/Product/${productId}`,{
			data:{
				export_status:[{
					export_id:parseInt(export_id),
					load:eval(value)
				}],
			}
		});
	}
	slider(){
		if(!window.noUiSlider){
			console.warn("NoUISLider is undefined");
			return;
		}
		if(this.min && this.max && (this.min < this.max)){
			var slider = Dom.query('#slider-range');
			var from = Dom.query("#amount-from");
			var to = Dom.query("#amount-to");
			Dom.query('#range-1').show();

			noUiSlider.Dom.create(
				slider,
				{
					start: [this.min, this.max],
					connect: true,
					step: 5,
					range: {
						'min':this.min,
						'max':this.max
					}
				}
			);
			slider.noUiSlider.on('update', (values, handle) => {

				let value = values[handle];

				if (handle) {
					to.value = Math.round(value);
				} else {
					from.value = Math.round(value);
				}

			});

			slider.noUiSlider.on('change', (values, handle) => {

				this.filter();

			});
		}
	}
}

export class ProductReloadList extends ReloadList{
	static limit = parseInt(window.screen.availHeight / 1.80 / 79) * 2;

	constructor(context){
		super(context);
	}
}