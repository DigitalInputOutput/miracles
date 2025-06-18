from django.shortcuts import render
from subprocess import Popen, PIPE
from system.settings import CACHE_DIR,DOMAIN
from manager.models import Task
from django.http import JsonResponse
from json import dumps
from user.models import User
from checkout.models import Order
from datetime import datetime,timedelta
from django.db.models import Count

import shutil

__all__ = ['index','drop_cache','task']

def drop_cache(request):
    try:
        shutil.rmtree(CACHE_DIR + '/html')

        proc = Popen(['/shop/{DOMAIN}/ffs.sh'.format(DOMAIN=DOMAIN)], stdin=PIPE, stdout=PIPE, stderr=PIPE)
        output, error = proc.communicate()
        with open('process.log','wb') as f:
            f.write(output + error)

        return JsonResponse({'result':True})
    except Exception as e:
        return JsonResponse({'result':False,'errors':str(e)})

def task(request):
    try:
        task = Task.objects.get(id=request.GET.get('id'))
        task.status = 1
        task.save()
        task.apply_async()
    except Exception as e:
        return JsonResponse({'result':False,'errors':str(e)})

    return JsonResponse({'result':True})

def index(request):
    context = {
        'tasks':Task.objects.all(),
        'context':dumps({
            'users':list(User.objects.filter(created_at__gte=datetime.now() - timedelta(days=7))
                    .extra({'created_at' : "date_format(created_at,'%%a')"})
                    .values('created_at').annotate(users=Count('id'))
                ),
            'orders':list(Order.objects.filter(created_at__gte=datetime.now() - timedelta(days=7))
                    .extra({'created_at' : "date_format(created_at,'%%a')"})
                    .values('created_at').annotate(users=Count('id'))
                )
            })
        ,
        'panel':'main/panel/settings.html',
        'panel_shortcuts':'main/panel/shortcuts/settings.html'
    }

    return render(request,'main/settings.html',context)