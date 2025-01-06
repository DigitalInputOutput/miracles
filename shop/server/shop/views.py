from django.shortcuts import render
from django.http import JsonResponse
from manager.forms import FeedbackForm
from django.views.generic import View

def index(request):
    return render(request, 'index.html')

class FeedbackView(View): 
    def get(self,request,*args,**kwargs):
        return render(request, 'feedback.html')

    def post(self,request,*args,**kwargs):
        form = FeedbackForm(request)

        if form.is_valid():
            return JsonResponse({'result':True})

        return render(request,'feedback.html', {'form':form})
