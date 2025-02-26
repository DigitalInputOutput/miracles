import { Dom } from './dom.js';

export class Alert {
    constructor(){
        /* Add html container for messages */
        Dom.query('body').append(Dom.render(Dom.query('#http-loading-template')));
        Dom.query('body').append(Dom.render(Dom.query('#http-alert-template')));

        this.loading = Dom.query('#http-loading');
        this.container = Dom.query('#http-alert');
        this.text = Dom.query('#http-alert-message');

        Dom.query('#http-alert .close').on('click',function(){
            this.container.hide();
        });
    }

	static popMessage(text,scnds){
		this.text.text(text);
		this.container.show();

		if(!scnds)
			scnds = 3000;

		timeout = setTimeout(() => {
			this.container.hide()
		},scnds);

		this.container.on('mouseover',() => {
			if(timeout)
				clearTimeout(timeout);
		});

		this.container.on('mouseout',() => {
			timeout = setTimeout(() => {
				Alert.container.hide()
			},3000);
		});
	}
}