from django import forms

from shop.models import Info,InfoDescription,Description,CityDescription,Url, \
    Currency,City,DefaultMetaData,Robots,Redirect,Language,Settings, \
    Slider,Sms
from catalog.models import ProductDescription,CategoryDescription, \
BrandDescription,TagDescription,Popular,Category, \
Featured,Product,Brand,Special,Gallery,Offer, \
Special,Attribute,Value,Brand,Product,Tag

from manager.widgets import *
from manager.translit import translit as slugify
from manager.fields import AutocompleteSelectField,AutocompleteSelectMultipleField,ImageField
from user.models import User
from manager.models import Task,Site,GoogleFeed,Storage,Percent,Price,Export
from json import loads
from checkout.models import Department,Seat,Cart,Item
from system.settings import STORAGE_CHOICES,BASE_URL
import re
from requests import get

from .utils import BetterModelForm

from html import unescape
from bs4 import BeautifulSoup as parser

from django.utils.translation import gettext_lazy as _

__all__ = ['PageDescriptionForm','CityDescriptionForm','CategoryDescriptionForm',
            'BrandDescriptionForm','ProductDescriptionForm','TagDescriptionForm',
            'ArticleDescriptionForm','StorageDescriptionForm',
            'SiteForm','CityForm','ArticleForm','SmsForm','MetaForm',
            'GoogleFeedForm','SettingsForm','PercentForm','ProductForm',
            'Prom_Category_Form','UserForm','OfferForm','PopularForm','SpecialForm',
            'BrandForm','GalleryForm','AttributeForm','RobotsForm','UrlForm',
            'TagForm','RedirectForm','CurrencyForm','SeatForm','ExportForm','TaskForm'
        ]

from checkout.forms import CheckoutForm
from .widgets import SelectInputWidget
from django import forms
from checkout.models import Order

class TaskForm(BetterModelForm): 
    class Meta:
        model = Task
        fields = '__all__'

class ExportForm(BetterModelForm): 
    def __init(self,*args,**kwargs):
        super().__init__(*args,**kwargs)
        self.fields['task'].required = False

    class Meta:
        model = Export
        fields = '__all__'

class SeatForm(BetterModelForm): 
    class Meta:
        model = Seat
        fields = '__all__'
        exclude = ['order','specialCargo']

class CurrencyForm(BetterModelForm): 
    class Meta:
        model = Currency
        fields = '__all__'

class SliderForm(BetterModelForm): 
    def __init__(self,*args,**kwargs):
        super().__init__(*args,**kwargs)

    class Meta:
        model = Slider
        fields = '__all__'
        fieldsets = [
                    ('main', {'fields':['name','path','position'],'legend':''}),
                    ('image', {'fields':['image'],'legend':_('Зображення')}),
                ]

class PercentForm(BetterModelForm): 
    frm = forms.IntegerField(
        label=_('Від'))
    to = forms.IntegerField(
        label=_('До'))
    price = forms.ModelChoiceField(
        label='',
        widget=forms.HiddenInput(),queryset=Price.objects.all())

    def save(self,*args,**kwargs):
        percent = super().save(*args,**kwargs)
        price = percent.price or Price()
        price.frm = self.cleaned_data.get('frm')
        price.to = self.cleaned_data.get('to')
        price.save()

        percent.price = price
        percent.save()

        return percent

    def __init__(self,*args,**kwargs):
        super().__init__(*args,**kwargs)
        self.fields['price'].required = False
        if self.instance.price:
            self.fields['frm'].initial = self.instance.price.frm
            self.fields['to'].initial = self.instance.price.to

    class Meta:
        model = Percent
        fields = '__all__'
        fieldsets = [
                    ('main', {'fields':['frm','to','percent','price','additional'],'legend':_('Загальне')}),
                ]

class UrlForm(BetterModelForm): 
    slug = forms.CharField(
            widget=forms.TextInput(
                attrs={'placeholder': 'URL','autocomplete':'off'}),
            label='URL:',
            required=False
        )

    def __init__(self,*args,**kwargs):
        self.name = kwargs.get('name')
        if self.name:
            del kwargs['name']

        super().__init__(*args,**kwargs)

    def clean(self):
        data = super().clean()
        string = data['string']
        customView = data.get('customView') or self.instance.__class__.__name__

        if customView == 'Main' and string:
            string = ''

        elif not string and customView != 'Main':
            string = re.sub(r'[^a-z0-9-]+','',slugify(self.name,'uk').lower().replace('\\',''))

        if Url.objects.filter(string=string).exclude(model=self.instance.modelName,model_id=self.instance.id).exists():
            raise forms.ValidationError(_('URL вже існує.'))

        data['string'] = string

        return data

