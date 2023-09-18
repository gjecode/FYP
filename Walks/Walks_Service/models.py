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

class Donation(models.Model):
    class Meta:
        managed = False

class Walk(models.Model):
    dogID = models.IntegerField()
    handler = models.CharField(max_length=100, blank=True, null=True)
    enrichment = models.CharField(max_length=100, blank=True, null=True)
    walking = models.CharField(max_length=100, blank=True, null=True)
    leashConditioning = models.CharField(max_length=100, blank=True, null=True)
    touchConditioning = models.CharField(max_length=100, blank=True, null=True)
    muzzleConditioning = models.CharField(max_length=100, blank=True, null=True)
    behaviorIssues = models.CharField(max_length=100, blank=True, null=True)
    medicalIssues = models.CharField(max_length=100, blank=True, null=True)
    poopScore = models.DecimalField(max_digits=2, decimal_places=1, blank=True, null=True)
    reactivityScore = models.DecimalField(max_digits=2, decimal_places=1, blank=True, null=True)
    sensitivityScore = models.DecimalField(max_digits=2, decimal_places=1, blank=True, null=True)
    createdAt = models.DateTimeField(blank=True, null=True)