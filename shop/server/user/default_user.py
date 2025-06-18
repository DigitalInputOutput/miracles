from django.contrib.auth import get_user_model
User = get_user_model()

user = User.objects.create_user(
    username='admin',
    password='123456',
    is_superuser=True,
    is_staff=True,
    is_active=True
)
user.is_admin = True
user.save()