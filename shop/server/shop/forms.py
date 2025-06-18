# -*- coding: utf-8 -*-
from django import forms
from .models import Review
from .form_utils import BetterModelForm
from django.utils.translation import gettext as _

class ReviewForm(BetterModelForm): 
    description = forms.CharField(label=_('Feedbacks text'),required=True)
    class Meta:
        model = Review
        fields = ('title','description','active')
        fieldsets = [
                    ('main', {'fields':['title','active'],'legend':''}),
                    ('description', {'fields':['description'],'legend':'Описание','classes':['description']}),
                ]