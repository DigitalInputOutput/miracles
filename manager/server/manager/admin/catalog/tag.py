from manager.admin.model import AdminModel
from catalog.models import Tag
from django.db.models import Q
from manager.forms import TagForm

class TagAdmin(AdminModel): 
    model = Tag
    form = TagForm
    head = (('id','id'),('Название','name'))
    head_search = (('по id','id'),('по названию','description__name__icontains'))
    list_display = ('id','__str__')