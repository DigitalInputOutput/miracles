import { Dom } from "/static/js/vanilla/ui/dom.js";
import { GET } from "/static/js/vanilla/http/navigation.js";

export class DeliveryField{
    constructor(type, path, val, city){
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

        GET(url,{
            success: (response) => {
                this.render(response);

                Dom.query(`#id_${this.path}`).on('click',(event) => {
                    if(this.path == 'city' && view.delivery.departament.css('display') == 'block')
                        view.delivery.departament.hide();

                    if(Dom.query(`#${this.path} .variants`)[0].children.length)
                        Dom.query(`#${this.path} .variants`).show();

                    event.stopPropagation();
                    return false;
                });

                Dom.query(`#${that.path} .variants .variant`).on('click', this.variants.bind(this));
            }
        });
    }
    variants(event){
        const target = event.target;
        Dom.query(`#id_${this.path}`).value = target.text();
        Dom.query(`#${this.path} .variants`).hide();
        Dom.query(`input[name="${this.path}"]`)[0].value = target.get('value');

        if(this.path == 'departament')
            return;

        view.delivery.departament.clear();
        view.delivery.departament.append(getTemplate(Dom.query('#departamentTemplate')));
        view.delivery.departament.show();

        let url = `/checkout/departament/${Dom.query('#id_delivery_type').value}/${Dom.query('input[name="city"]')[0].value}`;

        this.reload(url);

        Dom.query('#id_departament').on('input paste keypress',this.input.bind(this));
    }
    input(){
        if(this.timeout)
            clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            let value = Dom.query('#id_departament').value;
            if(value && value.length > 1){
                this.departament = new DeliveryField(Dom.query('#id_delivery_type').value,'departament',Dom.query('#id_departament').value,Dom.query('input[name="city"]')[0].value);
            }
        },500);
    }
    render(response){
        Dom.query(`#${this.path} .variants`).show();
        Dom.query(`#${this.path} .variants`).clear();
        Dom.query(`#${this.path} .variants`).html(this.template(response));
    }
    template(response){
        var result = '';
        for(let item of response.items){
            result += `<div class="variant" value="${item.id}">${item.address}</div>`;
        }

        return result;
    }
    reload(url){
        GET(url,{
            success: (response) => {
                Dom.query('#departament .variants').show();
                Dom.query('#departament .variants').clear();

                Dom.query('#departament .variants').html(this.template());

                Dom.query('#departament .variants .variant').on('click',(e) => {
                    Dom.query('#id_departament').value = e.target.text();
                    Dom.query('#departament .variants').hide();
                    Dom.query('input[name="departament"]')[0].value = this.get('value');
                });
                Dom.query('#id_departament').on('click',(e) => {
                    if(Dom.query('#departament .variants')[0].children.length)
                        Dom.query('#departament .variants').show();
                    e.stopPropagation();
                    return false;
                });
            }
        });
    }
}