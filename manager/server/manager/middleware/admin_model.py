from manager.admin import *
from django.http import Http404
from manager import admin

ADMIN_MODELS = {model:getattr(admin, model) for model in admin.__all__}

class AdminModelMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        # One-time configuration and initialization.

    def __call__(self, request):
        # Code to be executed for each request before
        # the view (and later middleware) are called.
        limit = request.GET.get('limit')
        session_limit = request.session.get('limit')

        if not session_limit or (limit and session_limit != limit):
            request.session['limit'] = limit or 9

        response = self.get_response(request)

        # Code to be executed for each request/response after
        # the view is called.

        return response

    def process_view(self, request, view_func, view_args, view_kwargs):
        model_key = view_kwargs.get('admin_model')

        if model_key:
            class_name = model_key + 'Admin'
            AdminModel = ADMIN_MODELS.get(class_name)

            if not AdminModel or not isinstance(AdminModel, type):
                raise Http404(f"No valid admin model found for '{model_key}'")

            request.AdminModel = AdminModel()

            return None
