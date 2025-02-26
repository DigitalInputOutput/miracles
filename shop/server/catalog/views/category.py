from catalog.models import Product,Brand,Category,Attribute,Tag
from django.core.paginator import Paginator
from django.shortcuts import render
from django.views.generic import View
from itertools import chain
from catalog.clean import clean_filters
from django.db.models import Q
from json import dumps

class CategoryView(View): 
    def get(self,request,category,*args,**kwargs):
        filters, and_filters, exclude, ordering, page = clean_filters(request,category.id,model=Product)

        context = {
            'products':Product.objects.filter(Q(**filters) | Q(category__in=category.get_descendants(),**filters))[:20],
            'categories':category.get_descendants(),
            'breadcrumbs':category.breadcrumbs(lang=request.LANGUAGE_CODE),
            'and_filters':and_filters,
            'category':category
        }

        if category.parent:
            context['aside_categories'] = category.parent.get_descendants()
        else:
            context['aside_categories'] = Category.objects.filter(parent__isnull=True,active=True)

        template = 'catalog/%s/category.html'

        return render(request,template % request.folder,context)

class ProductsView(View): 
    def more_products(self):
        template = 'catalog/%s/more.html'
        context = {
            'products':products,
            'page':page,
        }

        return template,context

    def list_products(self):
        products = self.get_products_list(filters, and_filters, exclude)
        products = self.order_by(ordering)
        
        filters['is_available'] = False

        unproducts = self.get_products_list(filters, and_filters, exclude)

        result_products = list(chain(products,unproducts))

        paginator = Paginator(result_products, 30)
        try:
            products = paginator.page(page or 1)
        except:
            products = []

        context = {
            'category':category,
            'breadcrumbs':category.breadcrumbs(lang=request.LANGUAGE_CODE),
            'num_pages':paginator.num_pages
        }

        if category.parent:
            context.update({
                'aside_categories':category.parent.get_descendants()
            })
        else:
            context.update({
                'aside_categories':Category.objects.filter(parent__isnull=True,active=True)
            })

        brands = {'product__category':category,'product__is_available':True}

        if result_products:
            prices = []
            for product in result_products:
                if product.price:
                    prices.append(product.price)

            if prices:
                context.update({
                    'min_price':min(prices),
                    'max_price':max(prices)
                })

        del filters['is_available']

        context.update({
            'page':page,
            'products':products,
            'category_id':category.id,
            'attributes':Attribute.objects.filter(category=category),
            'brands':Brand.objects.filter(**brands).distinct(),
            'tags':Tag.objects.filter(products__category=category).distinct(),
            'filters':dumps(filters),
            'and_filters':and_filters
        })

        template = 'catalog/%s/products.html'

        return template,context

    def get_products_list(self,filters, and_filters, exclude):
        products = Product.objects.filter(**filters).exclude(**exclude).distinct()

        if and_filters.get('attributes__id'):
            for item in and_filters.get('attributes__id'):
                products = products.filter(**{'attributes__id':item})

        return products

    def order_by(self,ordering):
        if ordering:
            products = products.order_by(ordering,'storage','-is_top','-last_modified')
        else:
            products = products.order_by('storage','-is_top','-last_modified')

        return products

    def get(self,request,category,*args,**kwargs):
        filters, and_filters, exclude, ordering, page = clean_filters(request,category.id,model=Product)

        if category.is_leaf_node():
            if is_ajax(request):
                self.more_products()
            else:
                self.list_products()

        return render(request,self.template % request.folder, context)