export class Signin{
    constructor(){
        Dom.query('#signin').on('submit',this.login.bind(this));
        Dom.query('#forget').on('click',this.forget_password.bind(this));
        Dom.query('#sign-up').on('click',this.signup);
    }
    login(){
        var that = this;
        http.action = function(){
            if(http.json && http.json.result)
                location.reload();
            else if(http.json){
                social();
            }
        };
        http.post(language + '/user/signin/',Dom.query('#signin').serializeJSON());
    }
    forget_password(){
        Dom.query('#forget-password-form').show();
        Dom.query('#forget-password-form button').on('click',function(){
            http.action = function(){

            };
            http.post(language + '/user/forget-password/',Dom.query('#forget-password-form').serializeJSON());
        });
    }
    signup(){
        this.signup = new Signup();
    }
}