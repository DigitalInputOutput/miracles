from django.urls import include, re_path
from catalog import views as catalog
from shop.views import maintenance,GuestbookView

urlpatterns = [
    re_path(r'^user/', include('user.urls')),
    re_path(r'^(?P<lang>(ua))/user/', include('user.urls')),
    re_path(r'^cart/', include('checkout.urls')),
    re_path(r'^(?P<lang>(ua))/cart/', include('checkout.urls')),
    re_path(r'^checkout/', include('checkout.urls')),
    re_path(r'^(?P<lang>(ua))/checkout/', include('checkout.urls')),
    re_path(r'^catalog/',include('catalog.urls')),
    re_path(r'^(?P<lang>(ua))/catalog/',include('catalog.urls')),
    # re_path(r'^filter', catalog.filter, name='filter'),
    re_path(r'^maintenance\.html',maintenance),
    re_path(r'^search', catalog.search, name='search'),
    re_path(r'^(?P<lang>(ua))/search', catalog.search, name='search'),
    re_path(r'^leave_review', GuestbookView.as_view()),
    # re_path(r'^(?P<lang>(ua))/categories',categories),
    # re_path(r'^categories',categories)
]