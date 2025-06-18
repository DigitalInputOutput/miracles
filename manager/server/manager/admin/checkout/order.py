from manager.admin.model import AdminModel
from checkout.models import Order
from manager.forms import OrderForm
from django.db.models import Q
from django.utils import timezone
from django.utils.translation import gettext as _

class OrderAdmin(AdminModel): 
    edit_template = 'main/order.html'
    model = Order
    form = OrderForm
    listView = 'ListOrder'
    order_by = '-id'
    is_slug_based = False
    exclude = {'status__name__in':[6,3,8]}
    head = (('id','id'),(_('Name'),'name'),(_('Lname'),'lname'),(_('Sname'),'sname'),(_('Phone'),'phone'),('Total summ','cart__total'),(_('Status'),'status'),(_('Date'),'created_at'))
    head_search = (('по id','id'),(_('by name'),'name__icontains'),(_('by lname'),'lname__icontains'),(_('by sname'),'sname__icontains'),(_('by phone'),'phone__icontains'),(_('by summ'),'cart__total'),(),())
    list_display = ('id','name','lname','sname','phone','cart.total_currency','status_display','created_at.strftime("%d %b %H:%M")')

    def title(self,item):
        return _('Order №') + str(item.id)

    def search(self,value):
        try:
            int(value)
            return Q(user__phone__contains=value) | Q(id=value) | Q(user__name__icontains=value) | Q(cart__items__product__model__icontains=value) | Q(ttn=value)
        except ValueError:
            return Q(user__phone__contains=value) | Q(user__name__icontains=value) | Q(cart__items__product__model__icontains=value) | Q(ttn=value)

    def extra_context(self,context):
        context.update({'date':str(timezone.now().date())})
        return context

    # def search(self,value):
    #     if not value:
    #         return Q()

    #     return (Q(cart__items__product__description__name__icontains=value) | Q(cart__items__product__model__icontains=value))