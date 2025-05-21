from manager.admin.model import AdminModel
from shop.models import Robots
from manager.forms import RobotsForm

class RobotsAdmin(AdminModel): 
    model = Robots
    form = RobotsForm
    head = (('id','id'),('Тело','body'),('Моб.','mobile'))
    list_display = ('id','body','is_mobile')
    editTemplate = 'main/edit.html'