# Generated by Django 3.2.16 on 2022-12-26 10:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('djblth', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='userType',
            field=models.CharField(blank=True, default=None, max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name='user',
            name='userName',
            field=models.CharField(blank=True, default=None, max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name='user',
            name='userPassword',
            field=models.CharField(blank=True, default=None, max_length=255, null=True),
        ),
    ]