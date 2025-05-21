import importlib,sys,os
from celery import Celery

sys.path.append('/home/core/manager/core')

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

def clearQty(qty):
    q = ''
    for s in str(qty):
        if s.isdigit():
            q += s
    return int(q)

@app.task(bind=True)
def stock(self):
    from shop.models import Storage
    from yaml import load,Loader
    from catalog.models import Product

    verbose = False

    stream = open('/home/1c/stock.yml', 'r',encoding='utf-8')
    self.stock = load(stream,Loader=Loader)

    articles = [item['article'] for item in self.stock]

    Storage.objects.all().delete()

    for product in Product.objects.filter(storage=1).exclude(model__in=articles):
        product.is_available = False
        product.cache()

    response = ''

    for item in self.stock:
        try:
            if verbose:
                response += 'Поиск артикула:%s <br />' % item['article']
            product = Product.objects.get(model=item['article'].strip())
            if product.slug:
                product.is_available = True
            else:
                product.is_available = False
            product.storage = 1
            if type(item['qty']) is int:
                product.qty = item['qty']
            else:
                product.qty = float(item['qty'].replace('\xa0','').replace(',','.'))
            if product.qty < 0:
                product.qty = 0
            try:
                product.cache()
            except:
                raise Exception(product.qty)
        except Product.MultipleObjectsReturned:
            continue
        except Product.DoesNotExist:
            if verbose:
                response += '&nbsp;&nbsp;Поиск доп артикула:%s <br />' % item['article']
            try:
                product = Product.objects.get(add_model__model=item['article'].strip())
                if product.slug:
                    product.is_available = True
                else:
                    product.is_available = False
                product.storage = 1
                if type(item['qty']) is int:
                    product.qty = item['qty']
                else:
                    product.qty = float(item['qty'].replace('\xa0','').replace(',','.'))
                if product.qty < 0:
                    product.qty = 0
                try:
                    product.cache()
                except:
                    raise Exception(product.qty)
            except Product.MultipleObjectsReturned:
                if verbose:
                    response += '&nbsp;&nbsp;Множественный выбор:%s <br />' % item['article']
                continue
            except Product.DoesNotExist:
                if verbose:
                    response += '&nbsp;&nbsp;Новый товар:%s <br />' % item['article']
                try:
                    Storage.objects.get(model=item['article'])
                except Storage.DoesNotExist:
                    s = Storage.objects.create(name=item['name'],model=item['article'])
                    if verbose:
                        response += '&nbsp;&nbsp;Создан: %s <br />' % s.name
                    s.save()
                except Storage.MultipleObjectsReturned:
                    if verbose:
                        response += '&nbsp;&nbsp;Множественный выбор: %s <br />' % s.name
                    continue

@app.task(bind=True)
def prices(self):
    from system.settings import BASE_DIR
    from shop.models import Percent
    from math import ceil
    from yaml import load,Loader
    from catalog.models import Product

    def percent(price):
        try:
            percent = Percent.objects.get(price__frm__lt=price,price__to__gte=price)
        except:
            raise Exception(price)

        return ceil(price * percent.percent) + percent.additional

    def clearPrice(price):
        price = price.replace(',','.')
        price = price.replace(' ','')
        price = price.replace('\xc2\xa0','')
        price = price.replace('\xa0','')
        return ceil(float(price))

    def updatePrice(articles,product,price,bigopt,opt):
        articles = articles
        models = product.add_model.all()
        retail_price = percent(price)
        if retail_price != product.retail_price or bigopt != product.big_opt_price:
            product.cached = False
        product.retail_price = retail_price
        product.big_opt_price = bigopt
        for add in models:
            if add.model in articles:
                add_price = percent(articles[add.model]['price'])
                bigopt = articles[add.model]['bigopt']
                if add_price > product.retail_price:
                    product.retail_price = add_price
                    product.cached = False
                if bigopt > product.big_opt_price:
                    product.big_opt_price = bigopt
                    product.cached = False
        if opt > product.retail_price:
            product.retail_price = opt
            product.cached = False
        if not product.cached:
            product.cache()
        else:
            product.update()

    def retail_prices():
        products = Product.objects.filter(storage=1)

        with open(BASE_DIR + '/miracles.site/static/retail_prices.txt','w') as f:
            for p in products:
                f.write('%s\n' % p.model)
                f.write('%s\n' % p.price)

    with open('/home/1c/prices.yml','r',encoding='utf-8') as stream:
        items = load(stream,Loader=Loader)
        articles = {item['article']:{'price':clearPrice(item['price']),
                        'bigopt':clearPrice(item['bigopt']),'opt':clearPrice(item['opt'])} for item in items}

        for article in articles.keys():
            prices = articles[article]
            try:
                product = Product.objects.get(model=article)
                if product.price_fixed:
                    continue
                product.purchase_price = prices['price']
                updatePrice(articles,product,prices['price'],prices['bigopt'],prices['opt'])
            except Product.DoesNotExist:
                continue
            except Product.MultipleObjectsReturned:
                continue

        retail_prices()

@app.task(bind=True)
def rozetka(self,task_id):
    from manager.tasks import rozetka

    rozetka(task_id)

@app.task(bind=True)
def hotline(self,task_id):
    from manager.tasks import hotline

    hotline(task_id)

@app.task(bind=True)
def np(self,task_id):
    from manager.tasks import np

    np(task_id)