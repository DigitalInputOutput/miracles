import os, glob, shutil, re
from shop.models import StaticFiles
from shop.services import PathBuilder, SpriteGeneratorService
from collections import defaultdict
from system.settings import MAX_MINIFIED_VERSIONS, STATIC_SOURCE_ROOT, MINIFIED_ROOT
from csscompressor import compress as css_minify
from jsmin import jsmin

class MinifyService:
    devices = ["desktop", "mobile"]

    @staticmethod
    def get_css_and_js_versions(website="shop"):
        static_files_versions = StaticFiles.objects.filter(type=website).first()
        if not static_files_versions:
            static_files_versions = StaticFiles.objects.create(type=website)

        # Increase files version
        static_files_versions.css += 1
        static_files_versions.js += 1

        static_files_versions.save()

        return static_files_versions.css,static_files_versions.js

    @staticmethod
    def extract_critical_css(content):
        critical_regex = re.compile(r'/\* critical \*/(.*?)\s*/\* endcritical \*/', re.DOTALL)
        critical_css = '\n'.join(critical_regex.findall(content))
        remaining_css = critical_regex.sub('', content)

        return critical_css, remaining_css

    @staticmethod
    def minify_and_save(content, output_file, minify_function):
        minified_content = minify_function(content)

        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(minified_content)

        print(f"Saved minified file: {output_file}")

    @staticmethod
    def minify_file_with_tags(file_path, files_root, dependencies_map, output_map, critical_output_map, version):
        """Process file to find dependencies and add content to dependency map."""

        def gather_dependency_chain(current_file, content):
            """Recursively collect file content down to the root file."""

            # If the file is already processed, return its root
            if current_file in dependencies_map:
                return dependencies_map[current_file]

            # Read the content and look for dependencies
            print(current_file)
            with open(current_file, 'r') as f:
                content = f.read()

            # Check for a dependency tag
            depends_on_match = re.search(r'/\* depends on: (.+?) \*/', content)
            depends_on = depends_on_match.group(1) if depends_on_match else None

            # Calculate the root output file name with "_min<version>" if no dependency
            if depends_on:
                root_file = gather_dependency_chain(str(files_root / depends_on), content)  # Recurse to the dependency
            else:
                root_file = PathBuilder.generate_minified_path(current_file, version)

            ext = os.path.splitext(current_file)[1]

            if ext == ".css":
                # Separate critical CSS from main content
                critical_code, remaining_content = MinifyService.extract_critical_css(content)
                
                # Only append critical CSS to the critical output map
                critical_output_map[PathBuilder.generate_critical_path(root_file)] += (critical_code,)
                
                # Append remaining non-critical CSS to the main output map
                output_map[root_file] += (remaining_content,)
            else:
                # For non-CSS files, add content as-is
                output_map[root_file] += (content,)

            # Store the final root
            dependencies_map[current_file] = root_file

            return root_file

        # Initiate chain collection for each file
        gather_dependency_chain(file_path, "")

    @staticmethod
    def collect_files_and_minify(files_root, minify_func, version):
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
            MinifyService.minify_file_with_tags(file, files_root, dependencies_map, output_map, critical_output_map, version)

        # Minify and save to the correct locations
        for critical_file, critical_contents in critical_output_map.items():
            ordered_critical_content = "\n".join(critical_contents)
            MinifyService.minify_and_save(ordered_critical_content, critical_file, minify_func)

        for output_file, contents in output_map.items():
            ordered_content = "\n".join(contents)
            MinifyService.minify_and_save(ordered_content, output_file, minify_func)

    @staticmethod
    def cleanup_old_versions(minified_root, file_type, device, max_versions):
        # Define the pattern to find version folders based on file structure
        base_pattern = os.path.join(minified_root, file_type, device, '**', f'*_min.{file_type}')
        version_folders = glob.glob(base_pattern, recursive=True)

        # Dictionary to hold version folders by base name
        grouped_folders = {}

        for folder in version_folders:
            # Extract version number and base path
            match = re.match(rf'^(.+?)/(\d+)/(.+?)_min\.{file_type}$', folder)
            if match:
                base_path, version, filename = match.groups()
                version = int(version)  # Convert version to integer for sorting

                # Initialize grouped folder dictionary
                if base_path not in grouped_folders:
                    grouped_folders[base_path] = []
                
                if version not in grouped_folders[base_path]:
                    grouped_folders[base_path].append(version)

        # Process each base path to keep only the latest folders
        for base_path, versions in grouped_folders.items():
            # Sort folders by version in descending order
            versions.sort(reverse=True)

            # Remove lower version folders
            for version in versions[max_versions:]:
                old_folder_path = os.path.join(base_path, str(version))
                shutil.rmtree(old_folder_path, ignore_errors=True)
                print(f"Deleted old folder: {old_folder_path}")

    @staticmethod
    def copy_js_to_cache(files_to_cope, cache_root):
        # Create root cache folder if does not exist
        PathBuilder.make_root_dirs(cache_root)

        # Copy all js files from project static to the cache folder static
        shutil.copytree(files_to_cope, cache_root, dirs_exist_ok=True)

    @staticmethod
    def handle_command(kwargs):
        # Get CSS and JS versions for unique naming
        css_version, js_version = MinifyService.get_css_and_js_versions(website=kwargs.get('website')[0])

        type_value = kwargs.get("type")
        # Determine which minification type to run based on kwargs
        if type_value and type_value[0] == "css":
            MinifyService.minify("css", css_version, kwargs, css_minify)
            print("CSS files have been minified, versioned, and cleaned up successfully.")
        elif type_value and type_value[0] == "js":
            # MinifyService.minify("js", js_version, kwargs, jsmin)
            MinifyService.copy_js_files(kwargs)
            print("JS files have been minified, versioned, and cleaned up successfully.")
        else:
            # Run both CSS and JS minification
            MinifyService.minify("css", css_version, kwargs, css_minify)
            # MinifyService.minify("js", js_version, kwargs, jsmin)

            # Copy all JS to the cache folder
            MinifyService.copy_js_files(kwargs)

            # SpriteGeneratorService.generate_and_save_sprites()

            print("CSS and JS files have been minified, versioned, and cleaned up successfully.")

    @staticmethod
    def minify(file_type, version, kwargs, minify_func):
        target_device = kwargs.get("device")

        # Collect and minify JS files for the specified device or for each device in MinifyService.devices
        devices_to_process = [target_device] if target_device in MinifyService.devices else MinifyService.devices

        for device in devices_to_process:
            files_root = STATIC_SOURCE_ROOT / f"{file_type}/" / f"{device}/"

            # Minify and save JS files
            MinifyService.collect_files_and_minify(files_root, minify_func, version)

            # Cleanup older JS versions for this device
            MinifyService.cleanup_old_versions(MINIFIED_ROOT, file_type, device, MAX_MINIFIED_VERSIONS)

    @staticmethod
    def copy_js_files(kwargs):
        target_device = kwargs.get("device")
        devices_to_process = [target_device] if target_device in MinifyService.devices else MinifyService.devices

        for device in devices_to_process:
            files_to_copy = STATIC_SOURCE_ROOT / f"js/" / f"{device}/"
            cache_root = MINIFIED_ROOT + f"js/{device}/"

            MinifyService.copy_js_to_cache(files_to_copy, cache_root)