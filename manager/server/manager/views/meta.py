from shop.models import Language, Description
from django.forms.models import model_to_dict
from django.http import JsonResponse

class MetaView:
    def add_meta_forms(self, context, Model, item = None):
        meta_forms = []
        for lang in Language.objects.filter(active=True):

            if item:
                try:
                    meta = Model.meta_form(instance=item.description.get(language=lang),initial={'lang':lang})
                except:
                    meta = Model.meta_form(initial={'lang':lang,'name':item.name},item=item)
            else:
                meta = Model.meta_form(initial={'lang':lang})

            meta_forms.append(meta)

        context['meta'] = meta_forms

    def validate_meta(self, json, Model, item):
        metaM2M = []
        json['description'] = []

        for lang in Language.objects.filter(active=True):
            try:
                current = item.description.get(language=lang)
                meta_form = Model.meta_form(
                    json,
                    instance=current,
                    initial=model_to_dict(current),
                    prefix=lang.code
                )
            except:
                meta_form = Model.meta_form(
                    json,
                    item=item,
                    initial={'lang':lang,'name':item.name},
                    prefix=lang.code
                )

            if not meta_form.is_valid():
                return JsonResponse({'errors':meta_form.errors,'nonferrs':meta_form.non_field_errors()})

            meta_obj = meta_form.save(commit=False)
            meta_obj, errors = Description.format_meta_data(Model, meta_obj)

            metaM2M.append(meta_obj), errors

        return metaM2M