#-*- coding:utf-8 -*-
from django.db import models
from requests import post
from json import loads
from shop.fields import JSONField

class Settings(models.Model): 
    attention_message = models.CharField(max_length=255,verbose_name='Уведомление',null=True)
    sitemap_cache = models.DateTimeField(null=True)
    api_key = models.CharField(max_length=255,verbose_name="API_KEY novaposhta.ua",null=True)
    senderRef = models.CharField(max_length=255,null=True)
    contactsRef = models.CharField(max_length=255,null=True)
    phone = models.CharField(max_length=20,null=True,verbose_name="Телефон novaposhta.ua")
    logo = models.ImageField(upload_to='logo/',null=True)
    wotermark = models.ImageField(upload_to='logo/',null=True)
    google_analytics = models.CharField(max_length=255,null=True)
    google_tag = models.CharField(max_length=255,null=True)
    google_adwords = models.CharField(max_length=255,null=True)
    google_verification = models.CharField(max_length=255,null=True)
    google_conversion = models.CharField(max_length=255,null=True)
    facebook_id = models.CharField(max_length=255,null=True)
    phones = JSONField(max_length=255,null=True)
    emails = JSONField(max_length=255,null=True)
    video_banner = models.BooleanField(default=0)
    video_url = models.CharField(max_length=255,null=True)

    url = "https://api.novaposhta.ua/v2.0/json/"
    sender = {
        "apiKey": '',
        "modelName": "Counterparty",
        "calledMethod": "getCounterparties",
        "methodProperties": {
            "CounterpartyProperty": "Sender",
            "Page": "1"
        }
    }
    contacts = {
        "apiKey": '',
        "modelName": "Counterparty",
        "calledMethod": "getCounterpartyContactPersons",
        "methodProperties": {
            "Ref": "931880ab-45c5-11e7-80c8-005056887b8d",
            "Page": "1"
        }
    }

    def save(self,*args,**kwargs):
        self.sender['apiKey'] = self.api_key
        self.contacts['apiKey'] = self.api_key

        response = post(self.url,json=self.sender)
        self.senderRef = loads(response.text)['data'][0]['Ref']
        self.contacts['methodProperties']['Ref'] = self.senderRef

        response = post(self.url,json=self.contacts)
        self.contactsRef = loads(response.text)['data'][0]['Ref']

        super().save(*args,**kwargs)

    @property
    def name(self):
        return self.__str__()

    def __str__(self):
        return 'Настройки'

    class Meta:
        verbose_name = 'Настройки'
        verbose_name_plural = 'Настройки'