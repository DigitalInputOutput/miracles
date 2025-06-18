from django.http import JsonResponse
from django.shortcuts import render
from catalog.models import Product
from django.db.models import Q

def autocomplete(request,value,**kwargs):
    if request.AdminModel == Product:
        items = request.AdminModel.objects.filter(Q(description__name__icontains=value) | Q(model__icontains=value)).distinct()[:16]
    else:
        items = request.AdminModel.objects.filter(description__name__icontains=value).distinct()[:16]

    return JsonResponse({'items':[item.autocomplete_dict(request.LANGUAGE_CODE) for item in items]})