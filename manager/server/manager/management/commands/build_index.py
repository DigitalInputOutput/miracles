from django.core.management.base import BaseCommand
from pathlib import Path
from system.settings import DEBUG, HOME_DIR

class Command(BaseCommand): 
    help = 'Create Super User'

    def handle(self, *args, **options):
        ENV = "prod" if not DEBUG else "dev"
        template_path = Path(HOME_DIR / "manager/client/html/index.template.html")
        output_path = Path(HOME_DIR / "manager/client/html/index.html")

        critical_css = ""
        full_css = ""
        scripts = ""

        if ENV == "prod":
            critical_css = Path(HOME_DIR / "manager/client/html/static_urls/prod/critical_css.html").read_text()
            full_css = Path(HOME_DIR / "manager/client/html/static_urls/prod/css.html").read_text()
            scripts = Path(HOME_DIR / "manager/client/html/static_urls/prod/js.html").read_text()
        else:
            critical_css = ''

            full_css = Path(HOME_DIR / "manager/client/html/static_urls/dev/css.html").read_text()
            scripts = Path(HOME_DIR / "manager/client/html/static_urls/dev/js.html").read_text()

        # Read template
        template = template_path.read_text()

        # Replace tags
        rendered = (
            template.replace("<!-- {{critical_css}} -->", critical_css)
                    .replace("<!-- {{full_css}} -->", full_css)
                    .replace("<!-- {{scripts}} -->", scripts)
        )

        # Write result
        output_path.write_text(rendered)

        print(f"[✓] index.html generated for {ENV}")