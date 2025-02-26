from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from json import loads
from requests import post
from datetime import datetime,timedelta
from checkout.models import Order
from shop.models import Settings
from django.utils.translation import gettext as _

def track(request,id):
    settings = Settings.objects.first()

    track = {
        "apiKey": settings.api_key,
        "modelName": "TrackingDocument",
        "calledMethod": "getStatusDocuments",
        "methodProperties": {
            "Documents": [
                # {
                #     "DocumentNumber": "20400048799000",
                #     "Phone":""
                # },
            ]
        }
        
    }
    order = get_object_or_404(Order,id=id)
    track['methodProperties']['Documents'].append({'DocumentNumber':order.ttn})

    response = post('https://api.novaposhta.ua/v2.0/json/',json=track)
    json = loads(response.text)
    context = {}
    if json['data']:
        item = json['data'][0]
        context[order.ttn] = {
                    _('Створений'):item.get('DateCreated'),
                    _('Очік. дата доставки'):item.get('ScheduledDeliveryDate'),
                    _('Статус'):item.get('Status')
                    }
    return JsonResponse({'item':context})

def tracking(request):
    settings = Settings.objects.first()

    track = {
        "apiKey": settings.api_key,
        "modelName": "TrackingDocument",
        "calledMethod": "getStatusDocuments",
        "methodProperties": {
            "Documents": [
                # {
                #     "DocumentNumber": "20400048799000",
                #     "Phone":""
                # },
            ]
        }
        
    }
    orders = Order.objects.filter(created_at__gte=datetime.today() - timedelta(days=8),status=6,ttn__isnull=False)
    for order in orders:
        track['methodProperties']['Documents'].append({'DocumentNumber':order.ttn})

    response = post('https://api.novaposhta.ua/v2.0/json/',json=track)
    json = loads(response.text)
    context = {}
    if json['data']:
        for item in json['data']:
            status = item.get('StatusCode')
            if status == '7' or status == '8':
                date = datetime.strptime('10:00 '+item.get('ScheduledDeliveryDate').replace('-','.'),'%H:%M %d.%m.%Y')
                if date < datetime.today() - timedelta(2):
                    ttn = item.get('Number')
                    order = orders.get(ttn=ttn)
                    context[ttn] = {
                                _('Створений'):item.get('DateCreated'),
                                _('Телефон'):order.phone,
                                _("Ім'я"):order.full_name,
                                _('Очік. дата доставки'):item.get('ScheduledDeliveryDate'),
                                _('Місто'):item.get('CityRecipient'),
                                _('Відділення'):order.departament.address_ru
                                }
    if context:
        return JsonResponse({'items':context})
    else:
        return JsonResponse({'items':''})
