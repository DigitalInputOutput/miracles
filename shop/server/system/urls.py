"""miracles URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('cv/', include('cv.urls')),
    path('',include('shop.urls'))
]
# -*- coding=utf-8 -*-
from django.urls import include, re_path
from django.contrib import admin
from catalog import views as catalog
from shop.views.sitemaps import sitemap
from shop.views import RobotsView,ConfirmView
from django.views.generic import RedirectView
from django.urls import include, path, re_path
from shop import views as shop
# from blog import views as blog
from shop.views import maintenance,GuestbookView

urlpatterns = [
    re_path(r'^favicon\.ico$', RedirectView.as_view(url='/static/image/favicon.webp')),
    re_path(r'^sitemap\.xml$', sitemap, name='sitemapxml'),
    re_path(r'^robots\.txt$', RobotsView.as_view(), name='robots'),
    re_path(r'^\.well-known/pki-validation/(?P<name>\w+\.txt)$', ConfirmView.as_view()),
    re_path(r'^user/', include('user.urls')),
    re_path(r'^(?P<lang>[a-z]{2})/user/', include('user.urls')),
    # re_path(r'^(?P<lang>[a-z]{2})/category',categories),
    re_path(r'^(?P<lang>[a-z]{2})/checkout/', include('checkout.urls')),
    re_path(r'^(?P<lang>[a-z]{2})/catalog/',include('catalog.urls')),
    re_path(r'^(?P<lang>[a-z]{2})/search', catalog.search, name='search'),
    re_path(r'^checkout/', include('checkout.urls')),
    re_path(r'^(?P<lang>[a-z]{2})/', include('shop.urls')),
    re_path(r'^', include('shop.urls')),
    re_path(r'^maintenance\.html',maintenance),
    re_path(r'^search', catalog.search, name='search'),
    re_path(r'^leave_review', GuestbookView.as_view())
]

from shop.views import error404,error500

handler404 = error404
handler500 = error500

urlpatterns.append(re_path(r'^(?P<lang>[a-z]{2})/(?P<string>.*)', shop.route ,name='router'))
urlpatterns.append(re_path(r'^(?P<string>.*)', shop.route ,name='router'))