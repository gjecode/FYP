from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('api/walks/', include('Walks_Service.urls')),
]