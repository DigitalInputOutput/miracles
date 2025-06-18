from django.http import Http404
from django.utils.translation import gettext as _

class ModelService: 

    @staticmethod
    def get_cached_object(AdminModel, model_id):
        if AdminModel:
            try:
                return AdminModel.objects.values('cached','last_modified').get(pk=model_id)
            except AdminModel.DoesNotExist:
                raise Http404(_(f"Об'єкт {AdminModel.__name__} з id: {model_id} не існує."))