import importlib,sys,os
from celery import Celery

sys.path.append('/manager/core')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')

app = Celery('miracles',backend='redis://127.0.0.1',broker='redis://127.0.0.1:6379/1')

@app.task(bind=True)
def google_merchant(self,task_id):
    from manager.tasks import google_merchant

    google_merchant(task_id)

@app.task(bind=True)
def facebook_merchant(self,task_id):
    from manager.tasks import facebook_merchant

    facebook_merchant(task_id)

@app.task(bind=True)
def currency_prices(self,task_id):
    from manager.tasks import currency_prices

    currency_prices(task_id)