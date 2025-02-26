import { Dom } from '/static/js/desktop/vanilla/ui/dom.js';

export class Form{
    constructor(){

    }
    render_errors(errors){
        for(var name of Object.keys(errors)){
            try{
                let field = Dom.query(`form input[name="${name}"]`)[0];
                let errorsBlock = field.parent().find('.errors')[0];
                errorsBlock.html(errors[name][0]);
                errorsBlock.show();
            }catch(e){
                console.log(e);
            }
        }
    }
}