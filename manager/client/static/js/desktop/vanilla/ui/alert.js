export class Alert {
    constructor(){
        /* Add html container for messages */
        $('body').append(render($('#http-loading-template')));
        $('body').append(render($('#http-alert-template')));

        this.loading = $('#http-loading');
        this.container = $('#http-alert');
        this.text = $('#http-alert-message');

        $('#http-alert .close').on('click',function(){
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