from django.http import HttpResponsePermanentRedirect
from urllib.parse import quote

class Login: 
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Code to be executed for each request before
        # the view (and later middleware) are called.

        response = self.get_response(request)

        # Code to be executed for each request/response after
        # the view is called.

        return response

    def process_view(self,request,view,*args,**kwargs):
        request.folder = 'desktop'
        print(request.session.items())

        if request.user.is_anonymous or not request.user.is_admin:
            if not request.path.startswith('/login') and not request.path.startswith('/logout'):
                next_url = quote(request.path)
                return HttpResponsePermanentRedirect(f'/login?next={next_url}')

        return None