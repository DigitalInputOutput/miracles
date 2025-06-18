from django.db import models
from shop.models import Language
from django.utils.translation import gettext as _
from shop.models import Redirect,Language

class Url(models.Model):
    model_name = models.CharField(max_length=16)
    model_id = models.PositiveIntegerField()
    string = models.CharField(max_length=255)
    view = models.CharField(max_length=255)
    language = models.ForeignKey(Language, on_delete=models.CASCADE)
    cached = models.BooleanField(default = False)

    class Meta:
        unique_together = ('string','model_id','model_name','language')
        verbose_name = _("URL")
        verbose_name_plural = _("URL")

    def save(self, *args, **kwargs):
        if self.pk:
            self.check_string()

        super().save(*args, **kwargs)

    def __iter__(self):
        return self.string

    def __getitem__(self,key):
        return self.string[key]

    def __str__(self):
        return self.string

    def update(self,*args,**kwargs):
        super().save(*args,**kwargs)

    @property
    def url(self):
        return self.string

    def add_redirect(self,old_string,new_string):
        if old_string != new_string:
            try:
                Redirect.objects.get(old_string=old_string,new_path=new_string)
            except Redirect.DoesNotExist:
                Redirect.objects.create(old_string=old_string,new_path=new_string)

            Url.objects.filter(string=old_string).delete()

    def check_string(self):
        try:
            string = Url.objects.get(
                model_id=self.pk,
                model_name=self.model_name,
                view=self.view
            )

            if self.url != string.string:
                self.add_redirect(string.string, self.url)

        except Url.MultipleObjectsReturned:
            # old = Url.objects.filter(
            #     model_id=self.pk,
            #     model_name=self.model,
            #     view=self.view
            # ).exclude(string=self.url).first()

            # if old:
            #     self.add_redirect(old, self.url)
            pass
        except Url.DoesNotExist:
            return