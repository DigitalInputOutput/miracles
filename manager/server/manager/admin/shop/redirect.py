from manager.admin.model import AdminModel
from shop.models import Redirect
from manager.forms import RedirectForm

class RedirectAdmin(AdminModel): 
    model = Redirect
    form = RedirectForm
    head = (('id','id'),('old URL','old_path'),('new URL','new_path'))
    head_search = (('по id','id'),('по old URL','old_path__icontains'),('по new URL','new_path__icontains'))
    list_display = ('id','old_path','new_path')
    editTemplate = 'main/edit.html'