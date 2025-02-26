from django.http import Http404
import importlib

class ViewService: 

    @staticmethod
    def import_view(view_name):
        try:
            # Split the full view path into module and class name
            module_name, class_name = view_name.rsplit('.', 1)
            # Import the module
            module = importlib.import_module(module_name)
            # Get the view class from the module
            view_class = getattr(module, class_name)
            return view_class
        except (ImportError, AttributeError, ValueError) as e:
            raise Http404(f"View class '{view_name.view}' not found: {str(e)}")
        
    @staticmethod
    def get_full_view_path(view_class):
        """
        Returns the full path (module + class name) of a view class.
        """
        return f"{view_class.__module__}.{view_class.__name__}"
    
    @staticmethod
    def build_final_response(response, last_modified):
        response['Last-Modified'] = last_modified

        return response