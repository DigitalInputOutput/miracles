from system.settings import BASE_URL,SITE_URL
from shop.models import StaticFiles
from manager.models import Site
from shop.utils import is_ajax

try:
    from system.settings import TIGRES_CATEGORIES
except:
    TIGRES_CATEGORIES = False

def extends(request):
    if is_ajax(request):
        return {'extends':'main/empty.html','BASE_URL':BASE_URL,'SITE_URL':SITE_URL}
    else:
        version = StaticFiles.objects.filter(type="manager").first()

        return {
            'extends':'main/index.html',
            'BASE_URL':BASE_URL,
            'SITE_URL':SITE_URL,
            'CSS_VERSION': version.css,
            'JS_VERSION': version.js,
            'sites':Site.objects.filter(active=True),
            'TIGRES_CATEGORIES':TIGRES_CATEGORIES
        }