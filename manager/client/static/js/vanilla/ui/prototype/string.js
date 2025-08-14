(function(){
	/**
	 * String Prototype Extensions
	*/

	Object.assign(String.prototype, {
        title() {
            return this.charAt(0).toUpperCase() + this.slice(1);
        },
        toSlug() {
            return this.toLowerCase()
                       .replace(/\s+/g, '-')
                       .replace(/[^a-z0-9-]/g, '')
                       .replace(/-+/g, '-');
        },
        reverse() {
            return [...this].reverse().join('');
        },
    });

})();