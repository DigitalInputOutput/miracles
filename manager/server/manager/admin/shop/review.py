from manager.admin.model import AdminModel
from shop.models import Review
from shop.forms import ReviewForm

class ReviewAdmin(AdminModel): 
    model = Review
    form = ReviewForm
    head = (('id','id'),('Автор','author'),('Название','name'),('Дата','created_at'))
    head_search = (('по id','id'),('по автору','author__icontains'),('по названию','name__icontains'),())
    list_display = ('id','author','title','created_at','activity')