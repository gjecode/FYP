from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    class Meta:
        managed = False
        db_table = 'Account_Service_CustomUser'
        
class DogCategory(models.Model):
    class Meta:
        managed = False

class Dog(models.Model):
    class Meta:
        managed = False

class Walk(models.Model):
    class Meta:
        managed = False

class Donation(models.Model):
    paymentIntent = models.CharField(primary_key=True, max_length=100)
    dogID = models.CharField(max_length=100)
    checkoutSessionID = models.CharField(max_length=100, blank=True, null=True)
    customerEmail = models.CharField(max_length=100, blank=True, null=True)
    customerName = models.CharField(max_length=100, default='Anonymous')
    amountTotal = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    currency = models.CharField(max_length=100, blank=True, null=True)
    createdAt = models.DateTimeField(blank=True, null=True)
    