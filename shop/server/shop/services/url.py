from shop.models import Url, Redirect, Language
from django.http import HttpResponsePermanentRedirect, Http404
from django.utils.translation import gettext as _
from urllib.parse import unquote
from system.settings import DEFAULT_LANGUAGE_CODE

class URLService: 

    @property
    def default_language(self):
        try:
            return Language.objects.get(code = DEFAULT_LANGUAGE_CODE)
        except:
            raise Exception(_("Default language is not installed. Install it with command python manage.py install"))

    @staticmethod
    def get_url_by_string(string, lang = default_language):
        if string == "":
            string = "/"

        try:
            return Url.objects.get(string=string, language__code = lang)
        except Url.DoesNotExist:
            pass

    @staticmethod
    def make_redirect(url):
        print("redirect at url service")
        if not url:
            raise Http404(_('Сторінка не існує.'))

        try:
            permanent = Redirect.objects.get(old=unquote(url))
            return HttpResponsePermanentRedirect(f'/{permanent.new}' or '')
        except Redirect.DoesNotExist:
            raise Http404(_('Сторінка не існує.'))