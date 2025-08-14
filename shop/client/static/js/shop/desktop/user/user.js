import { Dom } from "/static/js/vanilla/ui/dom.js";
import { GET, POST } from "/static/js/vanilla/http/navigation.js";

export class User{
    constructor(){
        Dom.query('#sign-in, .sign-in').on('click', this.signinForm.bind(this));

        Dom.query('#sign-out').on('click',this.logout.bind(this));
    }
    logout(){
        GET('/user/signout/',{
            success: (response) => {
                if(response.result == 1)
                    location.reload();
            }
        });
    }
    signinForm(){
        GET('/user/signin/',{
            success: (response) => {
                if(response.result)
                    location.reload();
                pageObject.renderForm();
                Dom.query('#login-form').on('submit',this.login.bind(that));
                Dom.query('#forget').on('click',this.forget_password.bind(that));
            }
        });

        return false;
    }
    login(){
        POST('/user/signin/',{
            success: (response) => {
                if(response.result)
                    location.reload();
                else if(response){
                    social();
                }
                else{
                    pageObject.renderForm();
                    Dom.query('#login-form').on('submit',this.login.bind(this));
                    Dom.query('#forget').on('click',this.forget_password.bind(this));
                }
            },
            data: Dom.query('#login-form').serializeJSON()
        });
    }
    forget_password(){
        Dom.query('#forget-password-form').show();
        Dom.query('#login-form').hide();
        Dom.query('#forget-password-form button').on('click',function(){
            POST('/user/forget-password/',{
                success: () => {

                },
                data: Dom.query('#forget-password-form').serializeJSON()
            });
        });
    }
}