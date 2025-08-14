export class Favorite{
    constructor(){
        document.ready(this.ready.bind(this));
    }
    ready(){
        http.action = function(){
            Dom.query('#content').html(http.response);
        };
        http.get(language + '/user/favorite/');
    }
}