import os, glob, shutil, re
from shop.builder import PathBuilder
from jsmin import jsmin
from .minify import MinifyService

class JsMinifyService(MinifyService):
    devices = ["desktop", "mobile"]

    @staticmethod
    def collect_files_and_minify(files_root, files_type, device, version):
        entry_point = files_root / 'main.js'
        content = JsMinifyService.resolve_imports(entry_point, files_root, included = set())

        output_file = PathBuilder.generate_minified_path('main.js', files_type, device, version)

        MinifyService.minify_and_save(content, output_file, jsmin)

    @staticmethod
    def resolve_imports(file_path, base_dir, included):

        if file_path in included:
            return ""

        included.add(file_path)

        if not os.path.isfile(file_path):
            print(f"File path {file_path} does not exist")
            return ''

        with open(file_path, 'r') as f:
            code = f.read()

        output = ""
        for match in re.finditer(r'import(?: .*? from)? [\'"](.+?\.js)[\'"];?', code):
            import_path = match.group(1)
            abs_path = os.path.normpath(os.path.join(os.path.dirname(file_path), import_path))
            output += JsMinifyService.resolve_imports(abs_path, base_dir, included)

        # Delete all import-lines
        code = re.sub(r'^import .*?;$', '', code, flags=re.MULTILINE)
        output += "\n" + code
        return output