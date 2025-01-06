from django.http import Http404
from django.utils.translation import gettext as _

class ModelService: 

    @staticmethod
    def get_cached_object(Model, model_id):
        if Model:
            try:
                return Model.objects.values('cached','last_modified').get(pk=model_id)
            except Model.DoesNotExist:
                raise Http404(_(f"Об'єкт {Model.__name__} з id: {model_id} не існує."))