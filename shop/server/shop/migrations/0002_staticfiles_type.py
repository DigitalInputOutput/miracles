# Generated by Django 5.0.7 on 2024-11-19 08:28

from django.db import migrations, models


class Migration(migrations.Migration): 

    dependencies = [
        ('shop', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='staticfiles',
            name='type',
            field=models.PositiveIntegerField(default=1),
        ),
    ]
