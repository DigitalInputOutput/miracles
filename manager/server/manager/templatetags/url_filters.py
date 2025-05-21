from django import template
from urllib.parse import urlencode

register = template.Library()

@register.simple_tag
def query_transform(request, **kwargs):
    """
    Replaces or adds query parameters to the existing URL without duplicating them.
    """
    updated = request.GET.copy()
    for key, value in kwargs.items():
        updated[key] = value
    return urlencode(updated, doseq=True)