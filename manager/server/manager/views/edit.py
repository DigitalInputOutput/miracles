from django.shortcuts import render,get_object_or_404
from django.views.generic import View
from django.http import JsonResponse
from json import loads,dumps
from django.forms.models import model_to_dict
from django.utils.translation import gettext as _
from .meta import MetaView
from manager.utils import update_object

class EditView(View, MetaView): 
    def get(self,request,*args,**kwargs):
        AdminModel = request.AdminModel
        item = get_object_or_404(AdminModel.objects,pk=kwargs.get('id'))
        form = AdminModel.form(initial=model_to_dict(item),instance=item)

        context = {
            'item':item,
            'form':form,
            'AdminModel':AdminModel,
            f'{AdminModel.__name__}_id': item.pk,
            'context':{
                'title':AdminModel.title(item)
            },
        }
        AdminModel.extraContext(context)

        context['context'] = dumps(context['context'])

        if AdminModel.uses_slug():
            self.add_meta_forms(context, AdminModel, item)

        return render(request, AdminModel.editTemplate, context)

    def post(self,request,*args,**kwargs):
        AdminModel = request.AdminModel

        item = get_object_or_404(AdminModel.objects,pk=kwargs.get('id'))

        try:
            json = loads(request.body.decode('utf8'))
        except Exception:
            return JsonResponse({'result': False, 'error': 'Invalid JSON'}, status=400)

        updated, errors = update_object(item, json)

        if errors:
            return JsonResponse({'result': False, 'errors': errors}, status=400)

        return JsonResponse({'result':bool(updated),'updated':updated})

    def put(self,request,*args,**kwargs):
        AdminModel = request.AdminModel
        item = get_object_or_404(AdminModel.objects,pk=kwargs.get('id'))

        try:
            json = loads(request.body.decode('utf8'))
        except Exception:
            return JsonResponse({
                    'result': False,
                    'error': 'Invalid JSON'
                },status=400)

        form_kwargs = {
            'data': json,
            'instance': item,
            'initial': model_to_dict(item),
        }

        if AdminModel.uses_slug():
            metaM2M = self.validate_meta(json, str(AdminModel), item)

            if (not item.title or not item.meta_description) and not metaM2M:
                return JsonResponse({
                    'nonferrs':_('Set title or fill <a href="/meta/list">Meta</a>-template.')
                })

            form_kwargs['name'] = metaM2M[0].name

        form = AdminModel.form(**form_kwargs)

        if not form.is_valid():
            return JsonResponse({
                'errors':form.errors,
                'nonferrs':form.non_field_errors()
            })
    
        item = form.save(commit=False)

        item.save()

        form.save_m2m()
        AdminModel.saveExtras(json,item)

        if AdminModel.uses_slug():
            for meta in metaM2M:
                meta.save()
                item.description.add(meta)

        context = {
            'result':True
        }
        context.update(AdminModel.context(item))

        return JsonResponse(context)

    def delete(self,request,AdminModel,*args,**kwargs):
        item = get_object_or_404(AdminModel.objects,pk=kwargs.get('id'))
        item.delete()

        return JsonResponse({'result':True})