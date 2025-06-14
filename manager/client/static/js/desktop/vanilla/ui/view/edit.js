import { Screen } from "./screen.js";
import { Dom } from "/static/js/desktop/vanilla/ui/dom.js";
import { AutocompleteF } from "/static/js/desktop/vanilla/ui/form/autocompletef.js";
import { DELETE, GET, PUT } from "/static/js/desktop/vanilla/http/navigation.js";
import { storage } from "/static/js/desktop/vanilla/ui/const.js";
import { Alert } from "/static/js/desktop/vanilla/ui/alert.js";

export class BaseEdit extends Screen{
	container = 'main';

	constructor(context){
		super(context);
		this.href = context.href;

		this.saveButton = Dom.query('#save');
		this.saveButton.on('click',this.save.bind(this));
		Dom.query('#save-more').on('click',this.save_more.bind(this));
		Dom.query('#save_and_out').on('click',this.save_and_out.bind(this));
		this.deleteButton.on('click',this.delete.bind(this));

		// console.log(context);
		if(context.anchor)
			this.active = Dom.query(`#item-menu div.menu-item[data-tab=${context.anchor}]`)[0];

		if(!this.active){
			this.active = Dom.query('#item-menu .menu-item')[0];
		}

		if(this.active){
			this.active.active();

			Dom.query(`#item #${this.active.get('data-tab')}`).active();

			Dom.query('#item-menu .menu-item').on('click',this.tabs.bind(this));
		}

		Dom.query('main form *').on('change select input',function(){
			Dom.query('#save').removeAttr('disabled');
		});
		Dom.query('#id_name,#id_user-name').on('input',function(){
			Dom.query('h1').text(this.value)
		});

		Dom.query('.autocomplete').each(function(elem){
			new AutocompleteF({container:elem,Model:elem.get('model')});
		});

		try{
			this.id = context.id ? context.id : context.id;
		}catch(e){}
	}
	tabs(e){
		if(!e.target.get('data-tab')){
			e.target.parent().click();
			return;
		}
		if(this.active){
			this.active.removeClass('active');
			Dom.query(`#item #${this.active.get('data-tab')}`).active();
		}
		this.active = e.target;
		e.target.addClass('active');
		Dom.query(`#item #${e.target.get('data-tab')}`).active();
		history.replaceState(null, '', location.pathname + location.search + '#' + e.target.get('data-tab'));
	}
	delete(){
		if(confirm('Удалить?')){
			var that = this;
			DELETE(`/${this.Model}/${this.id}`,{
				View:function(response){
					if(response.result){
						GET(`/${that.Model}`);
					}
				}
			});
		}
	}
	get_data(){
		return Dom.query('#item form')[0].serializeJSON();
	}
	save(action){
		if(!this.saveButton.get('disabled'))
			PUT(this.href,{
				data:this.get_data(),
				View:this.post_save.bind(this),
				action:action
			});
	}
	save_more(){
		this.save('more');
	}
	save_and_out(){
		this.save('out');
	}
	post_save(response){
		if(response.result){
			Alert.popMessage('Сохранено успешно.');

			if(response.action){
				if(response.action == 'more')
					GET(`/${this.Model}/`);
				else if(response.action == 'out'){
					GET(`/${this.Model}`);
				}
			}else if(response && response.href){
				GET(response.href);
			}
			this.extraAction();
		}else{
			var errors = '';
			for(var error in response.errors){
				errors += error + '<br>' + response.errors[error] + '<br>';
			}
			errors += response.nonferrs + '<br>';
			Alert.popMessage(errors,7000);
		}
	}
	extraAction(){
		
	}
}

export class Edit extends BaseEdit{
	container = 'main';

	constructor(context){
		super(context);

		this.editors = [];

		if(!Dom.query('.languages').length)
			return;

		new Sortable(Dom.query('.languages')[0], {
			animation: 150,
			ghostClass: 'blue-background-class',
			onSort: function(e){
				var lang_order = [];
				Dom.query('.languages > div').each(function(elem){
					lang_order.push(elem.get('lang-id'));
				});
				storage.LANG_ORDER = JSON.stringify(lang_order);
			}
		});

		var that = this;
		var container = Dom.query('.languages')[0];
		var list = JSON.parse(storage.LANG_ORDER);
		for(var id of list){
			container.append(Dom.query(`.languages > div[lang-id="${id}"]`)[0]);
		}

		that.activeLang = Dom.query('.languages > div')[0];
		that.activeLang.addClass('active');

		Dom.query(`#description #${that.activeLang.get('data-tab')}`)[0].active();
		Dom.query('.fieldset.meta .languages > div').on('click',that.langMenu.bind(that));

		Dom.query('textarea').each((elem) => {
			elem.hide();
			elem.parent().after(`<div id="${elem.id}-editorjs"></div>`);

			let jsonStorage = Dom.query(`#${elem.id.replace('text','json_text')}`);
			let textarea = Dom.query(`textarea[name="${elem.name}"]`)[0];

			let dummyDiv = Dom.create('div');
			dummyDiv.html(elem.defaultValue);

			if((!dummyDiv.children || !dummyDiv.children.length) && elem.innerHTML){
				let p = Dom.create('p');
				p.html(elem.innerHTML);
				dummyDiv.append(p);
			}

			let parser = edjsHTML();

			let editor = new EditorJS({
				holder: elem.id + '-editorjs',
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
						inlineToolbar: true,
					},

					list: {
						class: EditorList,
						inlineToolbar: true,
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
						jsonStorage.value = JSON.stringify(out);

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
				onPaste: (event) => {
					console.log(event);
				}
			});

			this.editors.push(editor);
		});
	}
	langMenu(e){
		if(!e.target.get('data-tab')){
			e.target.parent().click();
			return;
		}
		if(this.activeLang){
			this.activeLang.removeClass('active');
			Dom.query(`#description #${this.activeLang.get('data-tab')}`)[0].active();
		}
		this.activeLang = e.target;
		e.target.addClass('active');
		Dom.query(`#description #${e.target.get('data-tab')}`)[0].active();
	}
}
export class Image extends Edit{
	constructor(context){
		super(context);

		Dom.query('.pic').on('click',function(){
			this.find('input')[0].click();
		});
		Dom.query('.pic .remove').on('click',this.removeImage);
		Dom.query('.pic input').on('change',this.changeImage);
	}
	changeImage(){
		var file = this.files[0];
		var reader = new FileReader();
		var that = this;
		reader.onload = function(e){
			var image = that.prev();
			image.src = e.target.result;
			that.set('value', e.target.result);
			that.parent().removeClass('active');
			that.closer('.remove').addClass('active');

			// Store Base64 in a hidden input field
			let hiddenInput = Dom.create('input');
			hiddenInput.type = 'hidden';
			hiddenInput.name = that.name + "_b64";  // e.g., image_b64
			hiddenInput.value = e.target.result;
		
			that.parent().append(hiddenInput);
		};
		reader.readAsDataURL(file);
	}
	removeImage(event){
		if(confirm('Точн?')){
			this.parent().find('img')[0].src = '/media/no_image.jpg';
			this.parent().find('input')[0].set('value','remove');
			Dom.query('#save').removeAttr('disabled');
			this.closer('.remove').removeClass('active');
		}
		event.stopPropagation();
		return false;
	}
}