from django.db import models
from shop.models import Language
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from system.settings import COMPANY_NAME, PHONES

__all__ = ['Description','DefaultMetaData']

class DefaultMetaData(models.Model):
    language = models.ForeignKey(Language,null=True,on_delete=models.SET_NULL)
    model = models.CharField(max_length=20)
    title = models.CharField(max_length=100)
    meta_description = models.CharField(max_length=255)

    class Meta:
        unique_together = ('language','model')

class Description(models.Model): 
    language = models.ForeignKey(Language, on_delete=models.SET_NULL,null=True)
    name = models.CharField(max_length=255,verbose_name=_('Назва'))
    text = models.TextField(max_length=20000,null=True,verbose_name=_('Опис'))
    json_text = models.TextField(max_length=20000,null=True)
    title = models.CharField(max_length=255,null=True)
    meta_description = models.CharField(max_length=255,null=True)
    last_modified = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True
        verbose_name = 'Description'
        verbose_name_plural = 'Description'
        unique_together = (('language','name'),('language','title'),('language','meta_description'))

    def ISOCode(self):
        return self.language.code

    def save(self,*args,**kwargs):
        self.last_modified = timezone.now()

        if self.pk:
            self.format_meta_data()

        super().save(*args,**kwargs)

    @classmethod
    def format_meta_data(obj, model_name, item):
        template = DefaultMetaData.objects.filter(
            language=item.language,
            model=model_name,
            ).first()
    
        if not template:
            return None

        item.title = item.title or template.title.format(**{
            'obj':item,'COMPANY_NAME':COMPANY_NAME
        })

        item.meta_description = item.meta_description or template.meta_description.format(**{
            'obj':item,'COMPANY_NAME':COMPANY_NAME,'PHONES':' '.join(PHONES)
        })[:255]

        return item

    def __str__(self):
        return self.name or ''

    def __repr__(self):
        return self.__str__()