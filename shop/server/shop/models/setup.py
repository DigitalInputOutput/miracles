from django.db import models

class Setup(models.Model): 
    fixtures_loaded = models.BooleanField(default=0)