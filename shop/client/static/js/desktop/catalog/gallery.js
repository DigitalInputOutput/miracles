export class Gallery{
    constructor(gallery){
        this.current = NaN;
        this.src = NaN;
        this.gallery = gallery;

        Dom.query('#bg').on('click',this.close.bind(this));
        Dom.query('#big-photo,.photos a').on('click',this.open.bind(this));
    }
    open(event){
        this.current = event.target.get('data-image');
        this.counter = this.gallery.indexOf(this.current);
        var template = getTemplate(Dom.query('#galleryTemplate'));

        Dom.query('body').append(template);
        this.container = Dom.query('#gallery');
        this.containerImage = Dom.query('#gallery img');

        this.container.css('display','flex');
        this.containerImage.set('src',this.current);

        this.container.find('.left').on('click',this.prev.bind(this));
        this.container.on('click',this.next.bind(this));
        this.container.find('.close').on('click',this.close.bind(this));

        Dom.query('#bg').show();

        event.preventDefault();
        event.stopPropagation();
        return false;
    }
    prev(event){
        if(this.counter - 1 < 0)
            this.counter = this.gallery.length - 1;
        else{
            this.counter--;
        }
        this.src = this.gallery[this.counter];
        this.containerImage.set('src',this.src);
        event.stopPropagation();
        event.preventDefault();
        return false;
    }
    next(){
        if(this.counter + 1 == this.gallery.length)
            this.counter = 0;
        else{
            this.counter++;
        }
        this.src = this.gallery[this.counter];
        this.containerImage.set('src',this.src);
    }
    close(){
        if(this.container){
            this.container.remove();
            Dom.query('#bg').hide();
        }
    }
}