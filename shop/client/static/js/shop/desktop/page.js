import { User } from './user/user.js';
import { Dom } from "/static/js/vanilla-js/ui/dom.js";
import { Cart } from './cart.js';
import { GET, POST } from "/static/js/vanilla-js/http/navigation.js";

export class Page{
    constructor(){
        this.searchQuery = '';
        this.progress = false;
        this.timeout = false;
        this.user = new User();
        this.cartQty = Dom.query('.cart .items_qty');

        try{
            JSON.parse(storage.cart);
        }catch(e){
            this.clearCart();
        }

        if(!storage.qty || storage.qty == 'NaN')
            storage.qty = Object.keys(cart).length;

        this.cartQty.text(storage.qty);

        if(storage.qty && storage.qty != 0)
            Dom.query('#panel .cart').show();

        this.cart = JSON.parse(storage.cart);

        Dom.query("#scroll-up").on('click',function(){
            scrollTop();
        });

        Dom.query('main .noselect').on('contextmenu',function(){
            return false;
        });

        Dom.query('#navigation_toggle').on('click',this.openCategories.bind(this));

        Dom.query('#search input[type=text]').on('input paste keypress',this.search.bind(this));
        Dom.query('#search #query').on('focus click',this.searchfocus.bind(this));
        Dom.query('#autocomplete').on('scroll click',function(event){event.stopPropagation();});

        Dom.query('#bg').on('click',this.hideBg.bind(this));

        Dom.query('.cart').on('click',this.openCart.bind(this));

        if(location.pathname == '/' || location.pathname == '/ua/')
            Dom.query('.navigation').active();

        var href = new URL(location.href);
        if(href.searchParams)
            var q = href.searchParams.get('q');
        else{
            var query = getQueryParams(location.search);
            var q = query.q;
        }

        Dom.query('body').on('click',function(){
            if(Dom.query('#autocomplete').css('display') == 'block'){
                Dom.query('#autocomplete').hide();
            }
        });

        addEventListener('scroll',function () {
            if(window.scrollY > 150){
                Dom.query("#scroll-up").show();
            }else{
                Dom.query("#scroll-up").hide();
            }
        });

        this.addCart = Dom.query('#add-cart');
        this.addCartText = Dom.query('#add-cart span.name');
        this.favoriteButton = Dom.query('header .profile.favorite');
        this.compareButton = Dom.query('header .profile.compare');

        if(!storage.compare)
            storage.compare = '[]';

        this.compare = JSON.parse(storage.compare);

        try{
            Dom.query('header .fa-balance-scale')[0].prev().text(this.compare.length);
        }catch(e){

        }

        if(!storage.favorite)
            storage.favorite = '[]';

        this.favorite = JSON.parse(storage.favorite);

        try{
            Dom.query('header .fa-star')[0].prev().text(this.favorite.length);
        }catch(e){

        }

        if(this.favorite && this.favorite.length){
            this.favoriteButton.show();
        }
        if(this.compare && this.compare.length){
            this.compareButton.show();
        }
    }
    openCategories(){
        Navigation.toggle();

        if(this.navigtation && !this.navigation.active)
            this.navigation = new Navigation();
    }
    clearCart(){
        storage.cart = "{}";
        storage.qty = 0;
        this.cartQty.text('0');
    }
    hideBg(event){
        const target = event.target;

        target.hide();
        Dom.query('#form').hide();
    }
    hideMessage(){
        if(this.addCart.hasClass('active'))
            this.addCart.active();

        if(this.messageTimeout)
            clearTimeout(this.messageTimeout)
    }
    message(text){
        this.addCartText.text(text);

        if(!this.addCart.hasClass('active')){
            this.addCart.active();

            if(this.messageTimeout)
                clearTimeout(this.messageTimeout);
            this.messageTimeout = setTimeout(() => {
                this.addCart.active();
            },7000);
        }
    }
    renderForm(){
        Dom.query('#form').html(http.response);
        Dom.query('#form').show();
        Dom.query('#form').css('top',window.scrollY + 50 + 'px');
        Dom.query('#bg').show();
        Dom.query('#form .close').on('click',function(){
            Dom.query('#form').hide();
            Dom.query('#bg').hide();
            Dom.query('#form').css('top','unset');
        });
    }
    openCart(){
        POST(language +'/cart/',{
            success: (response) => {
                this.renderForm();
                this.cartObject = new Cart();
                this.hideMessage();
            },
            data: JSON.parse(storage.cart)
        });
    }
    autocomplete(query){
        if(query != this.searchQuery){
            this.searchQuery = query;

            let href = `${language}/search?q=${this.searchQuery}&autocomplete=1`;
            GET(href,{
                success: () => {
                    Dom.query('#autocomplete').html(http.responseText);
                    Dom.query('#autocomplete').show();
                }
            });
        }

        return false;
    }

    searchfocus(event){
        if(this.searchQuery && this.searchQuery.length > 2){
            if(Dom.query('#autocomplete').children.length == 0){
                let href = `/search?q=${this.searchQuery}&autocomplete=1`;
                GET(href, {
                    success: Dom.query('#autocomplete').html(http.responseText)
                });
            }
            Dom.query('#autocomplete').show();
        }

        event.stopPropagation();
        return false;
    }
    search(event){
        if(this.timeout)
            clearTimeout(this.timeout);

        this.timeout = setTimeout(() => {
            let query = Dom.query('#search input[type=text]')[0].value;
            if(query.length > 2){
                this.autocomplete(query);
            }
        },500)
    }
}

export class Default{
    constructor(){
        
    }
}