from manager.admin.model import AdminModel
from catalog.models import Featured
from django.db.models import Q
from manager.forms import FeaturedForm

class FeaturedAdmin(AdminModel): 
    model = Featured
    form = FeaturedForm
    head = (('id','id'),('Категория','category__name'))
    head_search = (('по id','id'),('по категории','category__description__name__icontains'))
    list_display = ('id','category.__str__')

    def get_filters(self,value):
        return Q(category__description__name__icontains=value)