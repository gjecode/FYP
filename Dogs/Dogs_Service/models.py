from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    class Meta:
        managed = False
        db_table = 'Account_Service_CustomUser'

class Donation(models.Model):
    class Meta:
        managed = False

class Walk(models.Model):
    class Meta:
        managed = False

class DogCategory(models.Model):
    name = models.CharField(max_length=100)
    desc = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='Dogs_Service/category/images', blank=True, null=True)
    
    def __str__(self):
        return self.name
    
class Dog(models.Model):
    microchipID = models.CharField(max_length=100, blank=True, null=True)
    name = models.CharField(max_length=50)
    desc = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='Dogs_Service/dog/images', blank=True, null=True)
    is_sponsored = models.BooleanField(default=False)
    vaccinationDate = models.DateField(blank=True, null=True)
    categories = models.ManyToManyField(DogCategory, blank=True)
    DOB = models.DateField(blank=True, null=True)
    gender = models.CharField(max_length=6, blank=True, null=True)
    sponsorExpirationDate = models.DateField(blank=True, null=True)
    
