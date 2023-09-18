from django.contrib import admin
from .models import Dog, DogCategory

@admin.register(Dog)
class DogAdmin(admin.ModelAdmin):
    list_display = ('name',)

@admin.register(DogCategory)
class DogCategoryAdmin(admin.ModelAdmin):
    list_display = ('name',)