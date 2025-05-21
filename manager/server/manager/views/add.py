from django.shortcuts import render
from django.http import JsonResponse
from django.views.generic import View
from json import loads,dumps
from transliterate import slugify
from django.utils.translation import gettext as _
from .meta import MetaView

__all__ = ['AddView']

class AddView(View, MetaView): 
    def get(self,request,*args,**kwargs):
        AdminModel = request.AdminModel
        form = AdminModel.form()

        context = {
            'form':form,
            'view':str(AdminModel),
            'AdminModel':AdminModel,
            'context':dumps({})
        }

        if AdminModel.uses_slug():
            self.add_meta_forms(context, AdminModel)

        return render(request, AdminModel.editTemplate, context) 

    def put(self,request,*args,**kwargs):
        AdminModel = request.AdminModel
        form = AdminModel.form(json)

        try:
            json = loads(request.body.decode('utf8'))
        except Exception:
            return JsonResponse({'result': False, 'error': 'Invalid JSON'}, status=400)

        image_file = json.get('image')
        if image_file:
            del json['image']

        if AdminModel.uses_slug():
            metaM2M = []

        form_kwargs = {
            'data': json,
        }

        if AdminModel.uses_slug():
            metaM2M = self.validate_meta(json, str(AdminModel), item)

            if (not item.title or not item.meta_description) and not metaM2M:
                return JsonResponse({'nonferrs':_('Set title or fill <a href="/meta/list">Meta</a>-template.')})

            form_kwargs['name'] = metaM2M[0].name

        form = AdminModel.form(**form_kwargs)

        if not form.is_valid():
            return JsonResponse({'errors':form.errors,'nonferrs':form.non_field_errors()})

        item = form.save(commit=False)

        if not item.slug:
            item.slug = slugify(metaM2M[0].name) or metaM2M[0].name

        item.save()

        form.save_m2m()
        AdminModel.saveExtras(json,item)

        if AdminModel.uses_slug():
            for meta in metaM2M:
                meta.save()
                item.description.add(meta)

        return JsonResponse({
            'result':True,
            'href':f'/{AdminModel}/{item.id}',
            'view':str(AdminModel),
            'id':item.id
        })