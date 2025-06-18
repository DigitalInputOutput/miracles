from manager.admin.model import AdminModel
from shop.models import Settings
from manager.forms import SettingsForm

class SettingsAdmin(AdminModel): 
    model = Settings
    form = SettingsForm
    head = (('id','id'),('API_KEY','api_key'))
    list_display = ('id','api_key')