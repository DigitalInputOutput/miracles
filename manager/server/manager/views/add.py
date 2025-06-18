from django.shortcuts import render
from django.http import JsonResponse
from django.views.generic import View
from json import loads,dumps
from django.utils.translation import gettext as _
from .meta import MetaView
from manager.forms import UrlForm
from django.db import transaction
from django.core.exceptions import ValidationError

__all__ = ['AddView']

class AddView(View, MetaView): 
    def get(self,request,*args,**kwargs):
        AdminModel = request.AdminModel
        form = AdminModel.form()

        context = {
            'form':form,
            'View':str(AdminModel),
            'AdminModel':AdminModel,
            'context':dumps({})
        }

        AdminModel.extra_context(context)

        if AdminModel.uses_slug():
            self.add_meta_forms(context, AdminModel)

        return render(request, AdminModel.get_edit_template(), context) 

    def put(self,request,*args,**kwargs):
        AdminModel = request.AdminModel

        try:
            json = loads(request.body.decode('utf8'))
            self.parse_json(json)
        except Exception:
            return JsonResponse({
                    'result': False,
                    'error': 'Invalid JSON'
                },status=400)

        form = AdminModel.form(data=json)

        if not form.is_valid():
            return JsonResponse({
                'errors':form.errors,
                'nonferrs':form.non_field_errors()
            })

        form.save(commit=False)

        if AdminModel.uses_slug():
            try:
                metaM2M = self.validate_meta(json, AdminModel)
            except ValidationError as e:
                return JsonResponse({'errors': e.message_dict})

        try:
            with transaction.atomic():
                item = form.save()

                form.save_m2m()
                AdminModel.save_extras(json, item)

                if AdminModel.uses_slug():
                    for meta_form in metaM2M:
                        url_form = UrlForm(data={
                            "string": meta_form.cleaned_data.get('url') or meta_form.cleaned_data.get('name'),
                            "view": form.cleaned_data.get('view') or item.__class__.__name__,
                            "model_name": item.__class__.__name__,
                            "model_id": item.id,
                            "language": meta_form.cleaned_data.get("language")
                        })

                        if not url_form.is_valid():
                            errors = url_form.errors.copy()
                            errors['nonferrs'] = url_form.non_field_errors()
                            raise ValidationError(errors)

                        url_form.save()
                        meta = meta_form.save()
                        item.description.add(meta)
        except ValidationError as e:
            return JsonResponse({"errors":e.message_dict})

        return JsonResponse({
            'result':True,
            'next':f'/{AdminModel}/{item.id}'
        })