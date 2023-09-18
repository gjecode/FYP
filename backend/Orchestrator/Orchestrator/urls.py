from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('api/orchestrator/', include('Orchestrator_Service.urls')),
]
