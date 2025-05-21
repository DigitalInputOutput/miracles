from django.shortcuts import render
from django.http import JsonResponse,Http404
from django.views.generic import View
from json import loads,dumps

class List(View): 
    def get(self,request,*args,**kwargs):
        AdminModel = request.AdminModel
        context = AdminModel.parse_context(request)

        AdminModel.items(context)

        context.update({
            'AdminModel':AdminModel,
            'panel':AdminModel.panel,
            'panel_shortcuts':AdminModel.panel_shortcuts,
            'context':{}
        })

        AdminModel.list_extra_context(context)
        AdminModel.paginate(context)

        context['context'] = dumps(context['context'])

        return render(request, AdminModel.listTemplate, context)

    def post(self,request,*args,**kwargs):
        AdminModel = request.AdminModel
        context = AdminModel.parse_context(request)

        AdminModel.items(context)
        AdminModel.paginate(context)

        context.update({
            'AdminModel':AdminModel
        })

        return render(request, AdminModel.itemsTemplate, context)

    def put(self,request,*args,**kwargs):
        AdminModel = request.AdminModel
        json = loads(request.body)
        updated = 0

        if json.get('update_data'):
            context = AdminModel.parse_context(request)

            if json.get('update_list'):
                items = AdminModel.objects.filter(id__in=json.get('update_list'))
            else:
                items = AdminModel.items(context)

            for item in items:
                for field,value in json.get('update_data').items():
                    if AdminModel.update_field(item,field,value):
                        updated += 1

            return JsonResponse({'result':True,'updated':updated})
        else:
            return JsonResponse({'result':True,'updated':updated})

    def delete(self,request,*args,**kwargs):
        AdminModel = request.AdminModel
        json = loads(request.body.decode('utf8'))

        deleted = AdminModel.delete(json)

        return JsonResponse({'result':True,'deleted':deleted})