from django.urls import path
from . import views

urlpatterns = [
    ### START OF JWT URLS ###
    path('login/', views.LoginAPIView.as_view()),
    path('refreshToken/', views.RefreshTokenAPIView.as_view()),
    path('verifyToken/', views.VerifyTokenAPIView.as_view()),
    ### END OF JWT URLS ###
    
    ### START OF PYOTP URLS ###
    path('otp/', views.VerifyOTPAPIView.as_view()),
    ### END OF PYOTP URLS ###
    
    ### START OF ADMIN CRUD ACCOUNTS URLS ###
    path('getAccount/', views.GetAccountAPIView.as_view()),
    path('listAccounts/', views.ListAccountsAPIView.as_view()),
    path('addAccount/', views.AddAccountAPIView.as_view()),
    path('updateAccount/', views.UpdateAccountAPIView.as_view()),
    path('deleteAccount/', views.DeleteAccountAPIView.as_view()),
    path('accountExists/', views.CheckIfAccountExistsAPIView.as_view()),
    ### END OF ADMIN CRUD ACCOUNTS URLS ###
    
    ### START OF ADMIN CRUD DOGS URLS ###
    path('getDog/', views.GetDogAPIView.as_view()),
    path('listDogs/', views.ListDogsAPIView.as_view()),
    path('addDog/', views.AddDogAPIView.as_view()),
    path('updateDog/', views.UpdateDogAPIView.as_view()),
    path('deleteDog/', views.DeleteDogAPIView.as_view()),
    path('dogExists/', views.CheckIfDogExistsAPIView.as_view()),
    ### END OF ADMIN CRUD DOGS URLS ###
    
    ### START OF ADMIN CRUD DOG CATEGORIES URLS ###
    path('getDogCategory/', views.GetDogCategoryAPIView.as_view()),
    path('listDogCategories/', views.ListDogCategoriesAPIView.as_view()),
    path('addDogCategory/', views.AddDogCategoryAPIView.as_view()),
    path('updateDogCategory/', views.UpdateDogCategoryAPIView.as_view()),
    path('deleteDogCategory/', views.DeleteDogCategoryAPIView.as_view()),
    path('dogCategoryExists/', views.CheckIfDogCategoryExistsAPIView.as_view()),
    ### END OF ADMIN CRUD DOG CATEGORIES URLS ###
    
    ### START OF PUBLIC-RELATED URLS ###
    path('publicListDogs/', views.PublicListDogsAPIView.as_view()),
    path('publicListDogCategories/', views.PublicListDogCategoriesAPIView.as_view()),
    path('listDogsByCategories/', views.ListDogsByCategoryAPIView.as_view()),
    ### END OF PUBLIC-RELATED URLS ###
    
    ### START OF PAYMENT-RELATED URLS ###
    path('donate/', views.DonateAPIView.as_view()),
    path('updateDogSponsor/', views.UpdateDogSponsorAPIView.as_view()),
    path('getPayment/', views.GetPaymentAPIView.as_view()),
    path('listPayments/', views.ListPaymentsAPIView.as_view()),
    path('deletePayment/', views.DeletePaymentAPIView.as_view()),
    ### END OF PAYMENT-RELATED URLS ###
    
    ### START OF EMAIL URLS ###
    path('sendDonationEmail/', views.SendDonationEmailAPIView.as_view()),
    ### END OF EMAIL URLS ###
    
    ### START OF WALK RECORDS URLS ###
    path('getWalk/', views.GetWalkAPIView.as_view()),
    path('listWalks/', views.ListWalksAPIView.as_view()),
    path('addWalk/', views.AddWalkAPIView.as_view()),
    path('updateWalk/', views.UpdateWalkAPIView.as_view()),
    path('deleteWalk/', views.DeleteWalkAPIView.as_view()),
    ### END OF WALK RECORDS URLS ###
]

