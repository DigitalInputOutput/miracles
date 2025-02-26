from django.core.management.base import BaseCommand
from catalog.models import Category

class Command(BaseCommand): 
    help = 'Create Static'

    def handle(self, *args, **options):
        Category.objects.rebuild()