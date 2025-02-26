export class DeliveryField{
    constructor(type,path,val,city){
        this.timeout = NaN;
        this.type = type;
        this.path = path;
        this.val = val;
        this.city = city;
        this.load();
    }
    load(){
        if(typeof this.city !== 'undefined')
            var url = `/checkout/${this.path}/${this.type}/${this.val}/${this.city}`;
        else{
            var url = `/checkout/${this.path}/${this.type}/${this.val}`;
        }

        var that = this;
        http.action = function(){
            that.render();

            Dom.query(`#id_${that.path}`).on('click',function(event){
                if(that.path == 'city' && view.delivery.departament.css('display') == 'block')
                    view.delivery.departament.hide();

                if(Dom.query(`#${that.path} .variants`)[0].children.length)
                    Dom.query(`#${that.path} .variants`).show();

                event.stopPropagation();
                return false;
            });

            Dom.query(`#${that.path} .variants .variant`).on('click',that.variants.bind(that));
        };
        http.get(url);
    }
    variants(event){
        var target = event.target;
        Dom.query(`#id_${this.path}`).value = target.text();
        Dom.query(`#${this.path} .variants`).hide();
        Dom.query(`input[name="${this.path}"]`)[0].value = target.get('value');

        if(this.path == 'departament')
            return;

        view.delivery.departament.clear();
        view.delivery.departament.append(getTemplate(Dom.query('#departamentTemplate')));
        view.delivery.departament.show();

        var url = `/checkout/departament/${Dom.query('#id_delivery_type').value}/${Dom.query('input[name="city"]')[0].value}`;

        this.reload(url);

        Dom.query('#id_departament').on('input paste keypress',this.input.bind(this));
    }
    input(){
        var that = this;
        if(this.timeout)
            clearTimeout(this.timeout);
        this.timeout = setTimeout(function(){
            var value = Dom.query('#id_departament').value;
            if(value && value.length > 1){
                that.departament = new DeliveryField(Dom.query('#id_delivery_type').value,'departament',Dom.query('#id_departament').value,Dom.query('input[name="city"]')[0].value);
            }
        },500);
    }
    render(){
        Dom.query(`#${this.path} .variants`).show();
        Dom.query(`#${this.path} .variants`).clear();
        Dom.query(`#${this.path} .variants`).html(this.template());
    }
    template(){
        var result = '';
        for(var item of http.json.items){
            result += `<div class="variant" value="${item.id}">${item.address}</div>`;
        }

        return result;
    }
    reload(url){
        var that = this;
        http.action = function(){
            Dom.query('#departament .variants').show();
            Dom.query('#departament .variants').clear();

            Dom.query('#departament .variants').html(that.template());

            Dom.query('#departament .variants .variant').on('click',function(){
                Dom.query('#id_departament').value = this.text();
                Dom.query('#departament .variants').hide();
                Dom.query('input[name="departament"]')[0].value = this.get('value');
            });
            Dom.query('#id_departament').on('click',function(event){
                if(Dom.query('#departament .variants')[0].children.length)
                    Dom.query('#departament .variants').show();
                event.stopPropagation();
                return false;
            });
        };
        http.get(url);
    }
}