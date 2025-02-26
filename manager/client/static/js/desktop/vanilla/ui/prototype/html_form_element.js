(function(){
	/**
	 * HTMLFormElement Prototype Extensions
	*/

	Object.assign(HTMLFormElement.prototype, {
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
    });
})();