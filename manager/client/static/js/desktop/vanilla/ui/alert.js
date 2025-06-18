import { Dom } from './dom.js';

export class Alert {
	timeout;

    static init(){
        /* Add html container for messages */
		document.ready(() => {
			Dom.render('#http-loading-template', Dom.query('body'));
			Dom.render('#http-alert-template', Dom.query('body'));

			this.loading = Dom.query('#http-loading');
			this.container = Dom.query('#http-alert');
			this.textContainer = Dom.query('#http-alert-message');
	
			Dom.query('#http-alert .close').on('click',function(){
				this.container.hide();
			});
		});
    }

	static popMessage(text, scnds){
		this.textContainer.html(text);
		this.container.show();

		if(!scnds)
			scnds = 3000;

		Alert.timeout = setTimeout(() => {
			this.container.hide()
		},scnds);

		this.container.on('mouseover',() => {
			if(Alert.timeout)
				clearTimeout(Alert.timeout);
		});

		this.container.on('mouseout',() => {
			Alert.timeout = setTimeout(() => {
				Alert.container.hide()
			},3000);
		});
	}
}

Alert.init();