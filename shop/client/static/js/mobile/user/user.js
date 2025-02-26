export class User{
    constructor(){
        Dom.query('#sign-in, .sign-in, #login-button').on('click', this.signinForm.bind(this));

        Dom.query('#sign-out').on('click',this.logout.bind(this));

        var that = this;
    }
    signupForm(){
        this.signup = new Signup();
    }
    logout(){
        http.action = function(){
            if(window.http.json && window.http.json.result == 1)
                location.reload();
        };
        http.get(language + '/user/signout/');
    }
    signinForm(){
        var that = this;
        http.action = function(){
            if(http.json && http.json.result)
                location.reload();
            pageObject.renderForm();
            Dom.query('#signin').on('submit',that.login.bind(that));
            Dom.query('#forget').on('click',that.forget_password.bind(that));
            Dom.query('#sign-up').on('click',that.signupForm.bind(that));
        };
        http.get(language + '/user/signin/');
        return false;
    }
    login(){
        var that = this;
        http.action = function(){
            if(http.json && http.json.result)
                location.reload();
            else if(http.json){
                social();
            }
            else{
                pageObject.renderForm();
                Dom.query('#signin').on('submit',that.login.bind(that));
                Dom.query('#forget').on('click',that.forget_password.bind(that));
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
}