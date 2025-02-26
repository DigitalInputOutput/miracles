export class Compare{
    constructor(){
        document.ready(this.ready.bind(this));
        this.compare = JSON.parse(storage.compare);
    }
    ready(){
        if(!Dom.query('#content .item').length){
            http.action = () => {
                Dom.query('#content').html(http.response);
            };
            http.post(`${language}/user/compare/`,{'compare':this.compare});
        }
    }
}