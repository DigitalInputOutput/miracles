from django.db.models import Model
from system.settings import LANGUAGE_CODE
from shop.models import Url
from shop.models import Description
from django.utils import timezone
from google.cloud import translate_v2

class Page(Model):
    class Meta:
        abstract = True

    def autocomplete_dict(self, lang):
        return {
            'id':self.id,
            'name':self.translate_name(lang = lang),
        }

    def translate_url(self, lang):
        if lang:
            try:
                url = Url.objects.get(model=self.model_name, model_id=self.pk).string
                return f'/({lang}/{url}'
            except Url.DoesNotExist:
                pass

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
        try:
            return Url.objects.get(model_id=self.id, model=self.model_name).view
        except Url.DoesNotExist:
            return 'Url does not exist'

    @property
    def model_name(self):
        return self.__class__.__name__

    @property
    def title(self):
        return self.__str__()

    @property
    def meta_description(self):
        return self.__str__()

    @property
    def name(self,lang = LANGUAGE_CODE):
        return self.description.get(language__code=lang).name

    def __str__(self, lang = LANGUAGE_CODE):
        # try:
        #     url = Url.objects.get(model_name=self.model_name,model_id=self.id,language__code=lang)
        #     return f'{url}'
        # except Url.DoesNotExist: 
            return self.name
    
    @property
    def url(self, lang = LANGUAGE_CODE):
        return Url.objects.get(
            model_name=self.model_name,
            model_id=self.id,
            language__code=lang
        )

    def __repr__(self):
        return self.__str__()

    def save(self,*args,**kwargs):
        self.cached = False
        self.last_modified = timezone.now()

        super().save(*args,**kwargs)

    def delete(self,*args,**kwargs):
        Url.objects.filter(model_name=self.model_name,model_id=self.id).delete()

        self.description.all().delete()

        super().delete(*args,**kwargs)

    def date(self):
        try:
            return str(self.description.all().first().last_modified.date())
        except:
            return str(self.last_modified.date())

    def image_url(self):
        try:
            return self.image.url
        except:
            return '/static/image/no_image.jpg'

    @property
    def meta_image(self):
        try:
            return self.image.url
        except:
            return '/static/no_image.jpg'

    @property
    def h1(self):
        return self.name

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