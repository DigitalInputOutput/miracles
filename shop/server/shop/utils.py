import re

def is_ajax(request):
    return request.META.get('HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest'

def clear_html(html):
    html = "\n".join(line.strip() for line in html.splitlines())
    # Replace multiple spaces with a single space
    html = re.sub(r'\s+', ' ', html)
    return html.strip()