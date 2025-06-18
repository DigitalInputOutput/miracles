from django.db import models
from catalog.models import Product
from math import ceil
from django.utils.translation import gettext_lazy as _
from bs4 import BeautifulSoup

class Task(models.Model): 
    name = models.CharField(max_length=100,null=True,unique=True)
    status_choices = (
        (1,_('In processing')),
        (2,_('Complete'))
    )
    status = models.PositiveIntegerField(choices=status_choices,default=2)
    link = models.CharField(max_length=100,null=True)
    function = models.CharField(max_length=100,null=True)

    def apply_async(self):
        return eval(self.function).apply_async((self.id,))

    def __str__(self):
        return self.name

    def __repr__(self):
        return self.name

class Export(models.Model): 
    name = models.CharField(max_length=100)
    task = models.ForeignKey(Task,on_delete=models.SET_NULL,null=True)
    has_meta = models.BooleanField(default=False)

    @property
    def dict(self):
        return {'id':self.id,'name':self.name}

    def __str__(self):
        return self.name

    def __repr__(self):
        return self.name

class ExportStatus(models.Model): 
    @property
    def default_price(self):
        return ceil(self.product.price * 1.2)

    product = models.ForeignKey(Product,related_name="export_status",on_delete=models.CASCADE)
    export = models.ForeignKey(Export,default=1,null=True,on_delete=models.SET_NULL)
    load = models.BooleanField(default=0)
    price = models.PositiveIntegerField(default=0)

    def save(self,*args,**kwargs):
        if not self.price:
            self.price = self.default_price
        super().save(*args,**kwargs)

    def __str__(self):
        return self.product.name

    class Meta:
        unique_together = ('product','export')

class ExportMeta(models.Model): 
    @property
    def default_name(self):
        try:
            return self.export.product.description.values('name').filter(language__code='ua').first().get('name')
        except:
            return ''

    name = models.CharField(max_length=100,default='')
    text = models.CharField(max_length=10000)
    json_text = models.TextField(null=True)
    export = models.OneToOneField(ExportStatus,related_name='meta',on_delete=models.CASCADE)

    def clean(text):
        if not text:
            return ''
        return BeautifulSoup(text,features="lxml").get_text()

    def save(self,*args,**kwargs):
        self.text = ExportMeta.clean(self.text)

        if not self.name:
            self.name = self.default_name

        super().save(*args,**kwargs)

class Site(models.Model): 
    name = models.CharField(max_length=20)
    database = models.CharField(max_length=20)
    url = models.CharField(max_length=20)
    active = models.BooleanField(default=1)

    def __str__(self):
        return self.name

class GoogleFeed(models.Model): 
    product = models.OneToOneField(Product,on_delete=models.CASCADE)

    def __str__(self):
        return self.product.__str__()