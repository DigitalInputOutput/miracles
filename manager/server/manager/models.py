from django.db import models
from catalog.models import Product
from math import ceil
from django.utils.translation import gettext_lazy as _
from bs4 import BeautifulSoup

class Task(models.Model): 
    name = models.CharField(max_length=100,null=True,unique=True)
    status_choices = (
        (1,_('В обробці')),
        (2,_('Виконано'))
    )
    status = models.PositiveIntegerField(choices=status_choices,default=2)
    link = models.CharField(max_length=100,null=True)
    function = models.CharField(max_length=100,null=True)

    def apply_async(self):
        return eval(self.function).apply_async((self.id,))

    def __str__(self):
        return self.name

    def __repr__(self):
        return self.name

class Export(models.Model): 
    name = models.CharField(max_length=100)
    task = models.ForeignKey(Task,on_delete=models.SET_NULL,null=True)
    has_meta = models.BooleanField(default=False)

    @property
    def dict(self):
        return {'id':self.id,'name':self.name}

    def __str__(self):
        return self.name

    def __repr__(self):
        return self.name

class ExportStatus(models.Model): 
    @property
    def default_price(self):
        return ceil(self.product.price * 1.2)

    product = models.ForeignKey(Product,related_name="export_status",on_delete=models.CASCADE)
    export = models.ForeignKey(Export,default=1,null=True,on_delete=models.SET_NULL)
    load = models.BooleanField(default=0)
    price = models.PositiveIntegerField(default=0)

    def save(self,*args,**kwargs):
        if not self.price:
            self.price = self.default_price
        super().save(*args,**kwargs)

    def __str__(self):
        return self.product.name

    class Meta:
        unique_together = ('product','export')

class ExportMeta(models.Model): 
    @property
    def default_name(self):
        try:
            return self.export.product.description.values('name').filter(language__code='ua').first().get('name')
        except:
            return ''

    name = models.CharField(max_length=100,default='')
    text = models.CharField(max_length=10000)
    json_text = models.TextField(null=True)
    export = models.OneToOneField(ExportStatus,related_name='meta',on_delete=models.CASCADE)

    def clean(text):
        if not text:
            return ''
        return BeautifulSoup(text,features="lxml").get_text()

    def save(self,*args,**kwargs):
        self.text = ExportMeta.clean(self.text)

        if not self.name:
            self.name = self.default_name

        super().save(*args,**kwargs)

class Site(models.Model): 
    name = models.CharField(max_length=20)
    database = models.CharField(max_length=20)
    url = models.CharField(max_length=20)
    active = models.BooleanField(default=1)

    def __str__(self):
        return self.name

class GoogleFeed(models.Model): 
    product = models.OneToOneField(Product,on_delete=models.CASCADE)

    def __str__(self):
        return self.product.__str__()

class PriceFrmTo(models.Model): 
    frm = models.PositiveIntegerField()
    to = models.PositiveIntegerField()

    def __str__(self):
        return "%s - %s" % (self.frm,self.to)

class Percent(models.Model): 
    price = models.ForeignKey(PriceFrmTo,null=True,on_delete=models.CASCADE)
    percent = models.FloatField(verbose_name=_('Процентна націнка'))
    additional = models.PositiveIntegerField(null=True,default=0)

class AbstractStorage(models.Model): 
    templates = {
        'ru':{
            'Product':{
                'title_template':"{obj.name} оптом и в розницу Игротека",
                'meta_keywords_template':"{obj.name}, {obj.name} купить,{obj.name} цена,{obj.name} оптом,{obj.name} описание",
                'meta_description_template':"{obj.name}. {item.text_availability}. Доставка по всей Украине. Гарантия, сервис, отзывы. Постоянным клиентам Скидки"
            }
            ,
            'Category':{
                'title_template':"{obj.name} оптом и в розницу Харьков, Киев и вся Украина",
                'meta_keywords_template':"{obj.name} купить, {obj.name} цена, {obj.name}",
                'meta_description_template':"{obj.name} доставка по Харькову и всей Украине. Время обработки заказов с 9 до 18."
            },
            'Brand':{
                'title_template':"Товары {obj.name} купить в магазине Игротека. Оптом и в розницу, широкий выбор. Отзывы, гарантия, сервис",
                'meta_keywords_template':"{obj.name} купить, {obj.name} оптом, {obj.name} купить оптом",
                'meta_description_template':"Товары производителя {obj.name} в магазине Игротека. Широкий выбор, низкие цены, оптом и в розницу."
            }
        },
        'ua':{
            'Product':{
                'title_template':"{obj.name} оптом і в роздріб Ігротека",
                'meta_keywords_template':"{obj.name}, {obj.name} купити,{obj.name} ціна,{obj.name} оптом,{obj.name} опис",
                'meta_description_template':"{obj.name}. {item.text_availability}. Доставка по всій Україні. Гарантія, сервіс, відгуки. Постійним клиєнтам Знижки"
            },
            'Category':{
                'title_template':"{obj.name} оптом и в роздріб Харків, Київ і вся Україна",
                'meta_keywords_template':"{obj.name} купити, {obj.name} ціна, {obj.name}",
                'meta_description_template':"{obj.name} доставка по Харкову і усій Україні. Час відпрацювання замовлень з 9 до 18."
            },
            'Brand':{
                'title_template':"Товари {obj.name} купити в магазині Ігротека. Оптом і в роздріб, широкий вибір. Відгуки, гарантія, сервіс",
                'meta_keywords_template':"{obj.name} купити, {obj.name} оптом, {obj.name} придбати оптом",
                'meta_description_template':"Товари виробника {obj.name} в магазині Ігротека. Широкий вибір, низькі ціни, оптом і в роздріб."
            }
        }
    }

    @property
    def view(self):
        return self.__class__.__name__

    @property
    def modelName(self):
        return self.__class__.__name__

    def names(self,lang):
        return self.name

    name = models.CharField(max_length=100,verbose_name=_("Ім'я"))
    model = models.CharField(max_length=50,verbose_name=_('Артикул'))
    active = models.BooleanField(default=1,verbose_name=_('Актив.'))

    def __str__(self):
        return self.name

    class Meta:
        abstract = True

    @property
    def is_active(self):
        return '<div class="bool %s"></div>' % str(self.active).lower()

class Storage(AbstractStorage): 
    slug = None

    class Meta:
        verbose_name = _('Нові товари')
        verbose_name_plural = _('Нові товари')
        ordering = ['-active']