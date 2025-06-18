from shop.models import Language, Url
from django.forms import ValidationError
from django.forms.models import model_to_dict
from json import loads

class MetaView:
    def parse_json(self, json):
        for field, value in json.items():
            if type(value) == str and value.startswith("["):
                json[field] = loads(value)

    def add_meta_forms(self, context, AdminModel, item = None):
        meta_forms = []
        for language in Language.objects.filter(active=True):

            if item:
                meta = AdminModel.meta_form(
                    prefix=language.code,
                    instance=item.description.get(language=language),initial={
                        'language':language,
                        'model':AdminModel,
                        'url':Url.objects.get(
                            model_name=item.model_name,
                            model_id=item.id,
                            language=language
                        )
                    }
                )
            else:
                meta = AdminModel.meta_form(
                    prefix=language.code,
                    initial={
                        'language':language,
                        'model':AdminModel
                    }
                )

            meta_forms.append(meta)

        context['meta_forms'] = meta_forms

    def validate_meta(self, json, AdminModel, item = None):
        metaM2M = []

        for language in Language.objects.filter(active=True):
            form_kwargs = {
                "data": json,
                "prefix": language.code,
                "initial": {
                    'language':language,
                    'model':AdminModel
                }
            }

            if item:
                current_meta = item.description.get(language=language)
                form_kwargs['instance'] = current_meta
                form_kwargs['initial'].update(model_to_dict(current_meta))

            meta_form = AdminModel.meta_form(**form_kwargs)

            if not meta_form.is_valid():
                errors = meta_form.errors.copy()
                errors['nonferrs'] = meta_form.non_field_errors()
                raise ValidationError(errors)

            metaM2M.append(meta_form)

        return metaM2M