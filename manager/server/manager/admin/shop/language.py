from manager.admin.model import AdminModel
from shop.models import Language
from manager.forms import LanguageForm

class LanguageAdmin(AdminModel): 
    model = Language
    form = LanguageForm
    head = (('id','id'),('Name','name'),('ISO Code','code'),(),('Is active','active'))
    head_search = (('by id','id'),('by name','name'),('by code','code__icontains'),(),())
    list_display = ('id','name','code','admin_image','is_active')
    editTemplate = 'main/edit.html'