class CityForm(UrlForm): 
    def __init__(self,*args,**kwargs):
        super().__init__(*args,**kwargs)
        self.fields['description'].required = False

    class Meta:
        model = City
        fields = '__all__'
        fieldsets = [
                    ('main', {'fields':['slug'],'legend':''}),
                ]

# class ArticleForm(UrlForm):
#     products = AutocompleteSelectMultipleField(model=Product,label=_('Товар'))

#     def __init__(self,*args,**kwargs):
#         super().__init__(*args,**kwargs)
#         self.fields['description'].required = False

#     class Meta:
#         model = Article
#         fields = '__all__'
#         fieldsets = [
#                     ('main', {'fields':['slug','active'],'legend':''}),
#                     ('products',{'fields':['products'],'legend':_('Товари')})
#                 ]

class OrderForm(forms.ModelForm): 
    delivery_choices = (
        ('','-----'),
        (1,_('Нова пошта')),
        (2,_('Делівері')),
        (3,_('УкрПошта')),
        (4,_('Самовивіз')),
        (5,_("Доставка кур'єром")),
    )
    payment_choices = (
        ('','-----'),
        (1,_('Готівкою при отриманні')),
        (2,_('Приват 24'))
    )
    status_choices = (
        (1,_('Новий')),
        (2,_('Сплачено')),
        (3,_('Відміна')),
        (11,_('Liqpay Сплачено')),
        (10,_('Очік. товар')),
        (9,_('Спл. очік')),
        (7,_('На відправку')),
        (8,_('Відправлений')),
        (4,_("Нема зв'язку")),
        (5,_('Liqpay')),
        (6,_('Закритий'))
    )

    delivery_type = forms.CharField(
            label=_('Спосіб доставки*'),
            widget=CustomSelectWidget(
                attrs={'class': 'customSelect','autocomplete':'off'},
                choices=delivery_choices),
            required=True
        )
    payment_type = forms.CharField(
            label=_('Спосіб оплати*'),
            widget=CustomSelectWidget(
                attrs={'class': 'customSelect','autocomplete':'off'},
                choices=payment_choices),
            required=True
        )
    comment = forms.CharField(
            label=_('Уточнення до замовлення'),
            widget=forms.Textarea(
                attrs={'rows':4,'placeholder':_('Комментарій до замовлення'),
                'autocomplete':'off'}),
            required=False
        )
    name = forms.CharField(
            label=_("Ім'я"),
            widget=forms.TextInput(
                attrs={'placeholder':_("Ім'я"),'required':'','autocomplete':'off'}),
            required=False
        )
    lname = forms.CharField(
            label=_('Призвище'),
            widget=forms.TextInput(
                attrs={'placeholder':_('Призвище'),'required':'','autocomplete':'off'}),
            required=False
        )
    sname = forms.CharField(
            label=_('По батьк.'),
            widget=forms.TextInput(
                attrs={'placeholder':_('По батьк.'),'required':'','autocomplete':'off'}),
            required=False
        )
    email = forms.EmailField(
            label='Email',
            widget=forms.EmailInput(
                attrs={'placeholder':'Email'}),
            required=False
        )
    phone = forms.CharField(
            label=_('Телефон'),
            widget=forms.TextInput(
                attrs={'placeholder':_('Телефон')}
            ),
            required=False
        )
    address = forms.CharField(
            label=_('Адрес'),
            widget=forms.TextInput(
                attrs={'placeholder':_('Адрес')}
            ),
            required=False
        )
    status = forms.CharField(
            label=_('Статус'),
            widget=CustomSelectWidget(
                choices=status_choices
            ),
            required=False
        )
    items = forms.CharField(required=False)
    remove = forms.CharField(required=False)

    cargo_choices = (
        ('','Спецгруз?'),
        (0,'Нет'),
        (1,'Да'),
    )
    SpecialCargo = forms.CharField(
        widget=CustomSelectWidget(
            choices=cargo_choices
        ),
        label='Спецгруз?',
        required=False
    )

    def clean(self):
        data = super().clean()
        items = []
        remove = []
        if data.get('items'):
            items = eval(data.get('items'))

        if data.get('remove'):
            remove = eval(data.get('remove'))

        if self.cart_id:
            cart = Cart.objects.get(id=self.cart_id)
            for id in remove:
                cart.items.get(id=id).delete()
        else:
            cart = Cart.objects.create()

        for save in items:
            try:
                item = cart.items.get(product__id=save['id'])
                item.price = save['price']
                item.qty = save['qty']
                item.save()
            except Item.DoesNotExist:
                product = Product.objects.get(id=save['id'])
                item = Item.objects.create(cart=cart,product=product,price=save['price'],qty=save['qty'])

        cart.save(admin=True)
        data['cart'] = cart

        return data

    def __init__(self,*args,**kwargs):
        super().__init__(*args,**kwargs)
        self.fields['lname'].required = False
        self.fields['sname'].required = False
        self.fields['cart'].required = False
        self.fields['city'].required = False
        self.fields['delivery'].required = False
        self.fields['ttn'].required = False
        if kwargs.get('initial'):
            self.cart_id = kwargs.get('initial').get('cart_id')
        else:
            self.cart_id = None

    class Meta:
        model = Order
        fields = ('cart','delivery_type','delivery',
            'payment_type','status','comment','name','lname',
            'sname','phone','email','SpecialCargo')

