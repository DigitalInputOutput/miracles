import os
from shop.utils import is_ajax
from system.settings import CACHE_FOLDER,STATIC_SOURCE_ROOT,MINIFIED_ROOT,USER,GROUP
import pwd
import grp

class PathBuilder: 
    devices = ('desktop','mobile')

    @staticmethod
    def make_root_dirs(path):
        # Create the output directory if it doesn't exist
        if not os.path.isdir(path):
            os.makedirs(path, exist_ok=True)

            print(f"Created directory {path}")

    @staticmethod
    def make_cache_path(device, lang):
        # Create the cache path and return it 
        folder = f"{CACHE_FOLDER}html/{device}/{lang}/static/"

        if not os.path.isdir(folder):
            print(f"Creating cache folder {folder}")
            try:
                os.makedirs(folder)
            except FileExistsError:
                pass

        return folder

    @staticmethod
    def apply_recursive_chmod(path, permissions, user=USER,group=GROUP):
        uid = pwd.getpwnam(user).pw_uid
        gid = grp.getgrnam(group).gr_gid

        for root, dirs, files in os.walk(path):
            # Apply permissions to directories
            for d in dirs:
                file_path = os.path.join(root, d)
                os.chmod(file_path, permissions)
                os.chown(file_path, uid, gid)
                #print(f"Permissions changed successfully for {file_path}")
            # Apply permissions to files if needed
            for f in files:
                file_path = os.path.join(root, f)
                os.chmod(file_path, permissions)
                os.chown(file_path, uid, gid)
                #print(f"Permissions changed successfully for {file_path}")

    @staticmethod
    def build_object_path(request, string, Object, lang):
        root_path = PathBuilder.make_cache_path(request.device, lang)

        if Object:
            path = f"{root_path}{string or 'index.html'}"
        else:
            path = f"{root_path}/{string[:2]}/{string[2:4]}/"

        return f"{path[:255]}{('ajax' if is_ajax(request) else '')}"

    @staticmethod
    def generate_minified_path(current_file, version):
        # Remove STATIC_SOURCE_ROOT from the path to get the relative path
        relative_path = current_file.replace(str(STATIC_SOURCE_ROOT), "")

        # Construct the new path in MINIFIED_ROOT with versioning
        base, ext = os.path.splitext(relative_path)
        minified_relative_root = MINIFIED_ROOT + os.path.dirname(base.lstrip("/")) + f"/{version}"
        minified_relative_path = f"{os.path.basename(base)}_min{ext}"

        # Create root directories
        PathBuilder.make_root_dirs(minified_relative_root)

        # Join MINIFIED_ROOT with the updated relative path
        return os.path.join(minified_relative_root, minified_relative_path.lstrip("/"))

    @staticmethod
    def generate_critical_path(current_file):
        # Construct the new path in MINIFIED_ROOT with critical word
        base, ext = os.path.splitext(current_file)
        return f"{base}_critical{ext}"

    @staticmethod
    def collect_files_in_folder(root_folder):
        all_files = []

        for dirpath, dirnames, filenames in os.walk(root_folder):
            for file in filenames:
                file_path = os.path.join(dirpath, file)
                all_files.append(file_path)

        return all_files