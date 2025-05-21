from manager.admin.model import AdminModel
from shop.models import Url
from manager.forms import UrlForm

class UrlAdmin(AdminModel): 
    model = Url
    form = UrlForm
    head = (('id','id'),('URL','string'),('View','view'),('model_id','model_id'))
    head_search = (('по id','id'),('по URL','string__icontains'),('по view','view__icontains'),('по model_id','model_id'))
    list_display = ('id','__str__','view','model_id')
    editTemplate = 'main/edit.html'