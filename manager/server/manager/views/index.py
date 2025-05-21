from django.shortcuts import render
from subprocess import Popen, PIPE
from system.settings import MEDIA_ROOT,BASE_DIR,CACHE_URL,DOMAIN
from manager.models import Task
from django.http import JsonResponse
from tasks import google_merchant,facebook_merchant,prices,stock
from json import dumps
from user.models import User
from checkout.models import Order
from datetime import datetime,timedelta
from django.db.models import Count

import shutil
from os.path import isfile
from ast import literal_eval

try:
    from tasks import currency_prices
except:
    pass

__all__ = ['index','drop_cache','task']

def drop_cache(request):
    try:
        shutil.rmtree(CACHE_URL + 'cache/html')

        proc = Popen(['/home/core/shop/{DOMAIN}/ffs.sh'.format(DOMAIN=DOMAIN)], stdin=PIPE, stdout=PIPE, stderr=PIPE)
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
    # media_total = system('du -h %s' % MEDIA_ROOT)
    # media = system('du -h --max-depth=1 %s' % MEDIA_ROOT)
    # total = system('df -h /')

    # proc = Popen([BASE_DIR + '/core/monitor.sh'], stdin=PIPE, stdout=PIPE, stderr=PIPE)
    # output, err = proc.communicate()
    # data = output.decode('utf8').replace('\n','').split(' ')

    context = {
        # 'memory_total':data[0],
        # 'memory_used':data[1],
        # 'memory_left':data[2],
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