from django.shortcuts import redirect
from system.settings import LANGUAGE_CODE
from django.apps import apps
from django.utils.translation import gettext as _
from shop.services import URLService, ModelService, CacheService, ViewService

MODELS = {model.__name__:model for model in apps.get_models()}

def route(request,lang=LANGUAGE_CODE,string="/"):

    if hasattr(request,'LANGUAGE_CODE') and request.LANGUAGE_CODE and lang != request.LANGUAGE_CODE:
        print("redirect at lang")
        return redirect(f'/{request.LANGUAGE_CODE}/{string}')

    # Delegate to services
    url = URLService.get_url_by_string(string, lang)

    if not url:
        print(f"Making redirect string: {string}")
        return URLService.make_redirect(string)

    Model = MODELS.get(url.model)

    # Fetch object and cache info
    Object = ModelService.get_cached_object(Model, url.model_id)
    last_modified = CacheService.get_last_modified(Object)

    if Object and CacheService.is_cached(Object, string, request, lang):
        # Serve cached HTML
        return CacheService.serve_cached_response(Object, url.view, string, request, lang, last_modified)

    elif Object:
        # Generate response from the view
        View = ViewService.import_view(url.view)
        response = View.as_view()(request, Object, lang=lang)

        # Update cache and write to file
        CacheService.cache_response(Object, response, string, request, lang)

        # Serve the final response
        return ViewService.build_final_response(response, last_modified)

    return URLService.make_redirect(string)