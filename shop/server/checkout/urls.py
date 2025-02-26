from django.urls import re_path

from . import views

urlpatterns = [
    re_path(r'^order/$', views.OrderView.as_view(), name ='order'),
    re_path(r'^city/(?P<type>[0-9])/(?P<value>.*)$', views.CityView.as_view(), name='city'),
    re_path(r'^department/(?P<type>[0-9])/(?P<value>.*)/(?P<city>[0-9]+)$', views.DepartmentView.as_view(), name='department'),
    re_path(r'^department/(?P<type>[0-9])/(?P<city>[0-9]+)$', views.DepartmentView.as_view(), name='department'),
    re_path(r'^quick_order/(?P<id>[0-9]+)/(?P<qty>[0-9]+)$', views.CallbackView.as_view(), name='quick_order'),
    re_path(r'^remove/(?P<id>[0-9]+)/', views.remove, name='remove'),
    re_path(r'^callback/$',views.CallbackView.as_view(),name='callback'),
    re_path(r'^callback/(?P<id>[0-9]+)$',views.CallbackView.as_view(),name='callback'),
    re_path(r'^', views.CheckoutView.as_view(), name ='checkout'),
]