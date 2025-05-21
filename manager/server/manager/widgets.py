from django.forms import TextInput,Select,CheckboxSelectMultiple,CheckboxInput
from catalog.models import Attribute
from system.settings import DOMAIN

__all__ = ['SwitcherWidget','AttributesWidget','GalleryWidget','ImageWidget','FgkWidget','StorageWidget','CustomSelectWidget']

class AutocompleteWidget(TextInput): 
    template_name = 'main/form/autocomplete.html'

    def get_context(self, name, value, attrs):
        context = super().get_context(name, value, attrs)
        try:
            context['widget']['value'] = self.model.objects.get(id=value)
        except self.model.DoesNotExist:
            pass
        context['model'] = self.model.__name__.lower()
        context['Model'] = self.model.__name__
        return context

class AutocompleteMultipleWidget(TextInput): 
    template_name = 'main/form/autocomplete_multiple.html'

    def get_context(self, name, value, attrs):
        context = super().get_context(name, value, attrs)
        context['widget']['values_list'] = []
        context['widget']['value'] = []
        if value:
            context['widget']['value'] = self.model.objects.filter(id__in=value)
            context['widget']['values_list'] = [item.id for item in context['widget']['value']]
        context['model'] = self.model.__name__.lower()
        context['Model'] = self.model.__name__
        return context

class SwitcherWidget(CheckboxInput): 
    template_name = "main/form/switcher.html"

    def get_context(self, name, value, attrs):
        context = super().get_context(name, value, attrs)
        return context

class CustomSelectWidget(Select): 
    template_name = "main/form/select.html"

class SelectInputWidget(TextInput): 
    template_name = "main/form/select.html"

    def get_context(self, name, value, attrs):
        context = super().get_context(name, value, attrs)
        context['departament'] = self.model.departament
        return context

class AttributesWidget(CheckboxSelectMultiple): 
    template_name = "main/form/attributes.html"

    def get_context(self, name, value, attrs):
        context = super().get_context(name, value, attrs)
        if self.instance.id:
            if hasattr(self.instance,'category'):
                context['attributes'] = Attribute.objects.filter(category__in=self.instance.category.all())
            context['product_id'] = self.instance.id
        return context

class GalleryWidget(TextInput): 
    template_name = "main/form/gallery.html"

    def get_context(self, name, value, attrs):
        context = super().get_context(name, value, attrs)
        # context['widget']['type'] = self.input_type
        if self.instance.pk and hasattr(self.instance, 'gallery'):
            context['gallery'] = self.instance.gallery.all()
        return context

class ImageWidget(TextInput): 
    template_name = "main/form/img.html"

    def get_context(self, name, value, attrs):
        context = super().get_context(name, value, attrs)
        # context['widget']['type'] = self.input_type
        if hasattr(self.model,'image'):
            context['model'] = self.model
            context['DOMAIN'] = DOMAIN
        return context

class FgkWidget(TextInput): 
    template_name = "main/form/fgk.html"

    def get_context(self, name, value, attrs):
        context = super().get_context(name, value, attrs)

        if self.instance.pk and hasattr(self.instance, self.related_name):
            context['instance'] = self.instance.related_name.all()

        context['model'] = self.model
        context['field'] = self.field

        return context

class StorageWidget(TextInput): 
    template_name = "main/form/storage.html"

    def get_context(self, name, value, attrs):
        context = super().get_context(name, value, attrs)
        context['storage'] = self.model.storage
        return context
