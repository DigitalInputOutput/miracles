from manager.admin.model import AdminModel
from shop.models import City
from manager.forms import CityForm

class CityAdmin(AdminModel): 
    model = City
    form = CityForm
    head = (('id','id'),('Название','name'))
    head_search = (('по id','id'),('по названию','name__icontains'))
    list_display = ('id','__str__')