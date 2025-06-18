from manager.admin.model import AdminModel
from shop.models import Currency
from manager.forms import CurrencyForm
from tasks import currency_prices
from django.utils.translation import gettext as _

class CurrencyAdmin(AdminModel): 
    model = Currency
    form = CurrencyForm
    head = (('id','id'),(_('Currency'),'code'),(_('Rate'),'value'))
    head_search = ((_('by id'),'id'),(),())
    list_display = ('id','code','value')

    def save_extras(self,json,product):
        pass
        # currency_prices.apply_async()