from manager.admin.model import AdminModel
from shop.models import Currency
from manager.forms import CurrencyForm
from tasks import currency_prices

class CurrencyAdmin(AdminModel): 
    model = Currency
    form = CurrencyForm
    head = (('id','id'),('Валюта','get_type_display'),('Курс','value'))
    head_search = (('по id','id'),(),())
    list_display = ('id','get_type_display','value')
    editTemplate = 'main/edit.html'

    def saveExtras(self,json,product):
        currency_prices.apply_async()