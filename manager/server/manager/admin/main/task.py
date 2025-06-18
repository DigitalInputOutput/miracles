from manager.admin.model import AdminModel
from manager.models import Task
from manager.forms import TaskForm

class TaskAdmin(AdminModel): 
    model = Task
    form = TaskForm
    head = (('id','id'),('Ім\'я','name'),('Статус','status'),('URL','link'),('Функція','function'))
    head_search = (('за id','id'),('по назві','name__icontains'))
    list_display = ('id','name','get_status_display','link','function')