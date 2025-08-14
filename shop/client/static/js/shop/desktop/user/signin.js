import { Dom } from "/static/js/vanilla/ui/dom.js";
import { Signup } from "./signup.js";
import { POST } from "/static/js/vanilla/http/navigation.js";

export class Signin{
    constructor(){
        Dom.query('#login-form').on('submit',this.login.bind(this));
        Dom.query('#forget').on('click',this.forget_password.bind(this));
        Dom.query('#sign-up').on('click',this.signup);
    }
    login(){
        POST('/user/signin/',{
            success: (response) => {
                if(response.result)
                    location.reload();
                else
                    social();
            },
            data: Dom.query('#login-form').serializeJSON()
        });
    }
    forget_password(){
        Dom.query('#forget-password-form').show();
        Dom.query('#login-form').hide();
        Dom.query('#forget-password-form button').on('click',function(){
            POST('/user/forget-password/',{
                success: function(){

                },
                data: Dom.query('#forget-password-form').serializeJSON(),
            });
        });
    }
    signup(){
        this.signup = new Signup();
    }
}