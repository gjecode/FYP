from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('api/email/', include('Email_Service.urls')),
]
