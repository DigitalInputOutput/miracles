export class Favorite{
    constructor(){
        document.ready(this.ready.bind(this));
        this.favorite = JSON.parse(storage.favorite);
    }
    ready(){
        if(!Dom.query('#content .item').length){
            http.action = () => {
                Dom.query('#content').html(http.response);
            };
            http.post(`${language}/user/favorite/`,{'favorite':this.favorite});
        }
    }
}