from django.urls import re_path
# from blog.views import ArticleView

from catalog.views import *

urlpatterns = [
    re_path(r'^quick_view/(?P<id>[0-9]+)$',Quick_View.as_view(),name='quick'),
    re_path(r'^search/',search,name="search"),
    re_path(r'^pricelist/$',PriceList.as_view(),name="pricelist"),
    re_path(r'^brands/$',BrandsView.as_view(),name="brands"),
    re_path(r'^category/(?P<id>[0-9]+)',CategoryView.as_view(),name="category"),
    re_path(r'^product/(?P<id>[0-9]+)',ProductView.as_view(),name="product"),
    # re_path(r'^article/(?P<id>[0-9]+)',ArticleView.as_view(),name="article"),
    re_path(r'^feedback',FeedbackView.as_view(),name="feedback"),
    re_path(r'^rating/(?P<id>[0-9]+)/(?P<value>[1-5])',rating)
]