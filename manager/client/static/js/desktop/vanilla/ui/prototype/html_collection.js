(function(){
	/**
	 * HTMLCollection Prototype Extensions
	*/
	Object.assign(HTMLCollection.prototype, {
        toArray(array = []){
            for(let item of this){
                array.push(item);

                if(item.children.length)
                    array = item.children.toArray(array);
            }

            return array;
        },
    });
})();