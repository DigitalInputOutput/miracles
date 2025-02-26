from django.contrib.auth.models import BaseUserManager
from django.utils.translation import gettext as _

class CustomUserManager(BaseUserManager): 
    def create_user(self, device_id, password=None, **extra_fields):
        if not device_id:
            raise ValueError(_("The Device ID must be set"))
        user = self.model(device_id=device_id, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, device_id, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_admin', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_("Superuser must have is_staff=True."))
        if extra_fields.get('is_admin') is not True:
            raise ValueError(_("Superuser must have is_admin=True."))

        return self.create_user(device_id, password, **extra_fields)