class RobotsForm(BetterModelForm): 
    body = forms.CharField( widget=forms.Textarea )
    class Meta:
        model = Robots
        fields = '__all__'

class SettingsForm(BetterModelForm): 
    logo = ImageField(
        widget=ImageWidget(),
        label='Logo',
        required=False
        )

    wotermark = ImageField(
        widget=ImageWidget(),
        label='Wotermark',
        required=False
        )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['logo'].widget.model = self.instance
        self.fields['wotermark'].widget.model = self.instance
        self.fields['attention_message'].required = False
        self.fields['google_tag'].required = False
        self.fields['google_analytics'].required = False
        self.fields['google_verification'].required = False
        self.fields['google_adwords'].required = False
        self.fields['google_conversion'].required = False
        self.fields['facebook_id'].required = False
        self.fields['video_banner'].required = False
        self.fields['video_url'].required = False

    class Meta:
        model = Settings
        fields = '__all__'
        fieldsets = [
                    ('main', 
                        {'fields':['logo','wotermark','attention_message','video_banner','video_url'],
                        'legend':_('Загальне')}
                    ),
                    ('google', 
                        {'fields':['google_analytics','google_adwords','google_tag','google_conversion','google_verification','facebook_id'],
                        'legend':'Google'}
                    ),
                    ('novaposhtaUa',
                        {'fields':['api_key','phone'],
                        'legend':'novaposhtaUa'}
                    ),
                    ('contacts',
                        {'fields':['emails','phones'],
                        'legend':'Контакты'}
                    )

                ]
        exclude = ('sitemap_cache','senderRef','contactsRef')

class SiteForm(BetterModelForm): 
    class Meta:
        model = Site
        fields = '__all__'

class DefaultMetaDataForm(BetterModelForm): 
    class Meta:
        model = DefaultMetaData
        fields = '__all__'

class RedirectForm(BetterModelForm): 
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['new_path'].required = False

    class Meta:
        model = Redirect
        fields = '__all__'

class SmsForm(BetterModelForm): 
    text = forms.CharField( widget=forms.Textarea )
    class Meta:
        model = Sms
        fields = '__all__'

class UrlForm(BetterModelForm): 
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['slug'].required = False

    class Meta:
        model = Url
        fields = '__all__'

class AttributeForm(BetterModelForm): 
    category = AutocompleteSelectMultipleField(model=Category,help_text=None,
        label=_('Категорія'))
    values = forms.CharField(
        widget=FgkWidget(),
        label=_('Значення'),
        required=False
        )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['values'].widget.instance = self.instance
        self.fields['values'].widget.related_name = 'values'
        self.fields['values'].widget.model = 'value'
        self.fields['values'].widget.field = 'value'

    class Meta:
        model = Attribute
        fields = '__all__'

