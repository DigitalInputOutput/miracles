from django.shortcuts import render,get_object_or_404
from django.views.generic import View
from django.http import JsonResponse
from json import loads,dumps
from django.forms.models import model_to_dict
from django.utils.translation import gettext as _
from .meta import MetaView
from manager.utils import update_object
from django.core.exceptions import ValidationError
from django.db import transaction
from manager.forms import UrlForm
from shop.models import Url

class EditView(View, MetaView): 
    def get(self,request,*args,**kwargs):
        AdminModel = request.AdminModel
        item = get_object_or_404(AdminModel.objects, pk=kwargs.get('id'))
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
        AdminModel.extra_context(context)

        context['context'] = dumps(context['context'])

        if AdminModel.uses_slug():
            self.add_meta_forms(context, AdminModel, item)

        return render(request, AdminModel.get_edit_template(), context)

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
            self.parse_json(json)
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

        form = AdminModel.form(**form_kwargs)

        if not form.is_valid():
            return JsonResponse({
                'errors':form.errors,
                'nonferrs':form.non_field_errors()
            })

        form.save(commit=False)

        if AdminModel.uses_slug():
            try:
                metaM2M = self.validate_meta(json, AdminModel, item)
            except ValidationError as e:
                return JsonResponse({'errors': e.message_dict})
    
        try:
            with transaction.atomic():
                item = form.save()

                form.save_m2m()
                AdminModel.save_extras(json, item)

                if AdminModel.uses_slug():
                    for meta_form in metaM2M:
                        data={
                            "string": meta_form.cleaned_data.get('url') or meta_form.cleaned_data.get('name'),
                            "view": form.cleaned_data.get('view') or item.__class__.__name__,
                            "model_name": item.__class__.__name__,
                            "model_id": item.id,
                            "language": meta_form.cleaned_data.get("language")
                        }

                        current_url = Url.objects.get(
                            model_id=item.id,
                            model_name=item.model_name,
                            language=meta_form.cleaned_data.get("language")
                        )

                        url_form = UrlForm(
                            data=data,
                            instance=current_url,
                            initial=model_to_dict(current_url)
                        )

                        if not url_form.is_valid():
                            errors = url_form.errors.copy()
                            errors['nonferrs'] = url_form.non_field_errors()
                            raise ValidationError(errors)

                        url_form.save()
                        meta = meta_form.save()
                        item.description.add(meta)
        except ValidationError as e:
            return JsonResponse({"errors":e.message_dict})

        context = {
            'result':True
        }

        context.update(AdminModel.context(item))

        return JsonResponse(context)

    def delete(self,request,*args,**kwargs):
        with transaction.atomic():
            item = get_object_or_404(request.AdminModel.objects,pk=kwargs.get('id'))
            item.delete()

        return JsonResponse({'result':True})