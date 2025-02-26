function theme(color){
	storage.theme = color;
	Dom.query('header').set('class',color);
}
/*if(window.model){
	current = Dom.query(`menu a[model="${model}"]`)[0];
	current.active();
	current.parent().active();
	current.parent().parent().active();
}*/

if(!storage.theme)
	storage.theme = 'black';

if(storage.activeMenu){
	Dom.query('menu').active();
	Dom.query('#right').toggleClass('full');
}
if(storage.activePanel && !Array.isArray(Dom.query('#toggle-panel'))){
	Dom.query('#panel-wrapper').active();
	Dom.query('#toggle-panel').active();
	Dom.query('#panel-shortcuts').active();
}

Dom.query('header').set('class',storage.theme);

Dom.query('#theme .color').on('click',function(event){
	theme(this.get('color'));
});

Dom.query('#shop').on('click',function(){
	location.href = this.href;
});

Dom.query('#signout').on('click',function(){
	location.href = this.href;
});

Dom.query('body').on('click',function(){
	var filters = Dom.query('#filters');
	if(filters.style && filters.style.display == 'grid'){
		filters.hide();
	}
	/*if(window.panel && panel.className.includes('active')){
		panel.active();
		panel_buttons.active();
	}*/
});

jQuery(document).ready(function(){
	try{
		for(key of view.url.searchParams.entries()){
			if(Dom.query(`#filters #${key[0]}`).length)
				Dom.query(`#filters #${key[0]}`)[0].value = key[1];
		}
	}catch(e){}
});


timeout = false;

function changeDatabase(database,url){
	http.action = function(){
		storage.database = JSON.stringify({'database':database,'url':url});
		location.reload(true);
	};
	http.get('/change_database?database='+database);
}

Dom.query('.change-database select').on('change select',function(){
	changeDatabase(this.get('database'),this.get('url'));
});

Dom.query('.change-database.logo #active').on('click',function(){
	Dom.query('.change-database.logo #sites').toggleClass('active');
});
Dom.query('.change-database.logo .database').on('click',function(){
	Dom.query('.change-database.logo #active').html(this.html());
	Dom.query('.change-database.logo #sites').toggleClass('active');
	var target = this;
	setTimeout(function(){
		changeDatabase(target.get('database'),target.get('url'));
	},500);
});

Dom.query('.burger').on('click',function(){
	if(!storage.activeMenu)
		storage.activeMenu = 1;
	else{
		storage.activeMenu = '';
	}
	Dom.query('menu').active();
	Dom.query('#right').toggleClass('full');
});

Dom.query('#search i').on('click',function(){
	setTimeout(function(){
		Dom.query('#search i').active();
		Dom.query('#search-text').active();
	},300);
});

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