from manager.admin.model import AdminModel
from shop.models import Info
from manager.forms import InfoForm

class InfoAdmin(AdminModel): 
    model = Info
    form = InfoForm
    head = (('id','id'),('Название','name'))
    head_search = (('по id','id'),('по названию','description__name__icontains'))
    list_display = ('id','__str__')