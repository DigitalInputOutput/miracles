from django.db import models
from django.utils import timezone
from shop.models import Language
from django.utils.translation import gettext_lazy as _

__all__ = ['City','Address','Department','Payment','Status','Delivery']

class City(models.Model): 
    name = models.CharField(max_length = 255)
    language = models.ForeignKey(Language,on_delete=models.CASCADE)
    last_modified = models.DateTimeField(auto_now_add = True)

    def dict(self):
        return {'id':self.id,'name':self.name}

    def __str__(self):
        return self.name

    def save(self):
        self.last_modified = timezone.now()

        super().save()

class Address(models.Model): 
    name = models.CharField(max_length = 255)
    city = models.ForeignKey(City,on_delete=models.CASCADE)
    language = models.ForeignKey(Language, on_delete = models.CASCADE)

    class Meta:
        unique_together = ('name', 'language', 'city')

class Department(models.Model): 
    name = models.CharField(max_length = 255)
    city = models.ForeignKey(City, related_name = 'departments', on_delete = models.CASCADE)
    address = models.ManyToManyField(Address)
    last_modified = models.DateTimeField(auto_now_add = True)
    number = models.PositiveIntegerField(null = True) # - is this still needed? 

    def dict(self):
        return {'id':self.id,'address':self.address,'city':self.city.id}

    def __str__(self):
        return self.name

    def save(self):
        self.last_modified = timezone.now()

        super().save()

class Delivery(models.Model): 
    department = models.ForeignKey(Department,verbose_name=_('Відділення'),null=True, on_delete=models.SET_NULL)
    ttn_link = models.CharField(max_length=255,null=True,blank=True,verbose_name='TTH URL')
    ttn_code = models.CharField(max_length=255,null=True,blank=True,verbose_name='TTH Number')
    ttn_created_date = models.DateTimeField(null=True,verbose_name=_('Дата відправки'))

    class Meta:
        verbose_name = _("Доставка")

class Payment(models.Model): 
    name = models.CharField(max_length = 255)
    image = models.CharField(max_length = 255)

    class Meta:
        verbose_name = _("Тип оплати")

class Status(models.Model): 
    name = models.CharField(max_length = 255)
    image = models.CharField(max_length = 255)

    class Meta:
        verbose_name = _("Статус замовлення")