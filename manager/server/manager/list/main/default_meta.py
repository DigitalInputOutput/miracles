from manager.list.model import ModelAdmin
from shop.models import DefaultMetaData
from manager.forms import DefaultMetaDataForm
from django.utils.translation import gettext as _

class DefaultMetaDataAdmin(ModelAdmin): 
    model = DefaultMetaData
    form = DefaultMetaDataForm
    head = (('id','id'),(_("Ім'я"),'name'),('URL','url'))
    head_search = ((_('за id'),'id'),(_('за model'),
                        'model__icontains'),(_('за мовою'),
                        'language'),(_('за title'),'title')
                    )
    list_display = ('id','get_model_display','language','title')
    editTemplate = 'main/edit.html'