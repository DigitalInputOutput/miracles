from django.core.management.base import BaseCommand
from shop.services import MinifyService

class Command(BaseCommand): 
    help = 'Create Minified JS and CSS'

    def handle(self, *args, **kwargs):
        MinifyService.handle_command(kwargs)