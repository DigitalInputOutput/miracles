var http = new XMLHttpRequest();
http.get = function(url,custom){
	this.method = 'GET';
	this.custom = custom;
	this.url = url;
	this.request();
};
http.post = function(url,data,custom){
	this.method = 'POST';
	this.custom = custom;
	this.url = url;
	this.data = data;
	this.request();
};
http.request = function(){
	if(this.progress)
		return;
	this.open(this.method,this.url);
	if(this.method == 'POST'){
		if(this.data instanceof FormData){
			this.setRequestHeader("X-CSRFToken", );
		}
		else if(typeof this.data == 'object'){
			this.data = JSON.stringify(this.data);
			this.setRequestHeader("X-CSRFToken", csrf_token);
			this.setRequestHeader("Content-Type", "application/json");
		}
		else{
			this.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		}
	}
	this.setRequestHeader('X-Requested-With','XMLHttpRequest');
	this.onreadystatechange = function(){
		switch(this.readyState){
			case 1: 
				Dom.query('#loading').show();
				break;
			case 4: 
				Dom.query('#loading').hide();
				if(this.status == 200){
					if(this.getResponseHeader('Content-Type') == 'application/json'){
						try{
							this.json = JSON.parse(this.responseText);
						}catch(e){
							console.log(e);
						}
					}
					if(this.custom === true){
						try{
							this.action();
						}catch(e){
							console.log(e);
						}
					}
					else{
						this.render_form();
					}
				}
				this.progress = false;
				break;
		}
	};
	this.progress = true;
	this.send(this.data);
};
http.render_form = function(){
	Dom.query('#bg').show();
	if(!window.mobile)
		Dom.query('#form').css('top', Dom.query(document).scrollTop()+25);
	Dom.query('#form').show();
	Dom.query('#form').html(this.responseText);
	Dom.query('#form').css('margin-left',Dom.query(window).width()/2 - Dom.query('#form').first().width()/2);
};
Alert.popMessage = function(title, text){
	if(!title && !text){
		title = 'Ой!';
		text = 'Что то пошло не так и кнопка не сработала. Попробуйте найти решение <a href="http://forum.igroteka.ua/ochistka-vremennyh-fajlov-v-obozrevatelebrauzere" alt="Форум Игротека">на форуме</a> или расскажите нам об этом по телефону.'
	}
	$.gritter.add({
		title: title,
		text: text,
		class_name: 'gritter-dark',
	});
};