from catalog.models import Product
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from json import loads

def ordering(request, id, **kwargs):
    product = get_object_or_404(request.AdminModel.objects,id=id)
    ordering = {k: v for k, v in loads(request.body.decode('utf8')).items() if k != "csrf_token"}
    for id, position in ordering.items():
        image = product.gallery.get(id=id)
        image.position = position
        image.save()

    return JsonResponse({'result':True})