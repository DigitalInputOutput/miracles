(function(){
	/**
	 * HTMLElement Prototype Extensions
	*/

	Object.assign(HTMLElement.prototype, {
        css(attr, value){
            if(value)
                this.style[attr] = value;
            else{
                return this.style[attr];
            }
        },
    });
})();