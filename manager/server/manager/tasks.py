from shop.models import Task
from system.settings import BASE_DIR,DOMAIN,CACHE_URL
from bs4 import BeautifulSoup
from catalog.models import Product,Currency
from math import ceil
import shutil

text = '{model}\t{title}\t{description}\t{link}\t{image_link}\t{availability}\t{price}\t{brand}\t{category}'
text_facebook = '{model}\t{title}\t{description}\t{link}\t{image_link}\t{availability}\t{price}\t{brand}\t{category}\t{condition}'

domain = 'https://%s/' % DOMAIN
domain_image = 'https://%s' % DOMAIN

def google_merchant(task_id):
    with open('{BASE_DIR}/{DOMAIN}/static/google_feed.txt'.format(BASE_DIR=BASE_DIR,DOMAIN=DOMAIN),'w') as f:
        f.write('id\ttitle\tdescription\tlink\timage_link\tavailability\tprice\tbrand\tgoogle product category')
        f.write('\n')
        products = Product.objects.filter(is_available=True,export_status__load=True,export_status__export__task__id=task_id)

        print(products)

        for product in products:
            description = product.description.filter(language__code='ru').first() or ''
            if description:
                try:
                    description = BeautifulSoup(description.text, "html.parser").text.replace('\n','').replace('\t','')[:5000]
                except:
                    description = ''
            f.write(text.format(model=product.model,title=product.names(lang='ru'),description=description,link=domain + product.slug,image_link=domain_image + product.image.list_thumb,availability=product.google_availability,price=str(product.price) + ' UAH',brand=product.brand_name,category=product.google_category_name()))
            f.write('\n')

    task = Task.objects.get(id=task_id)
    task.status = 2
    task.save()

def facebook_merchant(task_id):
    with open('{BASE_DIR}/{DOMAIN}/static/facebook_feed.txt'.format(BASE_DIR=BASE_DIR,DOMAIN=DOMAIN),'w') as f:
        f.write('id\ttitle\tdescription\tlink\timage_link\tavailability\tprice\tbrand\tgoogle product category\tcondition')
        f.write('\n')
        for product in Product.objects.filter(is_available=True,export_status__load=True,export_status__export__task__id=task_id):
            description = product.description.filter(language__code='ru').first() or ''
            if description:
                try:
                    description = BeautifulSoup(description.text, "html.parser").text.replace('\n','').replace('\t','')[:5000]
                except:
                    description = ''
            f.write(text_facebook.format(model=product.model,title=product.names(lang='ru'),description=description,link=domain + product.slug,image_link=domain_image + product.image.list_thumb,availability=product.google_availability,price=str(product.price) + ' UAH',brand=product.brand_name,category=product.google_category_name(),condition='new'))
            f.write('\n')

    task = Task.objects.get(id=task_id)
    task.status = 2
    task.save()

def currency_prices(task_id):
    for p in Product.objects.filter(currency=0):
        p.retail_price = ceil(p.retail_price)

        p.update()

    for p in Product.objects.exclude(currency=0):
        cur = Currency.objects.get(type=p.currency)
        p.retail_price = ceil(p.purchase_price * cur.value)

        p.update()

    shutil.rmtree(CACHE_URL + 'cache/html')

    task = Task.objects.get(id=task_id)
    task.status = 2
    task.save()