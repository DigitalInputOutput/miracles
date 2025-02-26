#-*- coding:utf-8 -*-
from django.db import models
from shop.models import Description,Page
from django.utils.translation import gettext_lazy as _

class InfoDescription(Description): 
    class Meta:
        db_table = 'page_description'
        unique_together = (('language','name'),('language','title'),('language','meta_description'))

class Info(Page): 
    description = models.ManyToManyField(InfoDescription,related_name="obj")
    last_modified = models.DateTimeField(auto_now_add=True)

    position_choices = (
            (1, 'header_menu'),
            (2, 'footer_menu'),
        )
    position = models.PositiveIntegerField(choices=position_choices,null=True)

    class Meta:
        verbose_name = _('Звичайна сторінка')
        verbose_name_plural = _('Звичайні сторінка')
        ordering = ['-id']