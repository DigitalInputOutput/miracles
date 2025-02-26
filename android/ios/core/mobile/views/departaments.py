from django.http import JsonResponse,Http404
from checkout.models import City,Department
from django.views.generic import View
from mobile.serializers import serialize,departments

def city(request,type):
    cities = City.objects.filter(type=type)
    return JsonResponse({'success':1,'data':serialize(cities)})

def department(request,type,city):
    departments = Department.objects.filter(type=type,city=city)
    return JsonResponse({'success':1,'data':serialize(departments)})

def load_departaments(request):
    data = departaments()

    request.user.update_departments = False
    request.user.save()

    return JsonResponse({'success':1,'data':data})