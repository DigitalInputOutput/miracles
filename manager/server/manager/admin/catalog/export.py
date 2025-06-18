from manager.admin.model import AdminModel
from manager.models import Export
from manager.forms import ExportForm
from django.db.models import Q
from django.utils.translation import gettext_lazy as _

class ExportAdmin(AdminModel): 
    listView = 'List'
    model = Export
    form = ExportForm
    head = (('id','id'),(_('Цель'),'name'))
    head_search = (('по id','id'),(_('Цель'),'name'))
    list_display = ('id','__str__')

    def search(self,value):
        if not value:
            return Q()

        return Q(name__icontains=value)