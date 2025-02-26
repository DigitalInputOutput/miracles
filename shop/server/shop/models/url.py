from django.db import models
from system.settings import LANGUAGE_CODE
from shop.models import Language
from django.utils.translation import gettext as _

class Url(models.Model): 
    model = models.CharField(max_length=16)
    model_id = models.PositiveIntegerField()
    string = models.CharField(max_length=255)
    language = models.ForeignKey(Language, on_delete=models.CASCADE)
    view = models.CharField(max_length=255) # Full path to the view class
    # e.g., 'yourapp.views.ProductDetailView' or 'anotherapp.views.BrandDetailView'

    class Meta:
        unique_together = ('string','language')
        verbose_name = _("Посилання")
        verbose_name_plural = _("Посилання")

    def __iter__(self):
        return self.string

    def __getitem__(self,key):
        return self.string[key]

    def __str__(self):
        return self.string

    def update(self,*args,**kwargs):
        super().save(*args,**kwargs)

    @property
    def url(self):
        return self.string