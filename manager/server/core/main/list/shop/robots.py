from manager.list.model import ModelAdmin
from shop.models import Robots
from manager.forms import RobotsForm

class RobotsAdmin(ModelAdmin): 
    model = Robots
    form = RobotsForm
    head = (('id','id'),('Тело','body'),('Моб.','mobile'))
    list_display = ('id','body','is_mobile')
    editTemplate = 'main/edit.html'