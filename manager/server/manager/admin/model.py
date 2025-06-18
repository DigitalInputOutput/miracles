from django.db.models import Q
from django.template.loader import get_template
from manager.forms import ( InfoDescriptionForm,CategoryDescriptionForm, 
BrandDescriptionForm,TagDescriptionForm,CityDescriptionForm,
ProductDescriptionForm )
from django.core.paginator import Paginator
from ast import literal_eval

FORM_CLASSES = {
    'Info': InfoDescriptionForm,
    'Category': CategoryDescriptionForm,
    'Brand': BrandDescriptionForm,
    'Tag': TagDescriptionForm,
    'City': CityDescriptionForm,
    'Product': ProductDescriptionForm
}

class AdminModel:
    exclude = {}
    listView = 'List'
    edit_template = None
    searchHtml = 'main/items.html'
    listHtml = 'main/list.html'
    database = 'default'
    itemsTemplate = 'main/items.html'
    listTemplate = 'main/list.html'
    disabled_paginator = False
    is_slug_based = False

    @classmethod
    def get_edit_template(self):
        if self.edit_template:
            return self.edit_template

        if self.uses_slug():
            return 'main/slug.html'
        else:
            return 'main/edit.html'

    @classmethod
    def uses_slug(cls):
        return getattr(cls, 'is_slug_based', False)

    def delete(self,json):
        deleted = self.objects.filter(pk__in=json).delete()

        try:
            return list(deleted[1].values())[0]
        except:
            return ''

    def parse_context(self,request):
        context = request.GET.dict()
        context['filters'] = request.GET.copy()
        context['limit'] = request.session.get('limit',10)

        return context

    def items(self,context):
        ordering = context['filters'].get('o') or self.ordering

        query = self.filters(context)

        if query:
            items = self.objects.filter(query).order_by(ordering).distinct()
        else:
            items = self.objects.filter(query).exclude(**self.exclude).order_by(ordering).distinct()

        count = items.count()

        context.update({
            'items':items,
            'count':count
        })

    def filters(self,context):
        filters = {}

        if context:
            for field in context:
                if field in ['page','limit','o','all','filters']:
                    continue

                try:
                    value = literal_eval(context[field])
                    if value is None:
                        raise Exception()
                except:
                    value = context[field]

                if field == 'value':
                    return self.search(value)
                else:
                    filters[field] = value

            return Q(**filters)

        return Q()

    def search(self,value):
        if not value:
            return Q()

        return Q(description__name__icontains=value)
    
    def paginate(self,context):
        all_items = context['filters'].get('all')
        page = context['filters'].get('page')

        try:
            limit = int(context.get('limit',context['filters'].get('limit')))
        except:
            limit = 10

        if not self.disabled_paginator and not all_items:
            paginator = Paginator(context['items'], limit)
            try:
                context['items'] = paginator.page(page or 1)
            except:
                context['items'] = paginator.page(1)

    def extra_context(self,context):
        return context

    def __eq__(self,value):
        return self.model == value

    @property
    def meta_form(self):
        clsname = str(self)
        form_class = FORM_CLASSES.get(clsname)
        if not form_class:
            raise ValueError(f"No form found for {clsname}")
        return form_class

    def __init__(self,database = 'default'):
        self.database = database

    def context(self,item):
        return {}

    def list_extra_context(self,context):
        return context

    def save_extras(self,request,item):
        return

    @property
    def panel(self):
        try:
            panel = 'main/panel/%s.html' % self.__str__().lower()
            get_template(panel)
        except:
            panel = 'main/panel/default.html'

        return panel

    @property
    def editPanel(self):
        try:
            panel = 'main/panel/edit/%s.html' % self.__str__().lower()
            get_template(panel)
        except:
            panel = 'main/panel/edit/default.html'

        return panel

    @property
    def panel_shortcuts(self):
        try:
            panel = 'main/panel/shortcuts/%s.html' % self.__str__().lower()
            get_template(panel)
        except:
            panel = 'main/panel/shortcuts/default.html'

        return panel

    def title(self,item):
        if hasattr(item,'name'):
            return str(item.name)
        else:
            return str(item)

    @property
    def ordering(self):
        return self.order_by or '-id'

    def __str__(self):
        return self.model.__name__

    def __len__(self):
        return len(self.list_display)

    def __iter__(self):
        for field in self.list_display:
            yield field

    def __getattr__(self,name):
        if hasattr(self.model,name):
            return getattr(self.model,name)

    def get_filters(self,value):
        return Q(description__name__icontains=value)