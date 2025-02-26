# -*- coding: utf-8 -*-
from shop.services import ContextBuilder

def default(request):
    context_builder = ContextBuilder(request)
    context_builder.build_default_context()
    context = context_builder.build_shop_context()

    return context

def meta(request):
    context_builder = ContextBuilder(request)
    context_builder.build_default_context()
    context_builder.build_shop_context()
    context = context_builder.build_meta_context(request.path)

    return context