from manager.admin.model import AdminModel
from catalog.models import Category
from category.forms import CategoryForm
from django.db.models import Q

class CategoryAdmin(AdminModel): 
    model = Category
    form = CategoryForm
    listView = 'CategoryList'
    searchTemplate = 'category/categories.html'
    listTemplate = 'category/categories.html'

    disabled_paginator = True

    def list_extra_context(self,context):
        context['items'] = context['items'].get_descendants(include_self=True)

        return context

    def search(self,value):
        if not value:
            return Q()

        return Q(name_ru__icontains=value)