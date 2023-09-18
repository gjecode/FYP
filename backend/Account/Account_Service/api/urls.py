from django.urls import path
from . import views
from .views import MyTokenObtainPairView
from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenVerifyView,
)

urlpatterns = [
    ### START OF JWT URLS ###
    path("token/", MyTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("token/verify/", TokenVerifyView.as_view(), name="token_verify"),
    ### END OF JWT URLS ###
    
    ### START OF ADMIN CRUD URLS ###
    path('accountExists/', views.CheckIfAccountExistsAPIView.as_view()),
    path("account/", views.UserListCreateAPIView.as_view()),
    path('account/<str:pk>/update/', views.UserUpdateAPIView.as_view()),
    path('account/<str:pk>/delete/', views.UserDestroyAPIView.as_view()),
    path('account/<str:pk>/', views.UserDetailAPIView.as_view()),
    ### END OF ADMIN CRUD URLS ###
    
    ### START OF PYOTP URLS ###
    path("otp/", views.VerifyOTPAPIView.as_view()),
    ### END OF PYOTP URLS ###
]


