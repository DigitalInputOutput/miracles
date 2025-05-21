from manager.admin.model import AdminModel
from blog.models import Article
from manager.forms import ArticleForm

class ArticleAdmin(AdminModel): 
    model = Article
    form = ArticleForm
    head = (('id','id'),('Название','name'))
    head_search = (('по id','id'),('по названию','description__name__icontains'))
    list_display = ('id','name')