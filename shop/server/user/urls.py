from django.urls import re_path
from user.views import *
from user.decorators import login_required

urlpatterns = [
    re_path(r'^logup/$', LogupView.as_view(),name='logup'),
    re_path(r'^profile/$', login_required(ProfileView.as_view()), name="profile"),
    re_path(r'^order/(?P<id>[0-9]+)$', login_required(OrderView.as_view()), name="order"),
    re_path(r'^login/$', LoginView.as_view(), name="login"),
    re_path(r'^logout/$', logout, name="logout"),
    re_path(r'^forget-password/$',forget_password,name='forget-pass'),
    re_path(r'^change-password$',ChangePasswordView.as_view(),name='change-password'),
    re_path(r'^pay/callback$',pay_callback),
    re_path(r'^favorite/',favorite),
    re_path(r'^compare/',compare)
]