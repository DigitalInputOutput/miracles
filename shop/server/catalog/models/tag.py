from django.db.models import ManyToManyField,CharField,ImageField,DateTimeField
from shop.models import Page,Description
from django.utils.translation import gettext_lazy as _

class TagDescription(Description): 
    class Meta:
        db_table = 'tag_description'
        unique_together = (('language','name'),('language','title'),('language','meta_description'))

class Tag(Page): 
    description = ManyToManyField(TagDescription,related_name="obj")
    image = ImageField(upload_to='tag/', blank=True, null=True,verbose_name=_('Картинка'))
    last_modified = DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Тег')
        verbose_name_plural = _('Теги')