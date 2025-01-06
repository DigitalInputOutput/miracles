from manager.list.model import ModelAdmin
from shop.models import Settings
from manager.forms import SettingsForm

class SettingsAdmin(ModelAdmin): 
    model = Settings
    form = SettingsForm
    head = (('id','id'),('API_KEY','api_key'))
    list_display = ('id','api_key')
    editTemplate = 'main/edit.html'