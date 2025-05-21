from django.db import models
from catalog.models import Product
from system.settings import DOMAIN, DEFAULT_CURRENCY
from django.utils.translation import gettext_lazy as _

class Cart(models.Model): 
    device_id = models.CharField(max_length = 255,verbose_name = 'device_id')
    items_qty = models.PositiveIntegerField(default = 0)
    total = models.PositiveIntegerField(default = 0)
    discount = models.PositiveIntegerField(default = 0)

    def __iter__(self):
        for item in self.items.all():
            yield item

    def __len__(self):
        return self.items.count()

    def count(self):
        return len(self)

    @property
    def dict(self):
        return {item.product.id:item.qty for item in self}

    @property
    def total_with_currency(self):
        return f'{self.total} {DEFAULT_CURRENCY}.'

    def remove_item(self,item):
        if self.items_qty == 0:
            self.total = 0
            self.save()
        else:
            self.total -= item.price * item.qty
            self.items_qty -= 1
            self.save()
        return self.items_qty

    def clear(self):
        self.total = 0
        self.items_qty = 0
        self.discount = 0
        self.save()

    def recalculate(self,admin = False):
        """Set all counters to 0. Iter items and count items quantity.
            Set each item price depends on user type and permissions.
            Count total price and discount."""

        total = 0
        discount = 0

        for item in self.items.all():
            self.items_qty += 1

            if not admin:
                item.price = item.product.price
                item.save()

            total += item.total
            discount += item.product.retail_price * item.qty

        self.total = total

        if discount > total:
            self.discount = discount - total

    def save(self, *args, **kwargs):

        self.recalculate()

        super().save(*args,**kwargs)

class Item(models.Model): 
    cart = models.ForeignKey(Cart,related_name = 'items', on_delete = models.CASCADE)
    product = models.ForeignKey(Product, on_delete = models.CASCADE)
    price = models.PositiveIntegerField(default = 0,verbose_name = _('Price'))
    qty = models.PositiveIntegerField(default = 0,verbose_name = _('Count'))
    total = models.PositiveIntegerField(default = 0,verbose_name = _('Total'))

    def dict(self):

        return {
            'price':self.price,
            'qty':self.qty,
            'total':self.total,
            'gallery':[DOMAIN + self.product.image.cart_thumb]
        }

    def save(self,*args,**kwargs):

        self.total = self.price * self.qty

        super().save(*args,**kwargs)

    def __str__(self):
        try:
            return self.product.name
        except Product.DoesNotExist:
            return str(_('Name does not exist'))

    bestsellers_sql = """select o.id,i.cart_id,i.product_id,COUNT(i.product_id) num,p.is_available 
    FROM checkout_order o LEFT JOIN cart_item i ON o.cart_id = i.cart_id 
    LEFT JOIN catalog_product p ON i.product_id = p.id GROUP BY i.product_id HAVING p.is_available = 1 
    ORDER BY num DESC"""

    bestsellers_extra_sql = """select o.id,i.cart_id,i.product_id,COUNT(i.product_id) num,p.is_available 
    FROM checkout_order o LEFT JOIN cart_item i ON o.cart_id = i.cart_id 
    LEFT JOIN catalog_product p ON i.product_id = p.id 
    WHERE i.product_id IN (select product_id from catalog_storage) 
    GROUP BY i.product_id HAVING p.is_available = 1 
    ORDER BY num DESC"""