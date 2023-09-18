from django.urls import path
from .views import StripeCheckoutView, StripeWebhookView
from . import views

urlpatterns = [
    ### START OF STRIPE-RELATED URLS ###
    path('create-checkout-session/', StripeCheckoutView.as_view()),
    path('webhook/', StripeWebhookView.as_view()),
    ### END OF STRIPE-RELATED URLS ###
    
    ### START OF ADMIN CRUD PAYMENTS URLS ###
    path('<str:pk>/delete/', views.PaymentDestroyAPIView.as_view()),
    path('<str:pk>/', views.PaymentDetailAPIView.as_view()),
    path('', views.PaymentListAPIView.as_view()),
    ### START OF ADMIN CRUD PAYMENTS URLS ###
]