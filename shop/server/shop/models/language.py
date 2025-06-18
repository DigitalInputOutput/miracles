from django.db import models

class Language(models.Model): 
    code = models.CharField(max_length=5)
    image = models.ImageField(upload_to="lang/")
    name = models.CharField(max_length=20,null=True)
    path = models.CharField(max_length=255,null=True)
    ISOcode = models.CharField(max_length=5,null=True)
    active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} {self.code}"

    @property
    def image_url(self):
        try:
            return self.image.url
        except:
            return '/media/no_image.jpg'

    @property
    def admin_image(self):
        return f"<img src='{self.image_url}'>"
    
    @property
    def is_active(self):
        return f'<div class="clickable bool {str(self.active).lower()}"></div>'