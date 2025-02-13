# Generated by Django 5.0.7 on 2024-11-19 08:15

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration): 

    initial = True

    dependencies = [
        ('catalog', '0001_initial'),
        ('shop', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Cart',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('device_id', models.CharField(max_length=255, verbose_name='device_id')),
                ('items_qty', models.PositiveIntegerField(default=0)),
                ('total', models.PositiveIntegerField(default=0)),
                ('discount', models.PositiveIntegerField(default=0)),
            ],
        ),
        migrations.CreateModel(
            name='Payment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('image', models.CharField(max_length=255)),
            ],
            options={
                'verbose_name': 'Тип оплати',
            },
        ),
        migrations.CreateModel(
            name='Status',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('image', models.CharField(max_length=255)),
            ],
            options={
                'verbose_name': 'Статус замовлення',
            },
        ),
        migrations.CreateModel(
            name='City',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('last_modified', models.DateTimeField(auto_now_add=True)),
                ('language', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='shop.language')),
            ],
        ),
        migrations.CreateModel(
            name='Address',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('language', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='shop.language')),
                ('city', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='checkout.city')),
            ],
            options={
                'unique_together': {('name', 'language', 'city')},
            },
        ),
        migrations.CreateModel(
            name='Department',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('last_modified', models.DateTimeField(auto_now_add=True)),
                ('number', models.PositiveIntegerField(null=True)),
                ('address', models.ManyToManyField(to='checkout.address')),
                ('city', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='departments', to='checkout.city')),
            ],
        ),
        migrations.CreateModel(
            name='Delivery',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ttn_link', models.CharField(blank=True, max_length=255, null=True, verbose_name='TTH URL')),
                ('ttn_code', models.CharField(blank=True, max_length=255, null=True, verbose_name='TTH Number')),
                ('ttn_created_date', models.DateTimeField(null=True, verbose_name='Дата відправки')),
                ('department', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='checkout.department', verbose_name='Відділення')),
            ],
            options={
                'verbose_name': 'Доставка',
            },
        ),
        migrations.CreateModel(
            name='Item',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('price', models.PositiveIntegerField(default=0, verbose_name='Ціна')),
                ('qty', models.PositiveIntegerField(default=0, verbose_name='Кількість')),
                ('total', models.PositiveIntegerField(default=0, verbose_name='Разом')),
                ('cart', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='checkout.cart')),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='catalog.product')),
            ],
        ),
        migrations.CreateModel(
            name='Order',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=80, null=True, verbose_name="Ім'я")),
                ('lname', models.CharField(max_length=255, null=True, verbose_name='Призвище')),
                ('sname', models.CharField(max_length=255, null=True, verbose_name='По батькові')),
                ('email', models.CharField(max_length=50, null=True, verbose_name='Email')),
                ('phone', models.CharField(max_length=16, null=True, verbose_name='Телефон')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Дата додання')),
                ('comment', models.CharField(max_length=1000, null=True, verbose_name='Коментар до замовлення')),
                ('cart', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='checkout.cart', verbose_name='Кошик')),
                ('delivery', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='checkout.delivery')),
                ('user', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('payment', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='checkout.payment')),
            ],
            options={
                'verbose_name': 'Замовлення',
                'verbose_name_plural': 'Замовлення',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='Seat',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('weight', models.FloatField(verbose_name='Вага')),
                ('volumetricHeight', models.PositiveIntegerField(verbose_name='Висота')),
                ('volumetricWidth', models.PositiveIntegerField(verbose_name='Ширина')),
                ('volumetricLength', models.PositiveIntegerField(verbose_name='Довжина')),
                ('cost', models.FloatField(verbose_name='Оціночна вартість')),
                ('description', models.CharField(max_length=255, verbose_name='Опис')),
                ('specialCargo', models.BooleanField(choices=[(0, 'Ні'), (1, 'Так')], default=1)),
                ('order', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='seats', to='checkout.order')),
            ],
            options={
                'verbose_name': 'Займаємий простір',
                'verbose_name_plural': 'Займаємий простір',
            },
        ),
    ]
