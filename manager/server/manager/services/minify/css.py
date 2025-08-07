import os, shutil, re
from shop.builder import PathBuilder
# from simple_app.services import SpriteGeneratorService
from collections import defaultdict
from system.settings import MINIFIED_ROOT
from csscompressor import compress as css_minify
from .minify import MinifyService

class CssMinifyService(MinifyService):
    devices = ["desktop", "mobile"]

    @staticmethod
    def collect_files_and_minify(files_root, files_type, device, version):
        """ Resolve dependencies and perform minification in the correct order. """
        dependencies_map = {}
        output_map = defaultdict(tuple)
        critical_output_map = defaultdict(tuple)
        file_order = PathBuilder.collect_files_in_folder(files_root)

        # First pass: gather dependencies and outputs
        for file in file_order:
            # Skip files that have already been processed
            if file in dependencies_map:
                continue

            # Process and gather dependencies
            CssMinifyService.minify_file_with_tags(file, files_root, dependencies_map, output_map, critical_output_map, files_type, device, version)

        # Minify and save to the correct locations
        for critical_file, critical_contents in critical_output_map.items():
            ordered_critical_content = "\n".join(critical_contents)
            MinifyService.minify_and_save(ordered_critical_content, critical_file, css_minify)

        for output_file, contents in output_map.items():
            ordered_content = "\n".join(contents)
            MinifyService.minify_and_save(ordered_content, output_file, css_minify)

    @staticmethod
    def minify_file_with_tags(file_path, files_root, dependencies_map, output_map, critical_output_map, files_type, device, version):
        """Process file to find dependencies and add content to dependency map."""

        def gather_dependency_chain(current_file, content):
            """Recursively collect file content down to the root file."""

            # If the file is already processed, return its root
            if current_file in dependencies_map:
                return dependencies_map[current_file]

            # Read the content and look for dependencies
            # print(current_file)
            with open(current_file, 'r') as f:
                content = f.read()

            # Check for a dependency tag
            depends_on_match = re.search(r'/\* depends on: (.+?) \*/', content)
            depends_on = depends_on_match.group(1) if depends_on_match else None

            # Calculate the root output file name with "_min<version>" if no dependency
            if depends_on:
                root_file = gather_dependency_chain(str(files_root / depends_on), content)  # Recurse to the dependency
            else:
                root_file = PathBuilder.generate_minified_path(current_file, files_type, device, version)

            ext = os.path.splitext(current_file)[1]

            # Separate critical CSS from main content
            critical_code, remaining_content = CssMinifyService.extract_critical_css(content)
            
            # Only append critical CSS to the critical output map
            critical_output_map[PathBuilder.generate_critical_path(root_file)] += (critical_code,)

            # Append remaining non-critical CSS to the main output map
            output_map[root_file] += (remaining_content,)

            # Store the final root
            dependencies_map[current_file] = root_file

            return root_file

        # Initiate chain collection for each file
        gather_dependency_chain(file_path, "")

    @staticmethod
    def extract_critical_css(content):
        critical_regex = re.compile(r'/\* critical \*/(.*?)\s*/\* endcritical \*/', re.DOTALL)
        critical_css = '\n'.join(critical_regex.findall(content))
        remaining_css = critical_regex.sub('', content)

        return critical_css, remaining_css

    @staticmethod
    def remove_cache_root():
        print(f"removing foldertree {MINIFIED_ROOT}")
        shutil.rmtree(MINIFIED_ROOT, ignore_errors=True)