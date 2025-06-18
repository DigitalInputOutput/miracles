#!/usr/bin/python
# -*- coding: utf-8 -*-
import os
from re import sub
from PIL import Image
from mptt import register
from mptt.models import MPTTModel, TreeForeignKey
from django.db.models import CASCADE
from shop.models import Description,Page
from string import ascii_letters
from django.db.models import *
from system.settings import CACHE_FOLDER
from random import choice
from django.utils.translation import gettext_lazy as _
from shop.builder import PathBuilder

class CategoryDescription(Description): 
    class Meta:
        db_table = 'category_description'

class Category(MPTTModel,Page):
    description = ManyToManyField(CategoryDescription,related_name="obj")
    parent = TreeForeignKey('self', blank=True, null=True, verbose_name=_("Parent"),related_name="child", on_delete=CASCADE)
    image = ImageField(upload_to='category_image/', blank=True, null=True,verbose_name=_('Image'))
    last_modified = DateTimeField(auto_now_add=True)
    active = BooleanField(default=1,verbose_name=_('Active'))
    bgcolor = CharField(max_length=20,null=True)

    def menu_thumb(self,size=70):
        if not self.image:
            return

        path = PathBuilder.build_media_path(
            self.image.url
        )
        img = Image.open(path)
        img.thumbnail([size,size])

        return img

    @property
    def icon(self):
        return self.image_url(size=100)

    @property
    def productsCount(self):
        count = self.products.count()
        for child in self.child.all():
            count += child.products.count()

        return count

    def save(self,*args,**kwargs):
        if self.pk and self.active:
            for thumb in self.thumb.all():
                thumb.delete()

        super().save(*args,**kwargs)

    def image_url(self,size=230):
        try:
            image = Category_Thumb.objects.get(category_id=self.pk,size=size)
        except Category_Thumb.MultipleObjectsReturned:
            image = Category_Thumb.objects.filter(category_id=self.pk,size=size).first()
        except:
            image = None

        if image:
            if os.path.isfile(CACHE_FOLDER + image.url):
                return image.url
            else:
                image.delete()

        try:
            return self.thumbnail(size)
        except:
            pass

        return '/media/no_image_new.jpg'

    def thumbnail(self,size):
        image = Image.open(self.image)
        image.thumbnail([size,size])

        path = self.path(size)

        try:
            image = image.convert('RGBA')
            image.save(CACHE_FOLDER + path,'PNG')
        except:
            image = image.convert('RGB')
            image.save(CACHE_FOLDER + path,'JPEG')

        thumb = Category_Thumb.objects.create(url = '/' + path,category=self,size=size)

        return thumb.url

    def path(self,size):
        name = sub("[^a-zA-Z0-9А-Яа-я]", "", self.image.name.split('/')[-1])
        path = f'images/{name}/{size}{name[1]}/'
        root = CACHE_FOLDER + path
        if not os.path.isdir(root):
            try:
                os.makedirs(root)
            except FileExistsError:
                pass
        for i in range(0,32):
            path += choice(ascii_letters)
        return path + '.jpg'

    def similars(self):
        return Category.objects.filter(parent=self.parent).exclude(id=self.id)

    def get_ancestorsf(self,parent,categories):
        if parent.parent and parent.parent.parent:
            categories += (parent.parent,)
            return self.get_ancestorsf(parent.parent,categories)

        return reversed(categories)

    def ancestors(self):
        categories = ()

        if self.parent and self.parent.parent:
            categories += (self.parent,)
            return self.get_ancestorsf(self.parent,categories)

        return reversed(categories)

    def get_root(self,parent):
        if parent.parent:
            return self.get_root(parent.parent)

        return parent

    @property
    def root(self):
        if self.parent:
            return self.get_root(self.parent)
        else:
            return _('Product categories')

    def ancestors_breadcrumbs(self, parent, breadcrumbs, lang):
        breadcrumbs = breadcrumbs + ((parent.translate_name(lang),parent.url(lang)),)
        if parent.parent:
            return self.ancestors_breadcrumbs(parent.parent, breadcrumbs, lang)
        else:
            return breadcrumbs

    def breadcrumbs(self,lang,product = False):
        if self.parent is None:
            if product:
                return ((self.translate_name(lang),self.url(lang)),)
            else:
                return
        else:
            if product:
                breadcrumbs = ((self.translate_name(lang),self.url(lang)),)
                breadcrumbs = self.ancestors_breadcrumbs(self.parent, breadcrumbs, lang)
            else:
                breadcrumbs = self.ancestors_breadcrumbs(self.parent, (), lang)
            return reversed(breadcrumbs)

    class Meta:
        verbose_name = _('Category')
        verbose_name_plural = _('Categories')

class Category_Thumb(Model):
    category = ForeignKey(Category,related_name='thumb', on_delete=CASCADE)
    url = CharField(max_length=255)
    size = PositiveIntegerField()

    def __str__(self):
        return self.url

register(Category)