from django.urls import path

from . import views

urlpatterns = [
    path('<str:pk>/update/', views.WalkUpdateAPIView.as_view()),
    path('<str:pk>/delete/', views.WalkDestroyAPIView.as_view()),
    path('<str:pk>/', views.WalkDetailAPIView.as_view()),
    path('', views.WalkListCreateAPIView.as_view()),
]