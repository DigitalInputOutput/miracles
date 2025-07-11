from manager.admin.model import AdminModel
from catalog.models import Attribute
from django.db.models import Q
from manager.forms import AttributeForm

class AttributeAdmin(AdminModel): 
    model = Attribute
    form = AttributeForm
    head = (('id','id'),('Название','name'))
    head_search = (('по id','id'),('по названию','name__icontains'))
    list_display = ('id','name')

    def get_filters(self,value):
        return Q(name__icontains=value) | Q(values__value__icontains=value)

    def save_extras(self,json,attribute):
        if json.get('value'):
            attribute.values.exclude(value__in=json.get('value')).delete()

            for value in json.get('value'):
                try:
                    attribute.values.get(value=value)
                except:
                    attribute.values.create(value=value)