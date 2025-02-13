from django.shortcuts import render
from django.utils.translation import gettext_lazy as _
from catalog.models import Product
from json import loads

def favorite(request,lang='ua'):
    json = loads(request.body.decode('utf8')) if request.body else {}

    context = {
        'title':_('Обрані товари'),
        'view':'Favorite',
        'products':Product.objects.filter(id__in=json.get('favorite',[]))
    }
    context['base'] = 'shop/base.html' if request.is_ajax() else 'shop/%s/index.html' % request.folder

    return render(request,'user/%s/favorite.html' % request.folder,context)