from manager.list.model import ModelAdmin
from shop.models import Info
from manager.forms import InfoForm

class InfoAdmin(ModelAdmin): 
    model = Info
    form = InfoForm
    head = (('id','id'),('Название','name'))
    head_search = (('по id','id'),('по названию','description__name__icontains'))
    list_display = ('id','__str__')