from shop.services import PathBuilder
from django.utils import timezone
from django.utils.http import http_date
from django.http import HttpResponse
from django.shortcuts import render
from calendar import timegm
import os
from shop.utils import is_ajax
from shop.utils import clear_html
from django.template.loader import render_to_string
from shop.models import Language
from catalog.models import Category
from checkout.models import City
from system.settings import CACHE_FOLDER,STATIC_SOURCE_ROOT,SVG_CACHE_FOLDER
import shutil
import subprocess

class CacheService:
    @staticmethod
    def get_last_modified(Object):
        try:
            last_modified = http_date(timegm(Object.get('last_modified').utctimetuple()))
        except:
            last_modified = http_date(timegm(timezone.now().utctimetuple()))

        return last_modified

    @staticmethod
    def is_cached(Object, string, request, lang):
        path = PathBuilder.build_object_path(request, string, Object, lang)

        print(f"Is cached path?: {path} {os.path.isfile(path)}")

        return os.path.isfile(path)

    @staticmethod
    def cache_response(Object, response, string, request, lang):
        path = PathBuilder.build_object_path(request, string, Object, lang)

        with open(path, "wb") as f:
            f.write(response.content.decode('utf8').replace('\n','').replace('\t','').encode('utf8'))

    @staticmethod
    def serve_cached_response(Object, view, string, request, lang, last_modified):
        path = PathBuilder.build_object_path(request, string, Object, lang)

        with open(path,'rb') as content:
            if is_ajax(request):
                response = HttpResponse(content.read(),content_type="text/html")
                response['Last-Modified'] = last_modified
                return response
            else:
                response = render(request,f'main/{request.device}/index.html',
                                    context={
                                        'view': view,
                                        'content':content.read().decode('utf8')
                                    })
                response['Last-Modified'] = last_modified
                return response

    @staticmethod
    def make_static_html():
        #clean old cache first
        print("Cleaning old html first...\n")
        CacheService.clean_old_html_cache()

        #For each Language in the system and for all devices listed in the settings.py 
        #create cahe root folder
        context = {}
        context['navigation'] = Category.objects.filter(parent__isnull=True)
        context['cities'] = City.objects.all()
        context['languages'] = Language.objects.all()

        for lang in context['languages']:
            context['lang'] = lang.code

            for device in PathBuilder.devices:
                cache_folder = PathBuilder.make_root_path(device, lang.code)

                CacheService.create_categories_cache(cache_folder, device, context)
                CacheService.create_footer_cache(cache_folder, device, context)

        PathBuilder.apply_recursive_chmod(CACHE_FOLDER, 0o775)

    @staticmethod
    def clean_old_html_cache():
        if os.path.isdir(f"{CACHE_FOLDER}html"):
            shutil.rmtree(f"{CACHE_FOLDER}html")

    @staticmethod
    def create_categories_cache(cache_folder, device, context):
        if not os.path.isfile(cache_folder + 'categories.html'):
            
            print("Creating categories cache...\n")
            categories = clear_html(render_to_string(f'main/{device}/nav.html',context=context))

            with open(cache_folder + 'categories.html','w',encoding='utf-8') as template:
                template.write(categories)

    @staticmethod
    def create_footer_cache(cache_folder, device, context):
        if not os.path.isfile(cache_folder + 'footer.html'):

            print("Creating footer cache...\n")
            footer = clear_html(render_to_string(f'main/{device}/footer.html',context=context))

            with open(cache_folder + 'footer.html','w',encoding='utf-8') as template:
                template.write(footer)

    # Folder containing individual SVG source files
    svg_folder = STATIC_SOURCE_ROOT / "image/svg/icons/"
    # Output SVG sprite file
    output_not_optimized_file = CACHE_FOLDER + "static/image/svg/sprite_not_optimized.svg"
    output_file = CACHE_FOLDER + "static/image/svg/sprite.svg"

    # Scour options for optimization
    scour_options = [
        "scour",
        "--enable-viewboxing",
        "--keep-editor-data",
        "--strip-xml-prolog",
        "--remove-titles",
        "--remove-descriptions",
        "--indent=none"
    ]

    cache = {}

    @staticmethod
    def save_svg_to_cache(key, content):
        CacheService.cache[key] = content

    @staticmethod
    def create_svg_sprite():
        # Function to create an SVG sprite from individual SVG files
        # Create optimized folder if it doesn't exist
        PathBuilder.make_root_dirs(SVG_CACHE_FOLDER)

        sprite_content = ['<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="display: none;">\n']

        for filename in sorted(os.listdir(CacheService.svg_folder)):
            if filename.endswith(".svg"):
                icon_id = os.path.splitext(filename)[0]
                input_svg_path = os.path.join(CacheService.svg_folder, filename)
                optimized_svg_path = os.path.join(SVG_CACHE_FOLDER, filename)

                # Run Scour on each SVG file for optimization
                subprocess.run(CacheService.scour_options + ["-i", input_svg_path, "-o", optimized_svg_path])

                # Read optimized SVG content
                with open(optimized_svg_path, "r") as svg_file:
                    svg_content = svg_file.read()

                    # # Remove unwanted prefixes (e.g., "sodipodi:", "inkscape:")
                    svg_content = CacheService.remove_unbound_prefixes(svg_content)

                    # Extract only the content within the <svg> tag
                    start_index = svg_content.find("<svg")
                    end_index = svg_content.find(">", start_index) + 1
                    svg_inner_content = svg_content[end_index:-7]  # Excludes the closing </svg>

                    # Format the content as <symbol> for the sprite and add to cache
                    symbol_content = f'  <symbol id="{icon_id}" viewBox="0 0 24 24">\n{svg_inner_content}\n  </symbol>\n'
                    CacheService.save_svg_to_cache(icon_id, symbol_content)
                    sprite_content.append(symbol_content)

        sprite_content.append("</svg>")

        # Write the combined SVG sprite to the output file
        with open(CacheService.output_not_optimized_file, "w") as output_svg:
            output_svg.write("".join(sprite_content))

        # Run Scour on result SVG file for optimization
        subprocess.run(CacheService.scour_options + ["-i", CacheService.output_not_optimized_file, "-o", CacheService.output_file])

        print(f"SVG sprite created at '{CacheService.output_file}' with {len(sprite_content) - 2} icons.")

    # Helper function to remove unbound prefixes
    def remove_unbound_prefixes(svg_content):
        lines = svg_content.splitlines()
        filtered_lines = []

        for line in lines:
            # Only remove lines that start with unwanted prefixes or elements
            if not any(line.strip().startswith(f"<{prefix}") for prefix in ("sodipodi:", "inkscape:")):
                # Remove attributes with unwanted prefixes while keeping valid content
                for prefix in ("sodipodi:", "inkscape:"):
                    line = line.replace(f"{prefix}", "")
                filtered_lines.append(line)

        return "\n".join(filtered_lines)