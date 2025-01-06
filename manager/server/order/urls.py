from django.urls import re_path,path
from .views import *

urlpatterns = [
    path('ttn',ttn),
    path('tracking',tracking),
    re_path(r'^mass_sms/(?P<type>[a-zA-Z]+)',mass_sms),
    re_path(r'^track/(?P<id>[0-9]+)',track),
    re_path(r'^sms/(?P<id>[0-9]+)/(?P<type>[a-zA-Z]+)',sms),
    re_path(r'^search/(?P<query>[a-zA-Z0-9\-\/\_а-яА-Я\[\]\.\, ]+)',CartView.as_view()),
    re_path(r'^add/(?P<product_id>[0-9]+)/(?P<order_id>[0-9]+)',add),
    re_path(r'^remove/(?P<id>[0-9]+)',remove)
]