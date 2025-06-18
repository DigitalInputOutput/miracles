import { Screen } from "./screen.js";
import { Dom } from "/static/js/desktop/vanilla/ui/dom.js";
import { AutocompleteF } from "/static/js/desktop/vanilla/ui/form/autocompletef.js";
import { DELETE, GET, PUT } from "/static/js/desktop/vanilla/http/navigation.js";
import { storage } from "/static/js/desktop/vanilla/ui/const.js";
import { Alert } from "/static/js/desktop/vanilla/ui/alert.js";
import { t } from "/static/js/desktop/app/i18n.js";
import { Validator, SlugBasedValidator } from "/static/js/desktop/vanilla/ui/form/validate.js";
import { SimpleImage } from "/static/js/desktop/modules/editor/img.js";
import { toJson } from "/static/js/desktop/vanilla/ui/utils.js";

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

		Dom.query('.autocomplete').each((elem) => {
			new AutocompleteF({
				container: elem,
				AdminModel: elem.get('model')
			});
		});

		this.initValidator(this.prepareValidationRules());

		try{
			this.id = context.id ? context.id : undefined;
		}catch(e){}
	}

	initValidator(validationRules){
        this.validator = new Validator(
			Dom.query('#item form')[0],
			validationRules,
			this.saveButton
		);
	}

	prepareValidationRules(){
		let validationRules = {};
		Dom.query('#item form input, #item form select').forEach(inp => {
			if(inp.type == 'hidden' || !inp.name)
				return;

			validationRules[inp.name] = {
				'rules': {},
				'errors':{}
			};
			if(inp.required){
				validationRules[inp.name]['rules']['required'] = true;
				validationRules[inp.name]['errors']['required'] = t('required_error');
			}
			if(inp.maxLength && inp.maxLength > 0){
				validationRules[inp.name]['rules']['max_length'] = inp.maxLength;
				validationRules[inp.name]['errors']['max_length'] = t('max_length_error') + inp.maxLength;
			}
			if(inp.minLength && inp.minLength > 0){
				validationRules[inp.name]['rules']['min_length'] = inp.minLength;
				validationRules[inp.name]['errors']['min_length'] = t('max_length_error') + inp.minLength;
			}
		});

		return validationRules;
	}

	tabs(e){
		if(!e.target.get('data-tab')){
			e.target.parent().click();
			return;
		}

		if(e.target.hasClass("active"))
			return;

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
		if(confirm(t("sure_delete"))){
			const that = this;
			DELETE(Navigation.currentPath,{
				success: (response) => {
					if(response.result){
						GET(`/${that.AdminModel}`);
					}
				}
			});
		}
	}
	get_data(){
		return Dom.query('#item form')[0].serializeJSON();
	}
	save(event, action){
		if(!this.validator.is_valid())
			return;

		PUT(this.href,{
			data:this.get_data(),
			success:this.post_save.bind(this),
			action:action
		});
	}
	save_more(event){
		this.save(event, 'more');
	}
	save_and_out(event){
		this.save(event, 'out');
	}
	post_save(response){
		if(response.result){
			Alert.popMessage(t("saved_succesfully"));

			if(response.action){
				if(response.action == 'more')
					GET(`/${this.AdminModel}/`);
				else if(response.action == 'out'){
					GET(`/${this.AdminModel}`);
				}
			}else if(response && response.next){
				GET(response.next);
			}
			this.extraAction();
		}else{
			let errors = '';
			console.log(response.errors);
			for(const [field, error] of Object.entries(response.errors)){
				for(const text of error){
					errors += `${field} - ${text}<br>`;
				}
			}
			errors += `${response.nonferrs}<br>`;
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
				let lang_order = [];
				Dom.query('.languages > div').each(function(elem){
					lang_order.push(elem.get('lang-id'));
				});
				storage.LANG_ORDER = JSON.stringify(lang_order);
			}
		});

		const that = this;
		const container = Dom.query('.languages')[0];
		const list = JSON.parse(storage.LANG_ORDER);
		for(let id of list){
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

		if(e.target.hasClass("active"))
			return;

		if(this.activeLang){
			this.activeLang.removeClass('active');
			Dom.query(`#description #${this.activeLang.get('data-tab')}`)[0].removeClass('active');
		}

		this.activeLang = e.target;
		e.target.addClass('active');

		Dom.query(`#description #${e.target.get('data-tab')}`)[0].addClass('active');
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
		const file = this.files[0];
		const reader = new FileReader();
		const that = this;
		reader.onload = function(e){
			let image = that.prev();
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
		if(confirm(t('sure_delete'))){
			this.parent().find('img')[0].src = '/media/no_image.jpg';
			this.parent().find('input')[0].set('value','remove');
			Dom.query('#save').removeAttr('disabled');
			this.closer('.remove').removeClass('active');
		}
		event.stopPropagation();
		return false;
	}
}

export class SlugBasedEdit extends Edit{
	initValidator(validationRules){
        this.validator = new SlugBasedValidator(
			Dom.query('#item form')[0],
			validationRules,
			this.saveButton,
			this.langMenu,
			this.tabs,
			this
		);
	}
}