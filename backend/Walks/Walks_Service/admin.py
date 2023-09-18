from django.contrib import admin
from .models import Walk

@admin.register(Walk)
class WalkAdmin(admin.ModelAdmin):
    list_display = ('id',)