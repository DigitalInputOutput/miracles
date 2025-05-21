from system.settings import BASE_URL,SITE_URL,DEFAULT_LANGUAGE_CODE,DOMAIN
from shop.models import StaticFiles,Language
from manager.models import Site
from shop.utils import is_ajax

try:
    from system.settings import TIGRES_CATEGORIES
except:
    TIGRES_CATEGORIES = False

def extends(request):
    # if is_ajax(request) and not request.session.pop('just_logged_in', False): # Remove flag after first request
    if is_ajax(request):
        return {'extends':'main/empty.html','BASE_URL':BASE_URL,'SITE_URL':SITE_URL}
    else:
        version = StaticFiles.objects.filter(type="manager").first()

        return {
            'extends':'main/index.html',
            'BASE_URL':BASE_URL,
            'SITE_URL':SITE_URL,
            'DOMAIN':DOMAIN,
            'CSS_VERSION': version.css,
            'JS_VERSION': version.js,
            'sites':Site.objects.filter(active=True),
            'TIGRES_CATEGORIES':TIGRES_CATEGORIES,
            'supported_languages':Language.objects.all(),
            'lang_url': f"/{request.LANGUAGE_CODE if request.LANGUAGE_CODE != DEFAULT_LANGUAGE_CODE else ''}",
            'lang_code': request.LANGUAGE_CODE
        }