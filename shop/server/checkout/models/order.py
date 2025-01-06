from django.db import models
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from user.models import User
from checkout.models import Cart,Delivery,Payment
from system.settings import BASE_URL,PHONES
from django.utils.translation import gettext_lazy as _

try:
    from system.settings import EMAIL
except:
    EMAIL = 'info@miracles.digital'

class Order(models.Model): 
    user = models.ForeignKey(User,null=True, on_delete=models.CASCADE)
    name = models.CharField(verbose_name=_("Ім'я"),max_length=80,null=True)
    lname = models.CharField(max_length=255,verbose_name=_('Призвище'),null=True)
    sname = models.CharField(max_length=255,verbose_name=_('По батькові'),null=True)
    email = models.CharField(max_length=50,verbose_name="Email",null=True)
    phone = models.CharField(max_length=16,verbose_name=_("Телефон"),null=True)
    cart = models.ForeignKey(Cart,verbose_name = _('Кошик'), on_delete = models.CASCADE)
    delivery = models.ForeignKey(Delivery,on_delete = models.SET_NULL, null=True)
    payment = models.ForeignKey(Payment, on_delete = models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True,verbose_name=_('Дата додання'))
    comment = models.CharField(max_length=1000,null=True,verbose_name=_('Коментар до замовлення'))

    @property
    def total(self):
        return self.cart.total

    def dict(self):
        return {'id':self.id,'status':self.status,'total':self.cart.total,
                'items_qty':self.cart.items_qty,
                'images':[ + item.product.image.cart_thumb for item in self.cart.items.all()]}

    def detail(self):
        return {'id':self.id,'total':self.cart.total,
                'items_qty':self.cart.items_qty,'name':self.name,'lname':self.lname,
                'sname':self.sname,'phone':self.phone,'email':self.email,'payment_type':self.payment_type,
                'delivery_type':self.delivery_type,
                'city':self.city.id if self.city else None,
                'department':self.department.id if self.department else None,
                'address':self.address,'ttn':self.ttn,
                'cart':[item.dict() for item in self.cart.items.all()],'discount':self.cart.discount}

    def init_form(self,data):
        fields = ['name','lname','sname','payment_type','delivery_type','city','departament','address']

        for field in fields:
            if data.get(field) is None:
                data[field] = getattr(self,field)

        return data

    @property
    def full_name(self):
        return f"{self.name or ''} {self.lname or ''} {self.sname or ''}"

    @property
    def db(self):
        return self._state.db

    def __lt__(self,other):
        return self.created_at < other.created_at

    @property
    def status_display(self):
        return dict(self.status_choices)[self.status]

    def items(self):
        return list(self.cart)

    def send_mail(self,language='ua'):

        to = self.email
        add_email = EMAIL
        subject = _(f"Інформація за замовленням №{self.id}")
        from_email = _(f"{BASE_URL} <mail@{BASE_URL}>")

        context = {
            'logo': 'https://%s/static/image/logo.png' % BASE_URL,
            'domain': BASE_URL,
            'order': self,
            'lang': language,
            'PHONES': PHONES,
        }

        text_content, html_content = render_to_string('checkout/message.txt'),
        render_to_string('checkout/message.html',context)

        msg = EmailMultiAlternatives(subject, text_content, from_email, [to,add_email])

        msg.attach_alternative(html_content, "text/html")
        msg.send()

    class Meta:
        verbose_name = _('Замовлення')
        verbose_name_plural = _('Замовлення')
        ordering = ['-created_at']

    def __str__(self):
        return "№ " + str(self.id)

class Seat(models.Model): 
    order = models.ForeignKey(Order,on_delete=models.CASCADE,related_name='seats')
    weight = models.FloatField(verbose_name=_("Вага"))
    volumetricHeight = models.PositiveIntegerField(verbose_name=_("Висота"))
    volumetricWidth = models.PositiveIntegerField(verbose_name=_("Ширина"))
    volumetricLength = models.PositiveIntegerField(verbose_name=_("Довжина"))
    cost = models.FloatField(verbose_name=_("Оціночна вартість"))
    description = models.CharField(max_length=255,verbose_name=_("Опис"))

    cargo_choices = (
        (0,_('Ні')),
        (1,_('Так'))
    )

    specialCargo = models.BooleanField(choices=cargo_choices,default=1)

    def dict(self):
        return {
            'weight':self.weight,
            'volumetricHeight':self.volumetricHeight,
            'volumetricWidth':self.volumetricWidth,
            'volumetricLength':self.volumetricLength,
            'cost':self.cost,
            'description':self.description,
            'specialCargo':self.specialCargo
        }

    class Meta:
        verbose_name = _('Займаємий простір')
        verbose_name_plural = _('Займаємий простір')