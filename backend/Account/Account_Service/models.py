from django.contrib.auth.models import AbstractUser
from django.db import models

class DogCategory(models.Model):
    class Meta:
        managed = False

class Dog(models.Model):
    class Meta:
        managed = False

class Donation(models.Model):
    class Meta:
        managed = False

class Walk(models.Model):
    class Meta:
        managed = False

class CustomUser(AbstractUser):
    role = models.CharField(max_length=100, blank=True, null=True)
    
