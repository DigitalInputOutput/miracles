#-*- coding:utf-8 -*-
from django.db import models
from shop.models import Page,Description
from django.utils.translation import gettext_lazy as _

class CityDescription(Description): 
    class Meta:
        db_table = 'city_description'
        unique_together = (('language','name'),('language','title'),('language','meta_description'))

class City(Page): 
    slug = models.CharField(max_length=255,verbose_name='URL',unique=True)
    description = models.ManyToManyField(CityDescription,related_name="obj")
    last_modified = models.DateTimeField(auto_now_add=True)
    view = 'Home'

    class Meta:
        verbose_name = _('Міста')
        verbose_name_plural = _('Міста')