import re
from shop.models import Language
from django.core.cache import cache

def get_active_languages():
    """Retrieve active languages from the database and cache them"""
    languages = cache.get('active_languages')
    if languages is None:
        languages = list(Language.objects.filter(active=True).values_list('code', flat=True))
        cache.set('active_langauges', languages, timeout=3600) # Cache for 1 hour
    return languages

def is_ajax(request):
    return request.META.get('HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest'

def clear_html(html):
    html = "\n".join(line.strip() for line in html.splitlines())
    # Replace multiple spaces with a single space
    html = re.sub(r'\s+', ' ', html)
    return html.strip()