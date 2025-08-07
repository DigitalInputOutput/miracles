from django.core.management.base import BaseCommand
from manager.services import CssMinifyService, JsMinifyService

class Command(BaseCommand): 
    help = 'Create Minified JS and CSS'

    def add_arguments(self , parser):
        parser.add_argument('type' , nargs='?' , type=str, 
        help='specify the type of minification to be done')

    def handle(self, *args, **kwargs):
        CssMinifyService.minify(CssMinifyService, "css",kwargs)
        JsMinifyService.minify(JsMinifyService, "js",kwargs)