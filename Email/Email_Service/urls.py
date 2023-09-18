from django.urls import path
from . import views

urlpatterns = [
    path('sendDonationEmail/', views.SendDonationEmailAPIView.as_view()),
]