import { Dom } from "/static/js/vanilla/ui/dom.js";
import { GET } from "/static/js/vanilla/http/navigation.js";

export class Navigation{
    constructor(){
        Dom.query('.navigation .name').on('click',this.menu.bind(this));

        Dom.query('.navigation .back').on('click',this.back.bind(this));

        this.container = Dom.query('.navigation #categories');
    }
    static scroll(){
        window.scrollTo({top:Dom.query('.navigation .head')[0].offsetTop - 58,behavior: 'smooth'});
    }
    static toggle(){
        if(Dom.query('.navigation .head').length){
            Dom.query('.navigation').active();
        }else{
            Dom.query('main > .container > .loading').active();
            GET('/categories',{
                success: (response) => {
                    Dom.query('#categories-container').html(response.html);
                    Dom.query('.navigation').active();
                    Dom.query('main .container > .loading').active();
                    this.active = true;
                    Navigation.scroll();
                    pageObject.navigation = new Navigation();
                }
            });
        }
    }
    back(event){
        const target = event.target;

        if(!target.hasClass('back')){
            target.parent().click();
            return false;
        }

        const parent = target.parent().parent();
        const children = target.parent().next();
        const root = parent.parent().parent();

        target.active();
        parent.active();
        children.active();

        if(root.hasClass('root'))
            root.removeClass('root');

        if(parent.parent().id == 'categories')
            this.container.active();

        event.preventDefault();
    }
    menu(event){
        const target = event.target;

        if(!target.hasClass('name')){
            target.parent().click();
            return false;
        }

        const parent = target.parent().parent();
        const children = parent.find('.children');

        if(children.length){
            children[0].active();
            parent.find('.navigate .back')[0].active();
        }
        else{
            parent.find('.name a')[0].click();
            return;
        }

        if(parent.parent().hasClass('children'))
            parent.parent().parent().addClass('root');

        parent.active();

        if(parent.parent().id == 'categories')
            this.container.active();

        event.preventDefault();
    }
}