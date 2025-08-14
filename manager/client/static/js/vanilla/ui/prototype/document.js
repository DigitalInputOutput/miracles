(function(){
	/**
	 * Document Extensions
	*/

	document.ready = function(listener){
		document.addEventListener('readystatechange',(e) =>{
			switch (e.target.readyState){
				case 'complete':
					listener();
					break;
			}
		});
	};
})();