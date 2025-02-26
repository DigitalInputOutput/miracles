# -*- coding: utf-8 -*-
from django.db import models
from .product import Product
from math import ceil
from django.utils.translation import gettext_lazy as _

class Popular(models.Model): 
    product = models.OneToOneField(
        Product,
        on_delete=models.CASCADE,
        primary_key=True,
        verbose_name='Товар',
        unique = True,
    )
    def dict(self):
        return self.product.dict()

    @property
    def id(self):
        return self.product.id

    def __str__(self):
        return self.product.name;

    class Meta:
        verbose_name = _('Популярні')
        verbose_name_plural = _('Популярні')

class Special(models.Model): 
    product = models.OneToOneField(
        Product,
        on_delete=models.CASCADE,
        primary_key=True,
        verbose_name=_('Товар'),
        unique = True,
    )
    price = models.PositiveIntegerField(default=0,verbose_name=_('Спец.Ціна'))
    percent = models.PositiveIntegerField(default=0)

    def save(self,*args,**kwargs):
        if self.price < self.product.retail_price:
            self.percent = ceil(100 - ((self.price * 100) / self.product.retail_price))
        super().save(*args,**kwargs)
        self.product.cache()

    @property
    def price_currency(self):
        return f'{self.price} грн.'

    @property
    def db(self):
        return self._state.db

    def __str__(self):
        return self.product.__str__();

    class Meta:
        verbose_name = _('Акції')
        verbose_name_plural = _('Акції')

class Offer(models.Model): 
    product = models.OneToOneField(
        Product,
        on_delete=models.CASCADE,
        primary_key=True,
        verbose_name=_('Товар'),
        unique = True,
    )
    def dict(self):
        return self.product.dict()

    @property
    def id(self):
        return self.product.id

    def __str__(self):
        return self.product.name;

    class Meta:
        verbose_name = _('Рекомендовані')
        verbose_name_plural = _('Рекомендовані')