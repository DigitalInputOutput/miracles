export class View {
    static render(templateId, context) {
        const template = document.getElementById(templateId).innerHTML;
        const compiledTemplate = template.replace(/\{\{(.*?)\}\}/g, (match, p1) => context[p1.trim()]);
        document.body.innerHTML = compiledTemplate;
    }

    static renderErrors(errors) {
        let errorText = '';
        for (let error in errors) {
            errorText += `${error}: ${JSON.stringify(errors[error])} <br>`;
        }
        this.alert(errorText, 10000);
    }

    static alert(text, duration = 3000) {
        const alertBox = document.querySelector('#alert');
        alertBox.innerHTML = text;
        alertBox.style.display = 'block';
        setTimeout(() => {
            alertBox.style.display = 'none';
        }, duration);
    }
}