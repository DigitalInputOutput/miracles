export class Gallery{
    constructor(gallery){
        this.gallery = gallery;

        Dom.query('#bg').on('click',this.close.bind(this));
        Dom.query('#big-photo, .gallery a').on('click',this.open.bind(this));
    }
    open(event){
        this.current = event.target.get('data-image');
        this.counter = this.gallery.indexOf(this.current);
        var template = getTemplate(Dom.query('#galleryTemplate'));

        Dom.query('body').append(template);
        this.container = Dom.query('#gallery');
        this.containerImage = Dom.query('#gallery img');

        this.container.find('.close').on('click',this.close.bind(this));

        for(var src of gallery){
            var img = create('img');
            img.src = src;
            this.container.append(img);
        }

        Dom.query('#bg').show();
        setTimeout(function(){
            Dom.query('#gallery .close').addClass('show');
            Dom.query('#gallery').addClass('show');
        },200);

        event.preventDefault();
        event.stopPropagation();
        return false;
    }
    close(){
        if(this.container){
            this.container.remove();
            Dom.query('#bg').hide();
        }
    }
}