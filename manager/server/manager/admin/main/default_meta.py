from manager.admin.model import AdminModel
from shop.models import DefaultMetaData
from manager.forms import DefaultMetaDataForm
from django.utils.translation import gettext as _

class DefaultMetaDataAdmin(AdminModel): 
    model = DefaultMetaData
    form = DefaultMetaDataForm
    head = (('id','id'),(_("Name"),'name'),('URL','url'))
    head_search = ((_('by id'),'id'),(_('by model'),
                        'model__icontains'),(_('by lang'),
                        'language'),(_('by title'),'title')
                    )
    list_display = ('id','get_model_display','language','title')
    editTemplate = 'main/edit.html'