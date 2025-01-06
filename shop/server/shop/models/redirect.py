from django.db.models import Model,CharField

class Redirect(Model): 
    old = CharField(max_length=255,unique=True)
    new = CharField(max_length=255,null=True)