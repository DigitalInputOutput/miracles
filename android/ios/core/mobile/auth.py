from user.auth import login
from json import loads
from mobile.forms import TokenForm
from user.models import User

def authenticate(request):
    data = loads(request.body.decode('utf8'))
    device_id = data.get('device_id')

    if not device_id:
        return {'success':0,'errors':'Авторизация не удалась.'}

    try:
        user = User.objects.get(device_id=device_id)
    except User.DoesNotExist:
        form = TokenForm(data)

        if form.is_valid():
            user = User.objects.create(device_id=device_id)
        else:
            return {'success':0,'errors':form.errors}

    login(request,user)

    data = {'success':1,'data':{'user':user.dict()}}
    data['data']['csrf_token'] = request.META['CSRF_COOKIE']

    return data