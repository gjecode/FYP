from django.urls import path
from . import views

urlpatterns = [
    ### START OF PUBLIC-RELATED URLS ###
    path('byCategory/', views.DogsByCategoryAPIView.as_view()),
    ### END OF PUBLIC-RELATED URLS ###
    
    ### START OF PUBLIC LIST URLS ###
    path('public/', views.PublicDogListAPIView.as_view()),
    path('public/categories/', views.PublicDogCategoryListAPIView.as_view()),
    ### END OF PUBLIC LIST URLS ###
    
    ### START OF PAYMENT-RELATED URLS ###
    path('updateDogSponsor/', views.UpdateDogSponsorAPIView.as_view()),
    ### END OF PAYMENT-RELATED URLS ###
    
    ### START OF ADMIN CRUD DOG CATEGORIES URLS ###
    path('categories/<str:pk>/update/', views.DogCategoryUpdateAPIView.as_view()),
    path('categories/<str:pk>/delete/', views.DogCategoryDestroyAPIView.as_view()),
    path('categories/<str:pk>/', views.DogCategoryDetailAPIView.as_view()),
    path('categories/', views.DogCategoryListCreateAPIView.as_view()),
    path('dogCategoryExists/', views.CheckIfDogCategoryExistsAPIView.as_view()),
    ### END OF ADMIN CRUD DOG CATEGORIES URLS ###

    ### START OF ADMIN CRUD DOGS URLS ###
    path('dogExists/', views.CheckIfDogExistsAPIView.as_view()),
    path('<str:pk>/update/', views.DogUpdateAPIView.as_view()),
    path('<str:pk>/delete/', views.DogDestroyAPIView.as_view()),
    path('<str:pk>/', views.DogDetailAPIView.as_view()),
    path('', views.DogListCreateAPIView.as_view()),
    ### END OF ADMIN CRUD DOGS URLS ###
    
    
]