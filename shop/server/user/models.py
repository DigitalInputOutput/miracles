#-*- coding=utf-8 -*-
from django.db import models
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.contrib.auth.hashers import (
    make_password,
)
from django.utils.translation import gettext as _

try:
    from system.settings import HOST,EMAIL,EMAIL_TITLE,BASE_URL
except:
    raise Exception(_('Вкажіть HOST, EMAIL та EMAIL_TITLE в settngs'))

from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin

from user.managers import CustomUserManager

class PassCode(models.Model): 
    code = models.CharField(max_length=25,verbose_name=_('Код'))
    created = models.DateTimeField(auto_now_add=True)

class User(AbstractBaseUser, PermissionsMixin): 
    email = models.EmailField(
        verbose_name='Email',
        max_length=255,blank=True,null=True)
    verified = models.BooleanField(default=0,verbose_name=_("Email підтверджено"))
    name = models.CharField(max_length=255,blank=False,null=True,verbose_name=_("Ім'я"))
    lname = models.CharField(max_length=255,blank=False,null=True,verbose_name=_('Призвище'))
    sname = models.CharField(max_length=255,blank=False,null=True,verbose_name=_('По батькові'))
    phone = models.CharField(max_length=16,verbose_name=_('Номер телефону'), null=True)
    password = models.CharField(verbose_name='Пароль', max_length=128)
    is_active = models.BooleanField(verbose_name=_('Активен'), default=True)
    is_admin = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False, verbose_name=_("Статус користувача"))
    subscription = models.BooleanField(verbose_name=_('Підписати пошту'),default=True)
    last_login = models.DateTimeField(auto_now_add=True,verbose_name=_("Востаннє в мережі"),null=True)
    created_at = models.DateTimeField(auto_now_add=True,verbose_name=_("Дата реєстрації"),null=True)
    device_id = models.CharField(max_length=50,unique=True,null=True)
    notifications = models.BooleanField(default=1)
    fcm_token = models.CharField(max_length=255,null=True)
    update_departaments = models.BooleanField(default=False)
    social_type_choices = (
            (1,'fb'),
            (2,'g')
        )
    social_type = models.PositiveIntegerField(null=True,choices=social_type_choices)
    social_id = models.CharField(max_length=255,null=True)
    
    objects = CustomUserManager()

    USERNAME_FIELD = 'device_id'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.device_id

    @property
    def full_name(self):
        return f"{self.name} {self.lname} {self.sname}"

    def init_form(self,data):
        fields = ['sname','lname','name','phone','email','subscription','notifications']

        for field in fields:
            if data.get(field) is None:
                data[field] = getattr(self,field)

        return data

    @property
    def admin(self):
        return '<div class="bool %s"></div>' % str(self.is_admin).lower()

    def restore_password(self,code):
        context = {'phone':self.phone,'password':code}
        subject, from_email, to = _('Відновлення паролю', f"{BASE_URL} {EMAIL_TITLE} <info@{BASE_URL}>"), self.email
        text_content,html_content = render_to_string('verify.txt',context),render_to_string('verify.html',context)
        msg = EmailMultiAlternatives(subject, text_content, from_email, [to])
        msg.attach_alternative(html_content, "text/html")
        msg.send()

    def save(self,*args,**kwargs):
        if self.pk:
            try:
                user = User.objects.get(pk=self.pk)
                if user.__dict__ == self.__dict__:
                    return
            except User.DoesNotExist:
                pass

        super().save(*args,**kwargs)

    def get_short_name(self):
        return self.name.title()

    def __unicode__(self):
        return self.email

    def __str__(self):
        return self.device_id

    def set_password(self, raw_password):
        self.password = make_password(raw_password)
        self._password = raw_password

    def dict(self):
        fields = ['id','sname','lname','name','notifications','phone','email','subscription']

        data = {field:getattr(self,field) for field in fields}

        return data

    class Meta:
        verbose_name = _('Користувачи')
        verbose_name_plural = _('Користувачи')

# class User(models.Model):

#     REQUIRED_FIELDS = []
#     USERNAME_FIELD = 'device_id'


#     def generate_name(length=16, chars=ascii_lowercase+digits, split=4, delimiter=_('-')):

#         name = ''.join([choice(chars) for i in range(length)])

#         if split:
#             name = delimiter.join([name[start:start+split] for start in range(0, len(name), split)])

#         try:
#             User.objects.get(name=name)
#             return generate_name(length=length, chars=chars, split=split, delimiter=delimiter)
#         except User.DoesNotExist:
#             return name

#     def make_random_password(length=32,
#                              allowed_chars='abcdefghjkmnpqrstuvwxyz'
#                                            'ABCDEFGHJKLMNPQRSTUVWXYZ'
#                                            '23456789'):
#         """
#         Generate a random password with the given length and given
#         allowed_chars. The default value of allowed_chars does not have "I" or
#         "O" or letters and digits that look similar -- just to avoid confusion.
#         """
#         return get_random_string(length, allowed_chars)



#     @property
#     def is_staff(self):
#         return self.is_admin

#     @property
#     def is_anonymous(self):
#         return False

#     @property
#     def is_authenticated(self):
#         return True