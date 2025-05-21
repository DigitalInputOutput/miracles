from manager.admin.model import AdminModel
from catalog.models import Gallery

class GalleryAdmin(AdminModel): 
    model = Gallery
    head = (('id','id'),('Название','name'))
    head_search = (('по id','id'),('по названию','name__icontains'))
    list_display = ('id','name')