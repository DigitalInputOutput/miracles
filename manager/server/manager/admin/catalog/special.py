from manager.admin.model import AdminModel
from catalog.models import Special
from django.db.models import Q
from manager.forms import SpecialForm

class SpecialAdmin(AdminModel): 
    model = Special
    form = SpecialForm
    order_by = '-product_id'
    head = (('Цена','price'),('Товар','product__name'),('',''))
    head_search = (('по цене','price'),('по названию','product__description__name__icontains'))
    list_display = ('price_currency','product.__str__','product.admin_image')

    def get_filters(self,value):
        return Q(product__description__name__icontains=value)