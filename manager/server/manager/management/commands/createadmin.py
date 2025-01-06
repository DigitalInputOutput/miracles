from django.core.management.base import BaseCommand, CommandError
from user.models import User
from getpass import getpass
from django.utils.translation import gettext_lazy as _

class Command(BaseCommand): 
    help = 'Create Super User'

    def handle(self, *args, **options):
        try:
            User.objects.get(name=_('Адмін'),is_admin=True)
            print(_('Користувач вже існує.'))

        except User.DoesNotExist:
            password = getpass(_('Введіть пароль: '))
            user = User.objects.create(name=_('Адмін'),is_admin=True)
            user.set_password(password)
            user.save()