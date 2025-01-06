from django.db import models

class Currency(models.Model): 
    code = models.CharField(max_length=5,unique=True)
    value = models.FloatField()
