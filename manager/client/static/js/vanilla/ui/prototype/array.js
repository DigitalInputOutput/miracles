(function() {
    'use strict';
	/**
	 * Array Prototype Extensions
	*/

	Object.assign(Array.prototype, {
		switchClass(class1,class2){
			this.forEach((elem) => {
				if(elem.hasClass(class1)){
					elem.removeClass(class1);
					elem.addClass(class2);
				}else if(elem.hasClass(class2)){
					elem.removeClass(class2);
					elem.addClass(class1);
				}
			});
		},
		each(func){
			for(let i = 0; i < this.length; i++){
				func(this[i]);
			}
		},
		toggle(type){
			this.forEach((elem) => {
				if(elem.style.display == 'none' || elem.style.display == ''){
					if(type)
						elem.style.display = type;
					else{
						elem.style.display = 'block';
					}
				}else{
					elem.style.display = 'none';
				}
			});
		},
		next(){
			return this[0].nextElementSibling;
		},
		on(event,listener,selector){
			let events = event.split(' ');
			this.forEach((elem) => {
				for(event in events){
					elem.addEventListener(events[event],listener);
				}
			});
		},
		removeEvent(event,listener,selector){
			let events = event.split(' ');
			this.forEach((elem) => {
				for(event in events){
					elem.removeEventListener(events[event],listener);
				}
			});
		},
		after(html){
			this.forEach((elem) => {
				elem.innerHTML += html;
			});
		},
		toggleClass(name){
			this.forEach((elem) => {
				if(elem.hasClass(name))
					elem.removeClass(name);
				else{
					elem.addClass(name);
				}
			});
		},
		show(type){
			if(type)
				this.forEach((elem) => {
					elem.style.display = type;
				});
			else{
				this.forEach((elem) => {
					elem.style.display = 'block';
				});
			}
		},
		hide(){
			this.forEach((elem) => {
				elem.style.display = 'none';
			});
		},
		clear(){
			this.forEach((elem) => {
				while(elem.firstChild){
					elem.removeChild(elem.firstChild);
				}
			});
		},
		append(child){
			this.forEach((elem) => {
				elem.append(child)
			});
		},
		active(){
			this.forEach((elem) => {
				if(elem.className.includes('active')){
					elem.removeClass('active');
				}else{
					elem.addClass('active');
				}
			});
		},
		addClass(name){
			this.forEach((elem) => {
				if(!elem.className.includes(name))
					elem.classList.add(name);
			});
		},
		removeClass(name){
			this.forEach((elem) => {
				if(elem.className.includes(name))
					elem.removeClass(name);
			});
		},
		before(child,before){
			this.forEach((elem) => {
				if(!before)
					before = elem.childNodes[0];
				else{
					before = elem.childNodes[before];
				}
				elem.insertBefore(child,before)
			});
		},
		hasClass(name){
			if(this[0].className.includes(name))
				return true;
			else{
				return false
			}
		},
		html(html){
			if(html){
				this.forEach((elem) => {
					elem.innerHTML = html;
				});
			}else{
				return this[0].innerHTML;
			}
		},
		set(name,value){
			this.forEach((elem) => {
				elem.setAttribute(name,value);
			});
		},
		css(attr,value){
			this.forEach((elem) => {
				if(value)
					elem.style[attr] = value;
			});
		},
		text(text){
			if(text){
				try{
					this[0].firstChild.nodeValue = text;
				}catch(e){
					let t = document.createTextNode(text);
					this.append(t);
				}
			}
			else{
				try{
					return this[0].firstChild.nodeValue;
				}catch(e){
					return undefined;
				}
			}
		},
		width(){
			return this[0].clientWidth;
		},
		height(){
			return this[0].clientHeight;
		},

		ready(func){
			this.forEach((elem) => {
				elem.onload = func;
			});
		},

		remove(val) {
			this.splice(this.indexOf(val),1);
		},
		removeFromDom(){
			this.forEach((elem) => {
				elem.remove();
			});
		},
		last(){
			return this[this.length - 1];
		},
	});
})();