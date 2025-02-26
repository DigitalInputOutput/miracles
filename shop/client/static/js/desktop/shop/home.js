export class Home extends Buy{
    constructor(){
        super();
        pageObject.navigation = new Navigation();
    }
}
export class Main extends Home{
    constructor(){
        super();
    }
}