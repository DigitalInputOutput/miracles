from django.urls import include, re_path
from catalog import views as catalog
from shop.views import maintenance,GuestbookView
from shop.utils import get_active_languages

def localize(pattern):
    """Generate localized and default URL patterns"""
    languages = "|".join(get_active_languages()) # Fetch languages dinamically
    return [
        re_path(rf'^(?P<lang>({languages}))/{pattern}', include(f'{pattern}.urls')),
        re_path(rf'{pattern}', include(f'{pattern}.urls'))
    ]

urlpatterns = [
    *localize('user'),
    # *localize('cart'),
    *localize('checkout'),
    *localize('catalog'),
    # re_path(r'^filter', catalog.filter, name='filter'),
    re_path(r'^maintenance\.html',maintenance),
    re_path(r'^search', catalog.search, name='search'),
    re_path(rf'^(?P<lang>{"|".join(get_active_languages())})/search', catalog.search, name='search'),
    re_path(r'^leave_review', GuestbookView.as_view()),
    # re_path(r'^(?P<lang>(uk))/categories',categories),
    # re_path(r'^categories',categories)
]