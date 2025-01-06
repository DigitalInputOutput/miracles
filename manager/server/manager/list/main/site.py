from manager.list.model import ModelAdmin
from manager.models import Site
from manager.forms import SiteForm
from django.utils.translation import gettext as _

class SiteAdmin(ModelAdmin): 
    model = Site
    form = SiteForm
    head = (('id','id'),('Имя','name'),('URL','url'))
    head_search = ((_('за id'),'id'),(_('за назвою'),'name__icontains'),(_('за URL'),'url__icontains'))
    list_display = ('id','name','url')
    editTemplate = 'main/edit.html'