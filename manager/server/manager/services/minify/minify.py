import os, glob, shutil, re
from system.settings import MAX_MINIFIED_VERSIONS, STATIC_ROOT, MINIFIED_ROOT

class MinifyService:
    devices = ["desktop", "mobile"]

    @staticmethod
    def minify(cls, files_type, kwargs):
        # Get CSS and JS versions for unique naming

        target_device = kwargs.get("device")

        # Collect and minify JS files for the specified device or for each device in MinifyService.devices
        devices_to_process = [target_device] if target_device in MinifyService.devices else MinifyService.devices

        for device in devices_to_process:
            files_root = STATIC_ROOT / f"{files_type}/{device}/"

            version = MinifyService.get_version(files_type, device, next=True)

            # Minify and save JS files
            cls.collect_files_and_minify(files_root, files_type, device, version)

            # Cleanup older JS versions for this device
            MinifyService.cleanup_old_versions(MINIFIED_ROOT, files_type, device, MAX_MINIFIED_VERSIONS)

    @staticmethod
    def minify_and_save(content, output_file, min_func):
        minified_content = min_func(content)

        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(minified_content)

        print(f"Saved minified file: {output_file}")
        
    @staticmethod
    def get_version(files_type, device, next=False):
        """
        Returns first existing version, example: there are folders 1/, 2/, ..., 24/ — returns 25 or just 1
        """
        static_dir = MINIFIED_ROOT / f"{files_type}/{device}"

        if not static_dir.exists():
            return 1

        version_dirs = [
            int(d.name) for d in static_dir.iterdir()
            if d.is_dir() and d.name.isdigit()
        ]

        if not version_dirs:
            return 1

        return max(version_dirs) + 1 if next else max(version_dirs)
    
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
