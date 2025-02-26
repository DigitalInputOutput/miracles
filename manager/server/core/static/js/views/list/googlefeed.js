export class GoogleFeedList extends List{
    constructor(){
        super();
        View.variants(Dom.query('#category'),'category',function(event){view.categoryAutocomplete(event.target)});
        View.variants(Dom.query('#brand'),'brand',function(event){view.brandAutocomplete(event.target)});
        Dom.query('#addProducts').on('click',this.addProducts.bind(this));
        Dom.query('#filters button').on('click',this.filter);
    }
    filter(){
        var filters = Dom.query('#filters').serializeJSON();
        for(key of view.url.searchParams.keys()){
            view.url.searchParams.delete(key);
        }
        for(var key of Object.keys(filters)){
            view.url.searchParams.set(key,filters[key]);
        }
        http.action = function(){
            Dom.query('#items').html(http.response);
        };
        view.url.searchParams.set('block','reload');
        view.url.searchParams.set('googlefeed__isnull','True');
        view.url.searchParams.set('all',true);
        http.get('/product/list' + view.url.search);
        Dom.query('#filters').hide();
    }
    addProducts(){
        http.action = function(){
            if(http.json && http.json.result)
                Alert.popMessage('Добавлено');
        };
        var items = [];
        for(var item of Dom.query('.item input:checked'))
            items.push(item.get('value'));
        http.post('/addGoogleProducts',{'items':items});
    }
    categoryAutocomplete(target){
        var category = Dom.query('#category');
        category.find('.variants')[0].hide();
        category.find('input')[0].value = target.text();
    }
    brandAutocomplete(target){
        var brand = Dom.query('#brand');
        brand.find('.variants')[0].hide();
        brand.find('input')[0].value = target.text();
    }
}