# -*- coding=utf-8 -*-
from shop.forms import ReviewForm
from django.views.generic import View
from catalog.models import Product,Offer
from shop.models import Slider,Review,Robots,Settings
from django.template.loader import render_to_string
from django.shortcuts import render
from django.core.paginator import Paginator, EmptyPage
from django.http import HttpResponseNotFound,HttpResponseServerError,JsonResponse,HttpResponse
from json import loads

def maintenance(request):
    return render(request,f'main/{request.device}/maintenance.html')

class HomeView(View): 
    def get(self,request,*args,city=None,**kwargs):
        latest = Product.objects.filter(url__isnull=False,is_available=True).order_by('-id')
        special = Product.objects.filter(special__gt=0,is_available=True)

        # if request.user.is_opt:
        #     latest = latest.filter(storage=1)
        #     special = special.filter(storage=1)

        itemSlice = 6 if request.device == 'desktop' else 4

        video_data = Settings.objects.values('video_url','video_banner').first()

        context = {
            'offers':Offer.objects.filter(product__is_available=True)[:itemSlice],
            'latest':latest[:itemSlice],
            'special':special[:itemSlice],
            'sliders':Slider.objects.all(),
        }

        if video_data:
            context.update({
                'video_url':video_data.get('video_url') or '',
                'video_banner':video_data.get('video_banner')
            })

        return render(request, f'main/{request.device}/home.html', context)

class MainView(HomeView): 
    pass

class InfoView(View): 
    def get(self,request,*args,**kwargs):
        context = {}
        if request.path == 'igrushki-optom':
            context['products'] = Offer.objects.filter(product__is_available=True)[:17]
        return render(request, f'main/{request.device}/page.html', context)

class GuestbookView(View): 
    def get(self,request,*args,**kwargs):
        context = {}
        reviews = Review.objects.filter(active=True).order_by('-id')
        paginator = Paginator(list(reviews), 9)
        try:
            context['reviews'] = paginator.page(request.GET.get('page') or 1)
        except EmptyPage:
            context['reviews'] = []
        return render(request, f'main/{request.device}/guestbook.html', context)

    def post(self,request,*args,**kwargs):
        if request.user.is_authenticated:
            form = ReviewForm(loads(request.body.decode('utf-8')))
            if form.is_valid():
                review = form.save()
                review.author = request.user.name
                review.save()
                return JsonResponse({'result':True})
            else:
                return JsonResponse({'result':False,'errors':form.errors})
        else:
            return JsonResponse({'result':False,'authenticate':True})

class RobotsView(View): 
    def get(self,request,*args,**kwargs):
        if 'm' in request.get_host().split('.'):
            robots = Robots.objects.get(mobile=True)
        else:
            robots = Robots.objects.first()
        return HttpResponse(robots.body, content_type='text/plain')

class ConfirmView(View): 
    def get(self,request,*args,**kwargs):
        try:
            response = render_to_string(kwargs.get('name'))
        except Exception as e:
            response = '' #str(e) + str(kwargs.get('name'))

        return HttpResponse(response, content_type='text/plain')

def error404(request, exception):
    return HttpResponseNotFound(render(request, f'main/{request.device}/404.html'))

def error500(request):
    return HttpResponseServerError(render(request, f'main/{request.device}/500.html'))