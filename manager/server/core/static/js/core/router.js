export class Router{
	constructor(){
		this.filters = null;
		window.onpopstate = this.history.bind(this);
		this.search();
	}
	search(){
		var that = this;
		Dom.query('#search-text').on('input paste keypress',function(event){
			var input = this;
			if(timeout)
				clearTimeout(timeout);
			timeout = setTimeout(function(){
				if(input.value && input.value.length >= 3){
					var url = '/search/'+input.get('model')+'?value=' + input.value;
					that.get(url,'reload','#items');
				}else if(!input.value){
					var url = '/' + input.get('model') + '/list';
					if(storage.limit)
						url += '?limit='+storage.limit;
					that.get(url,'reload','#items');
				}
			},500);
		});
	}
	load(url,viewName,data,block,id){
		var url = new URL(location.origin + url);
		if(block)
			url.searchParams.set('block',block);

		if(storage.limit)
			url.searchParams.set('limit',storage.limit);
		else{
			url.searchParams.set('limit',9);
		}

		var that = this;

		http.action = function(){
			if(block){
				Dom.query(block).html(http.response);
			}else{
				Dom.query('main').html(http.response);
			}
			Dom.query('main .load').on('click',function(event){
				router.get(this.get('href'),this.get('view'),false,this.get('item-id'));
				event.preventDefault();
				event.stopPropagation();
				return false;
			});

			if(!block){
				Dom.query('#toggle-panel').on('click',function(){
					if(!storage.activePanel)
						storage.activePanel = 1;
					else{
						storage.activePanel = '';
					}
					Dom.query('#panel-wrapper').active();
					Dom.query('#panel-shortcuts').active();
					this.active();
				});
				if(storage.activePanel && !Array.isArray(Dom.query('#toggle-panel'))){
					Dom.query('#panel-wrapper').active();
					Dom.query('#toggle-panel').active();
					Dom.query('#panel-shortcuts').active();
				}
				that.search();
			}
			if(viewName){
				if(view)
					view = undefined;
				view = eval(viewName.title());
				if(id)
					view = new view(id);
				else{
					view = new view();
				}
			}
			return false;
		};

		var href = url.pathname + url.search;
		var state = {'href':href,'view':viewName,'block':block};
		if(id)
			state.id = id;

		if(data){
			if(data instanceof FormData){
				state.data = {};
				for(item of data.entries()){
					state.data[item[0]] = item[1];
				}
				http.post(href,data);
			}else if(data && data instanceof Object){
				http.post(href,data);
				state.data = data;
			}
		}else{
			http.get(href);
		}

		history.pushState(state,'Title',state.href);
	}
	get(link,view,block,id){
		this.load(link,view,0,block,id);
	}
	post(link,view,data,block){
		this.load(link,view,data,block);
	}
	history(event){
		if(event.state){
			var state = event.state;
			state.href = router.checkState(state);

			if(state.view && state.view == 'reload' && !Dom.query(state.block).length)
				state.view = 'list';

			var that = this;

			http.action = function(){
				if(state.block && Dom.query(state.block).length)
					Dom.query(state.block).html(http.response);
				else{
					Dom.query('main').html(http.response);
				}
				if(state.view){
					if(view)
						view = undefined;
					view = eval(state.view.title());
					if(state.id)
						view = new view(state.id);
					else{
						view = new view();
					}
				}
				Dom.query('#toggle-panel').on('click',function(){
					if(!storage.activePanel)
						storage.activePanel = 1;
					else{
						storage.activePanel = '';
					}
					Dom.query('#panel-wrapper').active();
					Dom.query('#panel-shortcuts').active();
					this.active();
				});
				if(storage.activePanel && !Array.isArray(Dom.query('#toggle-panel'))){
					Dom.query('#panel-wrapper').active();
					Dom.query('#toggle-panel').active();
					Dom.query('#panel-shortcuts').active();
				}
				that.search();
				if(state.view == 'edit'){
					autocomplete(window.jQuery);
				}
				Dom.query('.load').on('click',function(event){
					router.get(this.get('href'),this.get('view'),false,this.get('item-id'));
					event.preventDefault();
					event.stopPropagation();
					return false;
				});
				if(view.url){
					for(key of view.url.searchParams.entries()){
						if(Dom.query(`#filters #${key[0]}`).length)
							Dom.query(`#filters #${key[0]}`)[0].value = key[1];
					}
				}
			};
			if(state.data && state.data instanceof Object)
				http.post(state.href,state.data);
			else{
				http.get(state.href);
			}
		}
	}
	checkState(state){
		var url = new URL(location.origin + state.href);
		if(state.block && !Dom.query(state.block).length){
			url.searchParams.delete('block');
		}

		return url.pathname + url.search;
	}
}