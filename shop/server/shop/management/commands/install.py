from django.core.management.base import BaseCommand
from shop.models import Setup
from django.core.management import call_command
from system.settings import HOME_DIR

class Command(BaseCommand): 
    help = 'Create Static'

    def handle(self, *args, **options):
        # Check if the fixtures have already been loaded
        if Setup.objects.filter(fixtures_loaded=True).exists():
            self.stdout.write(self.style.SUCCESS('Fixtures already loaded, skipping...'))
            answer = input("Would you like to reload fixtures? [y/N] ")

            if answer == "y":
                self.load_fixtures()
        else:
            self.load_fixtures()

        call_command('minify', 'manager')
        # call_command('minify', 'shop')

    def load_fixtures(self):
        self.stdout.write(self.style.WARNING('Loading fixtures...'))
        print(HOME_DIR / 'shop/server/shop/fixtures/language.json')
        call_command('loaddata', HOME_DIR / 'shop/server/shop/fixtures/language.json')
        call_command('loaddata', HOME_DIR / 'shop/server/shop/fixtures/urls.json')
        call_command('loaddata', HOME_DIR / 'shop/server/shop/fixtures/info.json')
        call_command('loaddata', HOME_DIR / 'shop/server/shop/fixtures/default_meta.json')
        call_command('loaddata', HOME_DIR / 'shop/server/catalog/fixtures/description.json')
        call_command('loaddata', HOME_DIR / 'shop/server/catalog/fixtures/categories.json')

        call_command('rebuild_tree')

        # Mark fixtures as loaded
        Setup.objects.create(fixtures_loaded=True)
        self.stdout.write(self.style.SUCCESS('Fixtures loaded successfully'))