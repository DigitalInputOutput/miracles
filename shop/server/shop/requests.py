from requests import session,get,post
from json import loads
from system.settings import HOME_DIR, BASE_URL

PROTOCOL = "http"
headers = {}
s = session()

def parse(response):
    try:
        json = loads(response.text)
        data = json.get('data')
        message = json.get('message')

        if type(data) is dict:
            token = data.get('csrf_token')
            if token:
                global headers
                headers = {'X-CSRFToken':token}
                print("Headers: %s" % headers)

        print(json)
        return 'ok'

    except Exception as e:
        print(response.status_code)
        print(e)
        if response.status_code == 401:
            return 'ok'

    log(str(response.text))

def log(text):
    with open(f"{HOME_DIR}/log/response.html",'w') as f:                              
        f.write(text)

def GET(url,auth=False):
    print(f'\nGET {url}')
    response = s.get(f"{BASE_URL}{url}",headers=headers)

    return parse(response)

def POST(url,json,auth=False):
    print(f'\nPOST {url}')
    response = s.post(f"{BASE_URL}{url}",json=json,headers=headers)

    return parse(response)


signup_data = {'phone':'+77011119725','city':'Kharkiv','birthday':'1990-02-27','lname':'Ivan','sex':1,'name':'Petrov','fcm_token':'fsfdsfsdff','age':28}

signin_data = {'phone':'+77011119725'}

sms_data = {'phone':'+77011119725','code':4027}

update_data = {'name':'Ivan','notifications':False}

feedback = {'message':'Ivan Petrov test feedback'}
