from manager.list.model import ModelAdmin
from shop.models import Task
from manager.forms import TaskForm

class TaskAdmin(ModelAdmin): 
    model = Task
    form = TaskForm
    head = (('id','id'),('Ім\'я','name'),('Статус','status'),('URL','link'),('Функція','function'))
    head_search = (('за id','id'),('по назві','name__icontains'))
    list_display = ('id','name','get_status_display','link','function')
    editTemplate = 'main/edit.html'