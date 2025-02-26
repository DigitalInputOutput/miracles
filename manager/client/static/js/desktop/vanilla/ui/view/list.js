import { BaseScreen } from './screen.js';
import { Dom } from '/static/js/desktop/vanilla/ui/dom.js';
import { GET, POST, DELETE } from '/static/js/desktop/vanilla/http/method.js';
// import { Http } from '/vanilla/js/http/http.js';
// import { timeout } from '/vanilla/js/utils.js';
// import { view } from '/vanilla/js/view.js';

export class BaseList extends BaseScreen{
	constructor(context){
		super(context);

		Dom.query('#check-all').on('click',this.checkAll);
		Dom.query('#list-all').on('click',this.showAll.bind(this));

		Dom.query('.search-text input').each((input) => {
			input.on('input paste keypress focus',this.search.bind(this));
			if(input.value)
				this.showClearButton(input);
		});

		Dom.query('#head a').on('click',this.ordering.bind(this));

		if(context && context.url)
			this.url = context.url;
		else if(context){
			this.url = new URL(context.href,location.origin);
		}
		else{
			this.url = new URL(location.href + location.search);
		}

	}

	checkAll(){
		var checked = this.find('input')[0].checked;
		var checkboxes = Dom.query('#items input[type=checkbox]');
		for(var i=0, n=checkboxes.length;i<n;i++) {
			checkboxes[i].checked = checked;
		}
	}
	
	showAll(event){
		POST('?all=true');

		event.stopPropagation();
		event.preventDefault();
		return false;
	}

	ordering(e){
		var ordering = e.target.get('ordering');
		if(!this.url.search.includes('o=-'))
			ordering = '-' + ordering;

		this.url.searchParams.set('o',ordering);
		var href = this.url.pathname + this.url.search;

		GET(href);
	}

	showClearButton(input){
		input.next().show();
	}

	search(e){
		let input = e.target;

		if(input && input.value.length > 2){
			if(this.timeout)
				clearTimeout(this.timeout);
			this.timeout = setTimeout(() => {
				this.showClearButton(input);

				if(input.value)
					this.url.searchParams.set(input.name,input.value);
				else{
					this.url.searchParams.delete(input.name);
				}

				POST(`${this.url.pathname}${this.url.search}`);
			},500);
		}else{
			if(this.url.searchParams.get(input.name))
				this.url.searchParams.delete(input.name);
		}

		e.stopPropagation();
		return false;
	}
}

export class List extends BaseList{
	static block = 'main';
	static limit = parseInt((window.screen.availHeight - (105 + 91)) / 58);

	constructor(context){
		super(context);
		this.is_list = true;

		Dom.query('.delete-list').on('click',this.delete.bind(this));

		Dom.query('#add').on('click',(e) => {
			GET(this.get('href'));
		});

		Dom.query('#filters *,#filters').on('click',(e) => {
			e.stopPropagation();
		});

		Dom.query('#filters *').on('change',this.filter.bind(this));

		Dom.query('.edit-action').on('submit',this.editAction.bind(this));

		Dom.query('.clear-search').on('click',this.clearSearch.bind(this));
		
		Dom.query('#search i').on('click',() => {
			setTimeout(() => {
				Dom.query('#search i').active();
				Dom.query('#search-text').active();
			},300);
		});

		Dom.query('.toggle-panel').on('click',(e) => {
			Dom.query('#panel-menu').active();
			Dom.query('#filter').addClass('active');
			Dom.query('#product-info').removeClass('active');

			e.stopPropagation();
			e.preventDefault();
			return false;
		});

		Dom.query('#toggle-settings').on('click',(e) => {
			Dom.query('.edit-action').active();
		});

		Dom.query('#panel-menu,#panel-menu *').on('click',(e) => {
			e.stopPropagation();
		});

		this.url.searchParams.set('limit',this.limit);

		Dom.query('#search-text').on('input paste keypress',this.searchText.bind(this));

		this.populateFiltersFromURL();
	}

    // Populate filters from URL search parameters
    populateFiltersFromURL() {
        try {
            for (const [key, value] of view.url.searchParams.entries()) {
                const filterElement = Dom.query(`#filters #${key}`);
                if (filterElement.length) {
                    filterElement[0].value = value;
                }
            }
        } catch (e) {
            console.error(e);
        }
    }

	searchText(e){
		let input = e.target;

		if(timeout)
			clearTimeout(timeout);
		timeout = setTimeout(() => {
			if(input.value && input.value.length >= 3){
				POST(`/${this.Model}?value=${input.value}`);
			}
		},500);
	}

	editAction(e){
		let method = e.target.get('method');
		let update_data = Dom.query(`.edit-action[method="${method}"]`)[0].serializeJSON();

		if(!Object.keys(update_data).length)
			return;

		let context = {
			data:{
				update_data:update_data
			},
			View:(response) => {
				if(response.json && response.json.result)
					response.alert(`Оновлено: ${response.json.updated}`);
			}
		};

		let checkboxes = Dom.query('input[type=checkbox]');
		if(checkboxes.length){
			let data = [];
			for(let i=0;i<checkboxes.length;i++){
				if(checkboxes[i].checked && checkboxes[i].value*1){
					data.push(checkboxes[i].value);
				}
			}
			if(!data.length)
				return;
			else if(confirm('Are U sure?')){
				context.update_list = data;
			}
		}

		// eval(method)(`${Http.parse_url().href}`,context);

		e.stopPropagation();
		e.preventDefault();

		return false;
	}

	clearSearch(e){
		let input = e.target.prev();
		if(input.value){
			input.value = '';
			this.url.searchParams.delete(input.get('name'));
			let href = this.url.pathname + this.url.search;

			GET(href);
		}
		e.target.hide();
	}

	filter(e){
		if(!e.trusted && !e.isTrusted)
			return;

		let target = e.target;
		let name   = target.name;
		let value  = target.checked != undefined ? String(target.checked).title() : target.value;

		if(name.includes('[]'))
			name = name.replace('[]','');

		if(value){
			this.url.searchParams.set(name,value);
		}
		else{
			this.url.searchParams.delete(name);
		}

		POST(`${this.url.href}`);

		if(e)
			e.stopPropagation();

		return false;
	}

	showFilters(event){
		var form = Dom.query('#filters');
		if(form.style.display == 'grid'){
			form.hide();
		}else{
			form.grid();
		}
		event.stopPropagation();
	}

	delete(e){
		let checkboxes = Dom.query('input[type=checkbox]');
		if(checkboxes.length){
			let data = [];
			for(let i=0;i<checkboxes.length;i++){
				if(checkboxes[i].checked && checkboxes[i].value*1){
					data.push(checkboxes[i].value);
				}
			}
			if(!data.length)
				return;
			else if(confirm('Are U sure?')){
				let context = {};
				context.View = function(response){
					if(response.json.result){
						for(i=0;i<checkboxes.length;i++){
							checkboxes[i].checked = false;
						}
						location.reload();
					}
				};
				context.data = data;
				DELETE(`/${this.Model}`,context);
			}
		}
	}
}

export class ReloadList extends BaseList{
	static block = '#items';
	static limit = parseInt(window.screen.availHeight / 1.80 / 49);

	constructor(context){
		super(context);
	}
}