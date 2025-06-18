from manager.admin.model import AdminModel
from catalog.models import Storage
from manager.forms import StorageForm
from django.utils.translation import gettext as _

class StorageAdmin(AdminModel):
    model = Storage
    form = StorageForm
    head = (('id','id'),(_('Name'),'name'))
    head_search = ((_('by id'),'id'),(_('by name'),'name__icontains'))
    list_display = ('id','name')