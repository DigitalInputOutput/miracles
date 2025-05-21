from manager.admin.model import AdminModel
from manager.models import Percent
from manager.forms import PercentForm

class PercentAdmin(AdminModel): 
    model = Percent
    form = PercentForm
    editTemplate = 'main/edit.html'
    head = (('id','id'),('Цена','price'),('Наценка','percent'),('И накинуть еще','additional'))
    head_search = ((),(),(),())
    list_display = ('id','price','percent','additional')