from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('api/payment/', include('Payment_Service.urls')),
]
