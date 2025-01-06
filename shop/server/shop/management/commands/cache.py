from django.core.management.base import BaseCommand
from shop.services import CacheService

class Command(BaseCommand): 
    help = 'Create Static'

    def handle(self, *args, **options):
        answer = input("Would you like to build SVG sprite? [y/N] ")

        if answer == "y":
            CacheService.create_svg_sprite()

            print("SVG sprite created.")

        answer = input("Would you like to build html cache? [y/N] ")

        if answer == "y":
            CacheService.make_static_html()

            print("Cache created.")