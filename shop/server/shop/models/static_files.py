from django.db import models 

class StaticFiles(models.Model): 
    css = models.PositiveIntegerField(default=1)
    js = models.PositiveIntegerField(default=1)

    type_choices = (
        ("shop","Shop"),
        ("manager","Manager")
    )
    type = models.CharField(max_length=20, choices=type_choices, default="shop")

    def up_version(self,type):
        t = getattr(self,type)
        t += 1

        setattr(self,type,t)

        super().save()