(function(){
	/**
	 * Element Prototype Extensions
	*/

	Object.assign(Element.prototype, {
		closer(selector){
			let result = undefined;
			let parent = this.parent();

			if(parent.localName == selector)
				return parent;

			while(!result){
				result = parent.find(selector);
				if(!result || (Array.isArray(result) && !result.length))
					result = undefined;
				else if(Array.isArray(result) && result.length){
					return result[0];
				}

				parent = parent.parent();

				if(!parent)
					return undefined;
			}

			return result;
		},
		styles(property){
			return window.getComputedStyle(Dom.query('#menu'))[property];
		},
		includes(target){
			if(this.children.toArray().includes(target))
				return true;
			else{
				return false;
			}
		},
		grid(){
			this.style.display = 'grid';
		},
		next(){
			return this.nextElementSibling;
		},
		prev(){
			return this.previousElementSibling;
		},
		last(){
			return this.lastElementChild;
		},
		active(){
			if(this.className.includes('active')){
				this.removeClass('active');
			}else{
				this.addClass('active');
			}
		},
		toggleMenu(parameters){
			let item = this;
			setTimeout(() => {
				item.active();
				if(parameters.parent){
					if(parameters.parent.activeItem == item){
						parameters.parent.activeItem = undefined;
						return;
					}
					if(parameters.closeAll && parameters.parent.activeItem)
						parameters.parent.activeItem.active();
					parameters.parent.activeItem = item;
				}
			},parameters.timeout ? parameters.timeout : 0);
		},
		parent(){
			return this.parentElement;
		},
		find(selector){
			try{
				if(selector.includes('#') && (!selector.includes(' ') || selector.includes(','))){
					return this.querySelector(selector);
				}else{
					return Array.prototype.slice.call(this.querySelectorAll(selector));
				}
			}catch(e){
				console.log(e);
			}
		},
		replace(newChild, oldChild){
			if(typeof newChild == 'string'){
				oldChild.remove();
				this.append(newChild);
			}else{
				this.replaceChild(newChild,oldChild);
			}
		},
		append(child){
			if(typeof child == 'string')
				return this.insertAdjacentHTML('beforeend', child);
			else if(child){
				return this.appendChild(child);
			}
		},
		before(child, before){
			if(child){
				if(!before)
					before = this.childNodes[0];

				this.insertBefore(child,before);
			}
		},
		getBefore(){
			return window.getComputedStyle(this, ':before');
		},
		clear(){
			while(this.firstChild){
				this.removeChild(this.firstChild);
			}
		},
		each(func){
			for(let i=0; i < this.children.length; i++){
				func(this.children[i]);
			}
		},
		attr(name){
			return this.getAttribute(name);
		},
		get(name){
			return this.getAttribute(name);
		},
		set(name,value){
			return this.setAttribute(name,value);
		},
		removeAttr(name){
			return this.removeAttribute(name);
		},
		html(html){
			if(html)
				this.innerHTML = html;
			else{
				return this.innerHTML;
			}
		},
		after(html){
			this.innerHTML += html;
		},
		afterOf(newElem,node){
			this.insertBefore(newElem,node);
		},
		first(){
			return this.firstElementChild;
		},
		show(type){
			if(type)
				this.style.display = type;
			else{
				this.style.display = 'block';
			}
		},
		hide(){
			this.style.display = 'none';
		},
		toggle(type){
			if(this.style.display == 'none' || this.style.display == ''){
				if(type)
					this.style.display = type;
				else{
					this.style.display = 'block';
				}
			}else{
				this.style.display = 'none';
			}
		},
		addClass(name){
			if(!this.className.includes(name))
				this.classList.add(name);
		},
		removeClass(name){
			this.classList.remove(name);
		},
		hasClass(name){
			if(this.className.includes(name))
				return true;
			else{
				return false
			}
		},
		toggleClass(name){
			if(this.hasClass(name))
				this.removeClass(name);
			else{
				this.addClass(name);
			}
		},
		on(events,listener){
			events = events.split(' ');
			for(let e in events){
				this.addEventListener(events[e],listener);
			}
		},
		removeEvent(events,listener){
			events = events.split(' ');
			for(let e in events){
				this.removeEventListener(events[e],listener);
			}
		},
		switchClass(class1,class2){
			if(this.hasClass(class1)){
				this.removeClass(class1);
				this.addClass(class2);
			}else if(this.hasClass(class2)){
				this.removeClass(class2);
				this.addClass(class1);
			}
		},

		height(){
			return this.clientHeight;
		},
		text(text){
			if(text){
				try{
					this.firstChild.nodeValue = text;
				}catch(e){
					let t = document.createTextNode(text);
					this.append(t);
				}
			}
			else{
				return this.innerText;
			}
		},
		width(){
			return this.clientWidth;
		},
		top(value){
			this.style['top'] = value;
		},
		enable(){
			this.removeAttr('disabled');
		},
		disable(){
			this.set('disabled','');
		},
		triggerError(message){
			this.addClass('invalid');
			let errorBlock = this.next();
			if(!errorBlock.hasClass('errors')){
				errorBlock = Dom.query(`.${this.name}.errors`)[0];
			}
			if(errorBlock){
				errorBlock.html(message);
				errorBlock.show();
			}
			if(this.form)
				this.form.triggerInvalid();
		},
		removeError(){
			this.removeClass('invalid');
			let errorBlock = this.next();
			if(!errorBlock.hasClass('errors')){
				errorBlock = Dom.query(`.${this.name}.errors`)[0];
			}
			if(errorBlock)
				errorBlock.hide();
		},
		triggerInvalid(){
			this.addClass('invalid');
			if(this.validateSubmit){
				this.validateSubmit.addClass('disabled');
				this.validateSubmit.set('disabled','disabled');
			}
		},
		triggerValid(){
			this.removeClass('invalid');
			if(this.validateSubmit){
				this.validateSubmit.removeClass('disabled');
				this.validateSubmit.removeAttr('disabled');
			}
		},
		validate(rules){
			validator = new Validator(this,rules);
		},
		ready(func){
			this.onload = func;
		},
		serializeJSON(){
			let data = {};
			for(let i of ['input','select','textarea']){
				for(let elem of this.find(i)){
					switch(elem.type){
						case 'text':
						case 'hidden':
						case 'password':
						case 'button':
						case 'reset':
						case 'submit':
						case 'number':
						case 'date':
							if(elem.value)
								data[elem.name] = elem.value;
							break;
						case 'checkbox':
						case 'radio':
							if (elem.checked) 
								data[elem.name] = elem.value;
							break;
						case 'select-one':
							if(elem.value)
								data[elem.name] = eval(elem.value);
							break;
						case 'select-multiple':
							data[elem.name] = [];
							for (var j = elem.options.length - 1; j >= 0; j = j - 1){
								if (elem.options[j].selected)
									data[elem.name].append(elem.options[j].value);
							}
							break;
					}
				}
			}

			return data;
		},

		isDescendant(parent){
			let node = this.parent();
			while (node != null) {
				if (node == parent) {
					return true;
				}
				node = node.parent();
			}
			return false;
		},
	});
})();