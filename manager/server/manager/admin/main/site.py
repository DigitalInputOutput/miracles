from manager.admin.model import AdminModel
from manager.models import Site
from manager.forms import SiteForm
from django.utils.translation import gettext as _

class SiteAdmin(AdminModel): 
    model = Site
    form = SiteForm
    head = (('id','id'),('Имя','name'),('URL','url'))
    head_search = ((_('за id'),'id'),(_('за назвою'),'name__icontains'),(_('за URL'),'url__icontains'))
    list_display = ('id','name','url')