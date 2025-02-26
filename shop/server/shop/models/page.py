from django.db.models import Model,BooleanField,CharField
import os
from glob import glob
from system.settings import CACHE_FOLDER,LANGUAGE_CODE
from shop.models import Url,Redirect,Language
from shop.models import Description
from django.utils import timezone
from google.cloud import translate_v2

class Page(Model): 
    cached = BooleanField(default = False)
    customView = None
    url = CharField(max_length=255, null=True, verbose_name='URL', unique=True)

    class Meta:
        abstract = True

    def autocomplete_dict(self, lang):
        return {
            'id':self.id,
            'name':self.translate_name(lang = lang),
        }
    
    def translate_url(self, lang):
        if lang:
            return f'/({lang}/{self.url}'

        return f'/{self.url}'

    def translate_name(self, lang):
        try:
            return self.description.get(language__code = lang).name
        except:
            try:
                return self.description.all().first().name
            except:
                try:
                    return self.name
                except:
                    return ''

    @property
    def description(self):
        try:
            return super().description.filter().first()
        except Description.DoesNotExist:
            return super().description

    @property
    def view(self):
        return self.customView or self.modelName

    @property
    def modelName(self):
        return self.__class__.__name__

    @property
    def title(self):
        return self.__str__()

    @property
    def meta_description(self):
        return self.__str__()

    @property
    def meta_keywords(self):
        return self.__str__()

    def name(self,lang = LANGUAGE_CODE):
        return self.description.filter(language__code=lang).name

    def __str__(self,lang = LANGUAGE_CODE):
        return f'/{lang}/{self.url}'
    
    def save(self,*args,**kwargs):
        self.cached = False
        self.check_string()
        self.last_modified = timezone.now()
        
        # self.update_string()

        super().save(*args,**kwargs)

        self.cache()

    def delete(self,*args,**kwargs):
        self.cache()

        try:
            if self.url:
                url = Url.objects.filter(model=self.modelName,model_id=self.id).delete()
        except Url.DoesNotExist:
            pass

        for d in self.description.all():
            d.delete()

        super().delete(*args,**kwargs)

    def cache(self,verbose = False):
        from shop.models import Info

        for device in ['mobile','desktop']:
            for lang in Language.objects.all():
                lang = lang.code

                if isinstance(self,Info):
                    pattern = '{CACHE_FOLDER}cache/html/{device}/{lang}/static/'.format(device=device,lang=lang,CACHE_FOLDER=CACHE_FOLDER)
                else:
                    if not self.url:
                        return

                    if len(self.url) > 4:
                        pattern = '{CACHE_FOLDER}cache/html/{device}/{lang}/{string[3]}/{string[4]}/'.format(device=device,lang=lang,string=str(self.url).replace('/',''),CACHE_FOLDER=CACHE_FOLDER)
                    elif len(self.url) > 2:
                        pattern = '{CACHE_FOLDER}cache/html/{device}/{lang}/{string[1]}/{string[2]}/'.format(device=device,lang=lang,string=str(self.url).replace('/',''),CACHE_FOLDER=CACHE_FOLDER)
                    else:
                        pattern = '{CACHE_FOLDER}cache/html/{device}/{lang}/m/a/'.format(device=device,lang=lang,string=str(self.url).replace('/',''),CACHE_FOLDER=CACHE_FOLDER)

                if self.url:
                    pattern += str(self.url).replace('/','') + '*'
                else:
                    pattern += 'index*'

                if verbose:
                    print(pattern)
                for f in glob(pattern):
                    if verbose:
                        print(f)
                    if os.path.isfile(f):
                        os.remove(f)

        try:
            self.description.order_by('last_modified').last().save()
        except:
            self.last_modified = timezone.now()
        self.cached = False
        super().save()

    def date(self):
        try:
            return str(self.description.all().first().last_modified.date())
        except:
            return str(self.last_modified.date())

    def image_url(self):
        try:
            return self.image.url
        except:
            return '/static/no_image.jpg'

    @property
    def meta_image(self):
        try:
            return self.image.url
        except:
            return '/static/no_image.jpg'

    def __repr__(self):
        return self.__str__()

    @property
    def name(self):
        return self.__str__()

    @property
    def get_description(self):
        try:
            return self.description.first().text
        except:
            return ''

    def translate(self,src,dst):
        translator = translate_v2.client.Client()
        src = self.description.get(language__ISOcode=src)
        dst = self.description.get_or_create(language__ISOcode=dst)

        text = translator.translate(
            src.name,
            source_language=src.ISOCode(),
            target_language=dst.ISOCode()
        )

        dst.name = text.get('translatedText')
        dst.save()

        self.description.add(dst)

    def template_meta(self):
        for d in self.description.all():
            d.title = ''
            d.meta_description = ''
            d.meta_keywords = ''

            d.save()


    def add_redirect(self,old_string,new_string):
        if old_string != new_string:
            try:
                Redirect.objects.get(old_string=old_string,new_path=new_string)
            except Redirect.DoesNotExist:
                Redirect.objects.create(old_string=old_string,new_path=new_string)

            Url.objects.filter(string=old_string).delete()

    def check_string(self):
        if self.pk:
            try:
                string = Url.objects.get(model_id=self.pk,model=self.modelName,view=self.view)
                if self.url != string.string:
                    self.add_redirect(string.string, self.url)
            except Url.MultipleObjectsReturned:
                old = Url.objects.filter(model_id=self.pk,model=self.modelName,view=self.view).exclude(string=self.url).first()
                Url.objects.filter(model_id=self.pk,model=self.modelName,view=self.view).delete()
                Url.objects.create(model_id=self.pk,model=self.modelName,view=self.view,string=self.url)
                if old:
                    self.add_redirect(old, self.url)
            except Url.DoesNotExist:
                return

    @property
    def h1(self):
        return self.name

    # def update_string(self):
    #     try:
    #         string = Url.objects.get(string=self.url,model=self.modelName,model_id=self.id)
    #         if string.view != self.view:
    #             string.view = self.view
    #             string.save()
    #     except Url.DoesNotExist:
    #         if self.view == 'Main' and not self.url:
    #             Url.objects.filter(string=self.url).delete()

    #         Url.objects.create(string=self.url,model=self.modelName,view=self.view,model_id=self.id)