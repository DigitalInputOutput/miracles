# -*- coding: utf-8 -*-
from django import forms
from .models import User
from django.utils.translation import gettext_lazy as _
import re

class UserSocialForm(forms.ModelForm): 
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['email'].required = False

    class Meta:
        model = User
        fields = ('email','name','social_id','social_type')

class ForgetPassForm(forms.Form): 
    phone = forms.CharField(label=_("нагадайте свій номер телефону"),required=True)

    class Meta:
        fields = ('phone',)

class ChangePasswordForm(forms.Form): 
    password1 = forms.CharField(label=_('Новий пароль'),widget=forms.PasswordInput(attrs={'placeholder': _('Новий пароль*')}))
    password2 = forms.CharField(label=_('Ще раз'),widget=forms.PasswordInput(attrs={'placeholder': _('Ще раз*')}))
    class Meta:
        fields = ('__all__',)

    def clean_password2(self):
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError(_("Паролі не співпадають"))
        return password2

class UserCreationForm(forms.ModelForm): 
    password1 = forms.CharField(label=_('Пароль*'),widget=forms.PasswordInput(attrs={'placeholder': _('Пароль*')}))
    password2 = forms.CharField(label=_('Пароль ще раз*'),widget=forms.PasswordInput(attrs={'placeholder': _('Пароль ще раз*')}))
    name = forms.CharField(max_length=30,label=_('ФИО*'),widget=forms.TextInput(attrs={'placeholder': _('ПІП*')}),required=False)
    email = forms.EmailField(label=_("Email-адрес"),widget=forms.TextInput(attrs={'placeholder': _('Email адреса'),'autocomplete':'email'}),required=False)
    phone = forms.CharField(max_length=16,label=_('Номер телефону:'),widget=forms.TextInput(attrs={'placeholder': _('Номер телефону')}),required=False)
    subscription = forms.BooleanField(label=_('Підписатися на розсилку'),required=False,initial=True,label_suffix='')

    class Meta:
        model = User
        fields = ('email','password1','password2','phone','subscription','name')

    def clean_password2(self):
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError(_("Паролі не співпадають"))
        return password2

    def clean_name(self):
        name = self.cleaned_data.get('name')
        if not name:
            name = User.generate_name()
        return name

    def save(self, *args, commit = True, **kwargs):
        user = super().save(*args, **kwargs)
        user.set_password(self.cleaned_data["password1"])
        if commit:
            user.save()
        return user

class QuickOrderForm(forms.ModelForm): 
    phone = forms.CharField(max_length=16,label=_('Номер телефону:'),widget=forms.TextInput(attrs={'placeholder': _('Номер телефону'),'autocomplete':'tel'}),required=True)

    class Meta:
        model = User
        fields = ('phone',)

    def save(self, *args, **kwargs):
        user = super().save(*args, **kwargs)
        if not user.password:
            user.set_password(User.make_random_password())
        return user

class UserForm(forms.ModelForm): 
    email = forms.EmailField(label="Email-адреса",widget=forms.TextInput(attrs={'placeholder': 'Email адреса'}),required=False)
    phone = forms.CharField(max_length=16,label=_('Номер телефону:'),widget=forms.TextInput(attrs={'placeholder': _('Номер телефону'),}),required=True)

    def __init__(self,*args,**kwargs):
        super().__init__(*args,**kwargs)
        self.fields['subscription'].required = False
        self.fields['fcm_token'].required = False
        self.fields['sname'].required = False

    def clean_phone(self):
        phone = self.cleaned_data.get('phone')
        phone = re.sub('[^\d]','',phone)
        if not re.match(r'[\d]{9,16}',phone):
            raise forms.ValidationError(_('Неправильний номер(приклад 0971112233)'))

        return phone

    class Meta:
        model = User
        fields = ('fcm_token','sname','lname','name','phone','email','subscription','notifications')

class SignInForm(forms.Form): 
    phone = forms.CharField(max_length=16,label=_('Номер телефону або логін*:'),widget=forms.TextInput(attrs={'placeholder': _('Номер телефону'),'autocomplete':'tel'}),required=True)
    password = forms.CharField(label=_('Пароль*:'),widget=forms.PasswordInput(attrs={'placeholder': _('Пароль'),'autocomplete':'password'}))

    class Meta:
        fields = "__all__"