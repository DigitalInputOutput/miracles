from django.urls import re_path, path
from .views import *
from user.views import logout
from manager.views.login import LoginView
from rest_framework import routers

router = routers.SimpleRouter()
router.register(r'api/Item', ItemViewSet)
router.register(r'api/Product', ProductViewSet)

urlpatterns = [
    re_path(r'^autocomplete/(?P<admin_model>[a-zA-Z]+)/(?P<value>.*)$',autocomplete),
    re_path(r'^delivery/city/(?P<type>[0-9])/(?P<value>.*)$',city),
    re_path(r'^delivery/departament/(?P<type>[0-9])/(?P<city_id>[0-9]+)/$',departments),
    re_path(r'^delivery/departament/(?P<type>[0-9])/(?P<city_id>[0-9]+)/(?P<value>.*)$',departments),
    re_path(r'^search/(?P<admin_model>[a-zA-Z]+)$',search),
    re_path(r'^gallery/(?P<admin_model>[a-zA-Z]+)/(?P<id>[0-9]+)/ordering$',ordering),
    re_path(r'^(?P<admin_model>[A-Z][a-zA-Z]+)$',List.as_view()),
    re_path(r'^(?P<admin_model>[A-Z][a-zA-Z]+)/$',AddView.as_view()),
    re_path(r'^(?P<admin_model>[A-Z][a-zA-Z]+)/(?P<id>[0-9]+)$',EditView.as_view()),
    re_path(r'^change_database',change_database),
    re_path(r'^task$',task),
    re_path(r'^drop_cache',drop_cache),
    re_path(r'^action/(?P<product_id>[0-9]+)/availability$',availability),
    re_path(r'^action/(?P<type>[a-z]+)$',action),

    path('login', LoginView.as_view()),
    path('logout',logout),

    re_path(r'^product/(?P<product_id>[0-9]+)/info$',product_export),
    re_path(r'^product/(?P<product_id>[0-9]+)/update$',product_update_export),

    re_path(r'^$',index)
]

urlpatterns += router.urls