from manager.admin.model import AdminModel
from catalog.models import Brand
from manager.forms import BrandForm

class BrandAdmin(AdminModel): 
    model = Brand
    form = BrandForm
    order_by = '-id'
    head = (('id','id'),('Название','name'),('Страна','country'))
    head_search = (('по id','id'),('по названию','description__name__icontains'),('по стране','country__icontains'))
    list_display = ('id','name','country')