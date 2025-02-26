# -*- coding: utf-8 -*-
from django import forms
from .models import Review
from .form_utils import BetterModelForm

class ReviewForm(BetterModelForm): 
    description = forms.CharField(label='Текст отзыва',required=True)
    class Meta:
        model = Review
        fields = ('title','description','active')
        fieldsets = [
                    ('main', {'fields':['title','active'],'legend':''}),
                    ('description', {'fields':['description'],'legend':'Описание','classes':['description']}),
                ]