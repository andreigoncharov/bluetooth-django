from django.db import models


class User(models.Model):
    userId = models.CharField(max_length=100, primary_key=True, serialize=False, verbose_name='ID')
    userPassword = models.CharField(max_length=255, default=None, blank=True, null=True)
    userName = models.CharField(max_length=255, default=None, blank=True, null=True)
    userType = models.CharField(max_length=255, default=None, blank=True, null=True)


class Doctor(models.Model):
    doctorId = models.CharField(max_length=100, primary_key=True, serialize=False, verbose_name='ID')
    doctorPassword = models.CharField(max_length=255, default=None, blank=True, null=True)
    doctorName = models.CharField(max_length=255, default=None, blank=True, null=True)
    doctorPatients = models.JSONField()
