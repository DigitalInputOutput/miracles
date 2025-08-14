import { Dom } from '/static/js/vanilla/ui/dom.js';

export class Form{
    constructor(){}

    render_errors(errors){
        Object.entries(errors).forEach(([name, messages]) => {
            let field = Dom.query(`form input[name="${name}"]`)[0];
            if (!field) {
                console.warn(`Field ${name} not found in the form.`);
                return;
            }

            // Add error class to input
            field.addClass('error shake');
            setTimeout(() => field.removeClass('shake'), 300); // Remove shake effect after animation
    
            let errorsBlock = field.parent()?.find('.errors')[0];
            if (errorsBlock) {
                errorsBlock.html(messages[0]); // Show first error
                errorsBlock.addClass('show'); // Make visible
                errorsBlock.show(); // Remove display: none
            } else {
                console.warn(`No error block found for field: ${name}`);
            }
        });
    }
}