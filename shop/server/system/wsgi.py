"""
WSGI config for miracles project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.1/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'system.settings')

from system.settings import DOMAIN

_application = get_wsgi_application()

def application(environ, start_response):
    if environ['HTTP_HOST'] == 'www.{DOMAIN}':
        start_response('301 Redirect', [('Location', 'https://{DOMAIN}%s' % environ['REQUEST_URI'],)])
        return []

    return _application(environ, start_response)
