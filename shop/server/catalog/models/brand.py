# -*- coding: utf-8 -*-
from django.db import models
from shop.models import Page,Description
from django.utils.translation import gettext_lazy as _

class BrandDescription(Description): 
    class Meta:
        db_table = 'brand_description'

class Brand(Page): 
    country = models.CharField(max_length=255,verbose_name=_('Країна виробник'))
    active = models.BooleanField(default=False,verbose_name=_("Зробити сторінкою?"))
    description = models.ManyToManyField(BrandDescription,related_name="obj")
    image = models.ImageField(upload_to='brand/',null=True,blank=True,verbose_name=_('Зображення'))

    def icon(self):
        if self.image:
            return '<img src="{}" alt="{}">'.format(self.image,self.name)
        else:
            return ''

    def __str__(self):
        try:
            return self.description.first().name
        except:
            return ''

    class Meta:
        verbose_name = _('Виробники')
        verbose_name_plural = _('Виробники')