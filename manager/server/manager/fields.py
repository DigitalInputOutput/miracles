from django.forms import ModelMultipleChoiceField,ModelChoiceField,CharField,ValidationError
from manager.widgets import AutocompleteWidget,AutocompleteMultipleWidget
from base64 import b64decode
from django.core.files.base import ContentFile
from django.utils.translation import gettext as _

class AutocompleteSelectField(ModelChoiceField): 
    widget = AutocompleteWidget({'attrs':{'placeholder':_('Enter first letters')}})

    def __init__(self,*args,**kwargs):
        self.queryset = kwargs.get('model').objects.all()
        self.widget.model = kwargs.get('model')
        del kwargs['model']
        super().__init__(self.queryset,*args,**kwargs)

class AutocompleteSelectMultipleField(ModelMultipleChoiceField): 
    widget = AutocompleteMultipleWidget({'attrs':{'placeholder':_('Enter first letters')}})

    def __init__(self,*args,**kwargs):
        self.queryset = kwargs.get('model').objects.all()
        self.widget.model = kwargs.get('model')
        del kwargs['model']
        super().__init__(self.queryset,*args,**kwargs)

class ImageField(CharField): 
    def clean(self, value):
        if not value:
            return

        try:
            if 'data:image/jpeg;base64' in value:
                return ContentFile(b64decode(value.replace('data:image/jpeg;base64,','')), name='{}.{}'.format(value[27:42],'jpg'))
            elif 'data:image/png;base64' in value:
                return ContentFile(b64decode(value.replace('data:image/png;base64,','')), name='{}.{}'.format(value[27:42],'png'))
        except Exception as e:
                raise ValidationError(e)