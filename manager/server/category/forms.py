from django import forms
from manager.forms import Base64Form
from manager.fields import AutocompleteSelectField
from catalog.models import Category
from manager.widgets import SwitcherWidget
from django.utils.translation import gettext_lazy as _

class CategoryForm(Base64Form): 
    parent = AutocompleteSelectField(model=Category,help_text=None,label=_('Parent'), required=False)

    active = forms.BooleanField(label=_("Active"),
        widget=SwitcherWidget(),
        required=False,
        initial=False
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['image'].widget.model = self.instance
        self.fields['description'].required = False
        self.fields['bgcolor'].required = False

    class Meta:
        model = Category
        fields = '__all__'
        fieldsets = [
                    ('main', {'fields':['url','bgcolor','active','image'],'legend':_('General')}),
                    ('related', {'fields':['parent'],'legend':_('Relations')})
                ]