class GoogleFeedForm(BetterModelForm): 
    product = AutocompleteSelectField(model=Product,help_text=None,
        label='Товар')

    class Meta:
        model = GoogleFeed
        fields = '__all__'

class TagForm(UrlForm): 
    image = forms.CharField(
        widget=ImageWidget(),
        label='',
        required=False
        )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['image'].widget.model = self.instance
        self.fields['slug'].required = False
        self.fields['description'].required = False

    class Meta:
        model = Tag
        fields = '__all__'
        fieldsets = [
                    ('main', {'fields':['slug','image'],'legend':_('Загальне')}),
                ]

class BrandForm(UrlForm): 
    image = ImageField(
        widget=ImageWidget(),
        label='',
        required=False
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['image'].widget.model = self.instance
        self.fields['description'].required = False

    class Meta:
        model = Brand
        fields = '__all__'
        fieldsets = [
                    ('main', {'fields':['slug','country','active','h1','image'],'legend':_('Загальне')})
                ]

class LanguageForm(BetterModelForm): 
    image = forms.CharField(
        widget=ImageWidget(),
        label='',
        required=False
        )

    def __init__(self,*args,**kwargs):
        super().__init__(*args,**kwargs)
        self.fields['image'].widget.model = self.instance

    class Meta:
        model = Language
        fields = '__all__'
        fieldsets = [
                    ('main', 
                        {'fields':['name','code','ISOcode','path','image'],
                        'legend':_('Загальне')}
                    ),
                ]

class SpecialForm(BetterModelForm): 
    class Meta:
        model = Special
        fields = ('product','price')
        fieldsets = [
                    ('main', {'fields':['product','price'],'legend':_('Загальне')}),
                ]
    product = AutocompleteSelectField(model=Product,help_text=None,
        label='Товар')

class FeaturedForm(BetterModelForm): 
    class Meta:
        model = Featured
        fields = ('products','category')
        fieldsets = [
                    ('main', {'fields':['products','category'],'legend':_('Загальне')}),
                ]
    products = AutocompleteSelectMultipleField(model=Product,help_text=None,
        label='Товары')
    category = AutocompleteSelectField(model=Category,help_text=None,
        label=_('Категорія'))

class OfferForm(BetterModelForm): 
    class Meta:
        fields = ('product',)
        model = Offer
        fieldsets = [
                    ('main', {'fields':['product',],'legend':_('Загальне')}),
                ]
    product = AutocompleteSelectField(model=Product,help_text=None,
        label='Товар')

class PopularForm(BetterModelForm): 
    class Meta:
        fields = ('product',)
        model = Popular
        fieldsets = [
                    ('main', {'fields':['product',],'legend':_('Загальне')}),
                ]
    product = AutocompleteSelectField(model=Product,help_text=None,
        label='Товар')

class UserForm(BetterModelForm): 
    prefix = 'user'
    email = forms.EmailField(label=_("Email адреса"),
            widget=forms.TextInput(
                attrs={'placeholder':_('Email адреса'),'autocomplete':'email'}),
            required=False
        )
    phone = forms.CharField(max_length=10,
            label='Номер телефона:',
            widget=forms.TextInput(
                attrs={'placeholder': _('Формат: 0995556677'),
                    'title':_('Формат: 0995556677'),
                    'pattern':'0[0-9]{2}[0-9]{3}[0-9]{2}[0-9]{2}',
                    'autocomplete':'tel'}),
            required=True
        )
    password1 = forms.CharField(
            label='Новый пароль',
            widget=forms.PasswordInput(
                attrs={'placeholder': _('Новий пароль*')}),
            required=False
        )
    password2 = forms.CharField(
            label='Еще раз',
            widget=forms.PasswordInput(
                attrs={'placeholder': _('Ще раз*')}),
            required=False
        )
    price_type_choices = (
        (1,_('Роздрібна')),
        (2,_('Оптова')))
    price_type = forms.ChoiceField(
            choices=price_type_choices,
            widget=CustomSelectWidget()
        )

    def clean_password2(self):
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError(_("Паролі не співпадають"))
        return password2

    def save(self,*args,**kwargs):
        user = super().save(*args,**kwargs)
        password = self.cleaned_data['password1']
        again = self.cleaned_data['password2']
        if password and again and password == again:
            user.set_password(password)
            user.save()

        return user

    class Meta:
        model = User
        fields = ('name','email','phone','subscription','price_type')
        fieldsets = [
                    ('main', {
                        'fields':['name','email','phone','subscription','price_type'],
                        'legend':_('Загальні')}
                        ),
                    ('password', {
                        'fields':['password1','password2'],
                        'legend':_('Парол')}
                        ),
                ]

class GalleryForm(forms.Form): 
    image = forms.ImageField(required=True)

    class Meta:
        fields = ('image',)

class DescriptionForm(BetterModelForm): 
    name = forms.CharField(
            widget=forms.TextInput(
                attrs={'placeholder': _('Назва'),'autocomplete':'off'}),
            label='Name:'
        )
    text = forms.CharField(
            label=_('Опис:'),
            required=False
        )
    json_text = forms.CharField(label="",widget=forms.HiddenInput(),required=False)
    title = forms.CharField(
            widget=forms.TextInput(
                attrs={'placeholder': _('Title'),'autocomplete':'off'}),
            label='Title:',
            required=False
        )
    meta_description = forms.CharField(
            widget=forms.TextInput(
                attrs={'placeholder': 'Meta_Description','autocomplete':'off'}),
            label='Meta_Description:',
            required=False
        )
    meta_keywords = forms.CharField(
            widget=forms.TextInput(
                attrs={'placeholder': 'Meta_Keywords','autocomplete':'off'}),
            label='Meta_Keywords:',
            required=False
        )

    def __init__(self, *args, **kwargs):
        if not kwargs.get('instance') and kwargs.get('item'):
            try:
                kwargs['instance'] = self._meta.model.objects.first(name__icontains="(%s)" % kwargs.get('item').model,language=kwargs.get('initial').get('lang'))
            except:
                pass

            del kwargs['item']

        super().__init__(*args, **kwargs)
        initial = kwargs.get('initial')
        if initial and initial.get('lang'):
            self.lang = initial.get('lang')
            self.prefix = self.lang.code

    def clean_text(self):
        text = self.cleaned_data.get('text')
        if text:
            html = parser(text,'html.parser')
            text = html.__str__()
            for a in html.findAll('a'):
                if not a.get('href'):
                    text = text.replace(unescape(str(a)),a.text)
                    continue

                href = a.get('href').split('/')
                if ('http:' in href or 'https:' in href):
                    if not BASE_URL in href:
                        text = text.replace(unescape(str(a)),a.text)
                else:
                    href = a.get('href')
                    if href[0] == '/':
                        href = href[:1]

                    url = 'https://{BASE_URL}/{href}'.format(BASE_URL=BASE_URL,href=href)

                    r = get(url)
                    if r.status_code != 200:
                        text = text.replace(unescape(str(a)),a.text)

            for img in html.findAll('img'):
                if not img.get('src') or re.search(r'http(s)?://',img.get('src')):
                    text = text.replace(unescape(str(img)),'')
                    continue

            text = text.replace('https://'+BASE_URL,'')

        return text

    def clean_meta_description(self):
        meta_description = self.cleaned_data['meta_description']

        if meta_description and self._meta.model.objects.filter(meta_description=meta_description,language__code=self.prefix).exclude(id=self.instance.id).exists():
            raise forms.ValidationError(_("такий meta_description вже існує"))

        return meta_description

    def clean_title(self):
        title = self.cleaned_data['title']

        if title and self._meta.model.objects.filter(title=title,language__code=self.prefix).exclude(id=self.instance.id).exists():
            raise forms.ValidationError(_("такий title вже існує"))

        return title

    class Meta:
        fieldsets = [
                    ('main',{'fields':['name','title','meta_description','meta_keywords']}),
                    ('description', {'fields':['text','json_text'],'legend':_('Опис'),'classes':['description']})
        ]

class CategoryDescriptionForm(DescriptionForm): 
    class Meta:
        model = CategoryDescription
        fields = '__all__'

class BrandDescriptionForm(DescriptionForm): 
    class Meta:
        model = BrandDescription
        fields = '__all__'

class TagDescriptionForm(DescriptionForm): 
    class Meta:
        model = TagDescription
        fields = '__all__'

class ProductDescriptionForm(DescriptionForm): 
    class Meta:
        model = ProductDescription
        fields = '__all__'

class StorageDescriptionForm(ProductDescriptionForm): 
    pass

class CityDescriptionForm(DescriptionForm): 
    class Meta:
        model = CityDescription
        fields = '__all__'

class InfoDescriptionForm(DescriptionForm): 
    class Meta:
        model = InfoDescription
        fields = '__all__'

# class ArticleDescriptionForm(DescriptionForm):
#     class Meta:
#         model = ArticleDescription
#         fields = '__all__'

class InfoForm(UrlForm): 
    def __init__(self,*args,**kwargs):
        super().__init__(*args,**kwargs)
        self.fields['slug'].required = False
        self.fields['description'].required = False
        self.fields['position'].required = False

    class Meta:
        model = Info
        fields = '__all__'
        fieldsets = [
                    ('main', {'fields':['slug','customView','position'],'legend':''}),
                ]

class ProductForm(UrlForm): 
    height = forms.CharField(
        widget=forms.TextInput(
            attrs={'placeholder': _('Висота')}),
        label=_('Висота'),
        required=False
        )
    width = forms.CharField(
        widget=forms.TextInput(
            attrs={'placeholder': _('Ширина')}),
        label=_('Ширина'),
        required=False
        )
    length = forms.CharField(
        widget=forms.TextInput(
            attrs={'placeholder': _('Довжина')}),
        label=_('Довжина'),
        required=False
        )
    counter = forms.CharField(
        widget=forms.TextInput(
            attrs={'placeholder': _('Од. виміру')}),
        label=_('Од. виміру'),
        required=False
        )
    category = AutocompleteSelectMultipleField(model=Category,help_text=None,
        label=_('Категорії'),
        required=False
        )
    tags = AutocompleteSelectMultipleField(model=Tag,help_text=None,
        label=_('Теги'),
        required=False
        )
    is_available = forms.BooleanField(
        label=_('В наявності'),
        widget=SwitcherWidget(),
        required=False
        )
    featured = AutocompleteSelectMultipleField(model=Product,help_text=None,
        label=_('Схожі товари'),
        required=False
        )
    model = forms.CharField(
        widget=forms.TextInput(
            attrs={'placeholder': _('Артикул')}),
        label=_('Артикул'))
    retail_price = forms.FloatField(
        label=_('Роздрібна'),
        required=False
        )
    big_opt_price = forms.FloatField(
        label=_('Оптова'),
        required=False
        )
    special = forms.IntegerField(
        label=_('Спец.ціна'),
        required=False
        )
    brand = AutocompleteSelectField(model=Brand,help_text=None,
        label=_('Виробник'),
        required=False
        )
    gallery = forms.CharField(
        widget=GalleryWidget(),
        label='',
        required=False
        )
    add_model = forms.CharField(
        widget=FgkWidget(),
        label=_('Дод.артикули'),
        required=False
        )

    storage_choices = STORAGE_CHOICES

    storage = forms.ChoiceField(
        choices=storage_choices,
        label=_('Склад'),
        widget=CustomSelectWidget(),
        required=True
        )
    attributes = forms.ModelMultipleChoiceField(queryset=Value.objects.all(),
        widget=AttributesWidget(),label="",
        required=False
        )
    price_fixed = forms.BooleanField(label=_("Фікс. ціна"),
        widget=SwitcherWidget(),
        required=False,
        initial=False
        )
    is_top = forms.BooleanField(label=_("Підняти в топ?"),
        widget=SwitcherWidget(),
        required=False,
        initial=False
        )

    currency_choices = (
        (0,'UAH'),
        (1,'EUR'),
        (2,'USD')
    )
    currency = forms.ChoiceField(choices=currency_choices,
        label=_('Валюта'),
        widget=CustomSelectWidget(),required=True)

    class Meta:
        model = Product
        fields = '__all__'
        widgets = {
            'big_opt_price': forms.TextInput(
                attrs={'placeholder':_('Биг-опт.')}),
            'purchase_price': forms.TextInput(
                attrs={'placeholder':_('Закуп.')}),
        }
        fieldsets = [
                    ('main', {'fields':['slug','model','is_available','storage','last_modified'],'legend':_('Загальне'),'icon':'envelope-open-text'}),
                    ('prices', {'fields':['retail_price','big_opt_price','special','price_fixed','purchase_price','currency','counter'],'legend':_(_('Ціни')),'icon':'dollar-sign','classes':['prices']}),
                    ('related', {'fields':['category','brand','featured','add_model','tags'],'legend':_("Зв'язки"),'icon':'infinity'}),
                    ('attributes', {'fields':['attributes'],'legend':_('Атрибути'),'classes':['attributes'],'description':'dynamic','icon':'align-left'}),
                    ('parameters', {'fields':['height','width','length'],'legend':_('Параметри'),'classes':['parameters'],'icon':'paragraph'}),
                    ('gallery', {'fields':['gallery'],'legend':_('Зображення'),'classes':['gallery'],'icon':'images','description':'dynamic'}),
                ]

    def __str__(self):
        return self.fields['name'].value

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        obj = getattr(self, 'instance', None)
        if obj and hasattr(obj,'special'):
            self.fields['special'].initial = obj.special.price
        self.fields['gallery'].widget.model = self.instance
        self.fields['add_model'].widget.instance = self.instance
        self.fields['add_model'].widget.related_name = 'add_model'
        self.fields['add_model'].widget.model = 'add_model'
        self.fields['add_model'].widget.field = 'model'
        self.fields['storage'].widget.model = self.instance
        self.fields['attributes'].widget.instance = self.instance
        self.fields['rating'].required = False
        self.fields['qty'].required = False
        self.fields['description'].required = False
        self.fields['purchase_price'].required = False

    def save(self,*args,**kwargs):
        product = super().save(*args,**kwargs)
        try:
            if self.cleaned_data['special']:
                special = Special(product=product,price=self.cleaned_data['special'])
                special.save()
            elif hasattr(product, 'special') and not self.cleaned_data['special']:
                special = Special.objects.get(product=product)
                special.delete()
        except:
            pass

        return product

class StorageForm(ProductForm): 
    price_fixed = forms.BooleanField(
            label=_("Фікс. ціна"),
            widget=SwitcherWidget(),
            required=False,
            initial=False
        )

    def __init__(self,*args,**kwargs):
        self.name_product = kwargs.get('name')
        if self.name_product:
            del kwargs['name']

        super().__init__(*args,**kwargs)

    def clean(self):
        data = self.cleaned_data
        self.product = ProductForm(self.data,name=self.name_product)

        if not self.product.is_valid():
            raise forms.ValidationError(self.product.errors)

        return data

    def save(self,*args,**kwargs):
        product = self.product.save(commit=False)

        self.instance.delete()

        self.instance = product
        super().save(*args,**kwargs)

        return product

    class Meta:
        model = Product
        fields = '__all__'
        widgets = {
            'big_opt_price': forms.TextInput(
                attrs={'placeholder':_('Опт.')}),
        }
        fieldsets = [
                    ('main', {'fields':['slug','model','is_available','storage'],'legend':_('Загальне')}),
                    ('prices', {'fields':['retail_price','big_opt_price','purchase_price','special','price_fixed','currency'],'legend':_('Ціни'),'classes':['prices']}),
                    ('related', {'fields':['category','brand','featured','add_model','tags'],'legend':_("Зв'язки")}),
                    ('attributes', {'fields':['attributes'],'legend':_('Атрибути'),'classes':['attributes'],'description':'dynamic'}),
                    ('parameters', {'fields':['height','width','length'],'legend':_('Параметри'),'classes':['parameters']}),
                    ('gallery', {'fields':['gallery'],'legend':_('Зображення'),'classes':['gallery']}),
                ]

class TigresForm(StorageForm): 
    class Meta:
        model = Product
        fields = '__all__'
        widgets = {
            'big_opt_price': forms.TextInput(
                attrs={'placeholder':_('Опт.')}),
        }
        fieldsets = [
                    ('main', {'fields':['slug','model','is_available','storage'],'legend':_('Загальне')}),
                    ('prices', {'fields':['retail_price','big_opt_price','special','price_fixed'],'legend':_('Ціни'),'classes':['prices']}),
                    ('related', {'fields':['category','brand','featured','add_model','tags'],'legend':_("Зв'язки")}),
                    ('attributes', {'fields':['attributes'],'legend':_('Атрибути'),'classes':['attributes'],'description':'dynamic'}),
                    ('parameters', {'fields':['height','width','length'],'legend':_('Параметри'),'classes':['parameters']}),
                    ('gallery', {'fields':['gallery'],'legend':_('Зображення'),'classes':['gallery']}),
                ]