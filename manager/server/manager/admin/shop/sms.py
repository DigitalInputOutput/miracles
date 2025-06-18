from manager.admin.model import AdminModel
from shop.models import Sms
from manager.forms import SmsForm

class SmsAdmin(AdminModel): 
    model = Sms
    form = SmsForm
    head = (('id','id'),('текст','text'),('тип','type'))
    head_search = (('по id','id'),('по тексту','text__icontains'),('по типу','type__icontains'))
    list_display = ('id','text','type')