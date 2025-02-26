export class Page{
    constructor(){
        this.navigation = null;
        this.searchQuery = '';
        this.progress = false;
        this.timeout = false;
        this.user = new User();
        this.cartQty = Dom.query('.cart .items_qty');
        this.menuBlock = Dom.query('#menu');
        this.mainBlock = Dom.query('#main');
        this.searchWidget = Dom.query('#search');
        this.navContainer = Dom.query('#navigation .head')[0];
        this.scrollUpButton = Dom.query("#scroll-up");

        this.addCart = Dom.query('#add-cart');
        this.addCartText = Dom.query('#add-cart span.name')[0];
        this.favoriteButton = Dom.query('header .profile.favorite');
        this.compareButton = Dom.query('header .profile.compare');

        Dom.query('.call-back').on('click', this.callback.bind(this));

        Dom.query('.categories-button').on('click',this.openCategories.bind(this));

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

        Dom.query('#searchButton').on('click',this.searchButton.bind(this));

        Dom.query("#scroll-up").on('click',function(){
            scrollTop();
        });

        Dom.query('main .noselect').on('contextmenu',function(){
            return false;
        });

        Dom.query('#phonesButton').on('click',this.phones);

        Dom.query('#search input[type=text]').on('input paste keypress',this.search.bind(this));
        Dom.query('#search #query').on('focus click',this.searchfocus.bind(this));
        Dom.query('.autocomplete').on('scroll click',function(event){event.stopPropagation();});

        Dom.query('#bg').on('click',this.hideBg.bind(this));

        Dom.query('.cart').on('click',this.openCart.bind(this));

        var href = new URL(location.href);
        if(href.searchParams)
            var q = href.searchParams.get('q');
        else{
            var query = getQueryParams(location.search);
            var q = query.q;
        }

        Dom.query('body').on('click',(e) => {
            if(Dom.query('.autocomplete').css('display') == 'block'){
                Dom.query('.autocomplete').hide();
            }
            this.menuBlock.removeClass('active');
            this.mainBlock.removeClass('active');
        });

        this.menuBlock.on('click',(e) =>{
            e.stopPropagation();
            return false;
        });

        addEventListener('scroll',this.scroll.bind(this));

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
    scroll(e){
        if(window.scrollY > 150){
            this.scrollUpButton.show();
        }else{
            this.scrollUpButton.hide();
        }
    }
    callback(){
        var that = this;
        http.action = function(){
            that.renderForm();
            that.callback = new Callback();
        };
        http.get(`${language}/checkout/callback/`);
    }
    openCategories(e){
        var main_container = Dom.query('main .navigation')[0];
        var container = Dom.query('#menu .navigation')[0];

        if(!this.navigation){
            if(main_container){
                container.html(main_container.html());
                this.navigation = new Navigation(container);
            }
            else{
                var that = this;
                http.action = function(){
                    container.html(http.response);
                    that.navigation = new Navigation(container);
                };
                http.get(language + '/categories');
            }
        }

        this.menuBlock.active();
        this.mainBlock.active();

        Dom.query('#navigation .back').removeClass('active');

        e.stopPropagation();
        return false;
    }
    searchButton(){
        this.searchWidget.active();
    }
    phones(){
        Dom.query('header .phones').active();
    }
    clearCart(){
        storage.cart = "{}";
        storage.qty = 0;
        this.cartQty.text('0');
        this.cart = {};
    }
    hideBg(event){
        var target = event.target;
        target.hide();
        Dom.query('#form').removeClass('show');
    }
    hideMessage(){
        if(this.addCart.hasClass('active'))
            this.addCart.active();
        if(this.messageTimeout)
            clearTimeout(this.messageTimeout)
    }
    message(text){
        if(this.addCart && this.addCartText){
            this.addCartText.text(text);
            if(!this.addCart.hasClass('active')){
                this.addCart.active();

                var that = this;
                if(this.messageTimeout)
                    clearTimeout(this.messageTimeout);
                this.messageTimeout = setTimeout(function(){
                    that.addCart.active();
                },7000);
            }
        }
    }
    renderForm(){
        Dom.query('#form').html(http.response);
        Dom.query('#form').addClass('show');
        Dom.query('#form .close').addClass('show');
        Dom.query('#bg').show();
        Dom.query('#form .close').on('click',function(){
            Dom.query('#form').removeClass('show');
            Dom.query('#bg').hide();
            this.removeClass('show');
        });
    }
    openCart(){
        var that = this;
        http.action = function(){
            that.renderForm();
            that.cartObject = new Cart();
            that.hideMessage();
        };
        var data = JSON.parse(storage.cart);
        data['csrfmiddlewaretoken'] = csrf_token;
        http.post(language +'/cart/',data);
    }
    autocomplete(query){
        if(query != this.searchQuery){
            this.searchQuery = query;
            http.action = function(){
                Dom.query('.autocomplete').html(http.responseText);
                Dom.query('.autocomplete').show();
            };
            http.get(`${language}/search?q=${this.searchQuery}&autocomplete=1`);
        }
        return false;
    }

    searchfocus(event){
        var that = this;
        if(this.searchQuery && this.searchQuery.length > 2){
            if(Dom.query('#search .autocomplete').length && Dom.query('#search .autocomplete')[0].children.length == 0){
                http.action = function(){
                    Dom.query('#search .autocomplete').html(http.responseText);
                };
                http.get(`/search?q=${this.searchQuery}&autocomplete=1`);
            }
            Dom.query('#search .autocomplete').show();
        }
        event.stopPropagation();
        return false;
    }
    search(event){
        var that = this;
        if(this.timeout)
            clearTimeout(this.timeout);
        this.timeout = setTimeout(function(){
            var query = Dom.query('#search input[type=text]')[0].value;
            if(query.length > 2){
                that.autocomplete(query);
            }
        },500)
    }
}

export class Default{
    constructor(){
        
    }
}