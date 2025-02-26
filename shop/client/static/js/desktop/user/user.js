export class User{
    constructor(){
        Dom.query('#sign-in, .sign-in').on('click', this.signinForm.bind(this));

        Dom.query('#sign-out').on('click',this.logout.bind(this));

        var that = this;
    }
    logout(){
        http.action = function(){
            if(window.http.json && window.http.json.result == 1)
                location.reload();
        };
        http.get('/user/signout/');
    }
    signinForm(){
        var that = this;
        http.action = function(){
            if(http.json && http.json.result)
                location.reload();
            pageObject.renderForm();
            Dom.query('#login-form').on('submit',that.login.bind(that));
            Dom.query('#forget').on('click',that.forget_password.bind(that));
        };
        http.get('/user/signin/');
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
                Dom.query('#login-form').on('submit',that.login.bind(that));
                Dom.query('#forget').on('click',that.forget_password.bind(that));
            }
        };
        http.post('/user/signin/',Dom.query('#login-form').serializeJSON());
    }
    forget_password(){
        Dom.query('#forget-password-form').show();
        Dom.query('#login-form').hide();
        Dom.query('#forget-password-form button').on('click',function(){
            http.action = function(){

            };
            http.post('/user/forget-password/',Dom.query('#forget-password-form').serializeJSON());
        });
    }
}