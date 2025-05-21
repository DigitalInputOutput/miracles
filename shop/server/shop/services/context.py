# -*- coding: utf-8 -*-
from shop.models import Language, Settings, StaticFiles, City, Info, Url
from catalog.models import Product, Category, Popular
from system.settings import SVG_CACHE_FOLDER,DEFAULT_LANGUAGE_CODE, BASE_URL, ADMIN_BASE_URL, PROTOCOL, YOUTUBE_LINK, FACEBOOK_LINK, ADDRESS, IOS_APP
from shop.utils import is_ajax
from django.utils.translation import gettext as _
from re import sub

class ContextBuilder:
    def __init__(self, request):
        self.request = request

        # Define langueg url
        self.context = {
            'lang_url': f"/{request.LANGUAGE_CODE if request.LANGUAGE_CODE != DEFAULT_LANGUAGE_CODE else ''}",
            'lang_code': request.LANGUAGE_CODE
        }

    def build_default_context(self):
        """Builds the base context dictionary with common settings and language info."""

        if not is_ajax(self.request):

            # Basic context data for non-ajax requests
            self.context.update({
                'BASE_URL': BASE_URL,
                'PROTOCOL': PROTOCOL,
                'host': BASE_URL,
                'SVG_CACHE': SVG_CACHE_FOLDER + "sprite.svg",
                'ADMIN_BASE_URL': ADMIN_BASE_URL,
                'YOUTUBE_LINK': YOUTUBE_LINK or '',
                'FACEBOOK_LINK': FACEBOOK_LINK or '',
                'ADDRESS': ADDRESS or '',
                'IOS_APP': IOS_APP or False,
                'cities': City.objects.all(),
                'navigation': Category.objects.filter(parent__isnull=True),
                'languages': Language.objects.all(),
                'image': f'https://{BASE_URL}/static/image/logo.png',
                'footer_path': f"desktop/{self.request.LANGUAGE_CODE}/static/footer.html"
            })

            # Language ISO code
            try:
                self.context['langISOcode'] = Language.objects.get(code=self.context['lang_code']).ISOcode
            except Language.DoesNotExist:
                self.context['langISOcode'] = DEFAULT_LANGUAGE_CODE

        return self.context

    def build_shop_context(self):
        """Adds shop-specific settings and other data to context."""

        version = StaticFiles.objects.filter(type="shop").first()

        shop_settings = Settings.objects.values(
            'facebook_id', 'attention_message', 'phones', 'emails', 
            'google_analytics', 'google_adwords', 'google_tag', 
            'google_verification'
        ).first()

        if not is_ajax(self.request):

            # Adding additional context data
            self.context.update({
                'nav': f'{self.request.device}/{self.request.LANGUAGE_CODE}/static/categories.html',
                'popular': Popular.objects.filter(product__is_available=True),
                'latest': Product.objects.filter(is_available=True).order_by('-id')[:6],
                'header_menu': Info.objects.filter(position=1),
                'footer_menu': Info.objects.filter(position=2)
            })

            # Shop settings
            if shop_settings:
                self.context.update({
                    'GOOGLE_SITE_VERIFICATION': shop_settings.get('google_verification', ''),
                    'GOOGLE_TAG': shop_settings.get('google_tag', ''),
                    'GOOGLE_ANALYTICS': shop_settings.get('google_analytics', ''),
                    'GOOGLE_ADWORDS': shop_settings.get('google_adwords', ''),
                    'FACEBOOK_ID': shop_settings.get('facebook_id', ''),
                    'EMAIL': shop_settings.get('emails', '').split(',')[0],
                    'PHONES': shop_settings.get('phones', '').split(',')
                })
                self.context['attention_message'] = shop_settings.get('attention_message', '')

            # Static file versioning
            if version:
                self.context.update({
                    'CSS_VERSION': version.css,
                    'JS_VERSION': version.js
                })

        return self.context

    def build_meta_context(self, url_path):
        """Adds meta data to context based on URL information."""

        page = self.request.GET.get('page')
        self.context['url'] = sub(r'^(/[a-z]{2})?/', '', url_path)

        try:
            url_obj = Url.objects.get(string=self.context['url'])
        except Url.DoesNotExist:
            url_obj = Url.objects.filter(string__isnull=True).first() if self.context['url'] == '' else None

        if url_obj:
            model_class = eval(url_obj.model)

            try:
                obj = model_class.objects.get(id=url_obj.model_id)

                # Fetch description with fallback
                description = obj.description.filter(language__code=self.request.LANGUAGE_CODE).first() or obj.description.first()

                if description:
                    self.context.update({
                        'title': description.title,
                        'meta_description': description.meta_description,
                        'url': obj.get_url,
                        'h1': description.name,
                        'image': f"https://{self.request.get_host()}{obj.meta_image}",
                        'description': description.text or ''
                    })

                    if page:
                        self.context.update({
                            'title': f"{self.context['title']} {_('Page')} {page}",
                            'h1': f"{self.context['h1']} {_('Page')} {page}",
                            'meta_description': f"{self.context['meta_description']} {_('Page')} {page}"
                        })
                else:
                    self.context.update({
                        'title': getattr(obj, 'title', getattr(obj, 'name', '')),
                        'meta_description': getattr(obj, 'meta_description', '')
                    })

                # Admin edit link and city exclusion for City instances
                if self.request.user.is_admin:
                    self.context['edit_url'] = f'{ADMIN_BASE_URL}/{url_obj.model}/{obj.id}'

                if isinstance(obj, City):
                    self.context['cities'] = City.objects.exclude(id=obj.id)

            except model_class.DoesNotExist:
                pass

        return self.context