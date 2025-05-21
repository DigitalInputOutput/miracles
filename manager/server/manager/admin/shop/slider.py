from manager.admin.model import AdminModel
from shop.models import Slider
from manager.forms import SliderForm

class SliderAdmin(AdminModel): 
    model = Slider
    form = SliderForm
    head = (('id','id'),('Название','name'),('URL','path'),('Картина',''))
    list_display = ('id','name','path','image_preview')
    editTemplate = 'main/edit.html'