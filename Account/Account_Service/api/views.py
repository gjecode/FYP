from rest_framework.decorators import api_view
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from django.contrib.auth.hashers import make_password
from ..auth.auth import CustomJWTAuthentication
from rest_framework.generics import GenericAPIView
import pyotp
from django.conf import settings

from ..models import CustomUser
from .serializers import CustomUserSerializer

### START OF JWT VIEWS ###

# serializer for token, can set payload of token here
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['username'] = user.username
        return token

# logins user, validates if user exists and returns token
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


### END OF JWT VIEWS ###

### START OF ADMIN CRUD ACCOUNTS VIEWS ###


# Get user based on primary key
class UserDetailAPIView(generics.RetrieveAPIView):
    authentication_classes = (CustomJWTAuthentication, )
    permission_classes = (AllowAny,)
    
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    lookup_field = 'pk'

# Get ALL users
class UserListCreateAPIView(generics.ListCreateAPIView):
    authentication_classes = (CustomJWTAuthentication, )
    permission_classes = (AllowAny,)
    
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    parser_classes = (MultiPartParser, FormParser)

# Updates user based on primary key
class UserUpdateAPIView(generics.UpdateAPIView):
    authentication_classes = (CustomJWTAuthentication, )
    permission_classes = (AllowAny,)
    
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    lookup_field = 'pk'
    parser_classes = (MultiPartParser, FormParser)

# Deletes user based on primary key
class UserDestroyAPIView(generics.DestroyAPIView):
    authentication_classes = (CustomJWTAuthentication, )
    permission_classes = (AllowAny,)
    
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    lookup_field = 'pk'
    
    def perform_destroy(self, instance):
        super().perform_destroy(instance)

# Checks if account object already exists in the DB, given its name
class CheckIfAccountExistsAPIView(GenericAPIView):
    authentication_classes = (CustomJWTAuthentication, )
    permission_classes = (AllowAny,)
    
    def post(self, request):
        username = request.data['user']
        account_exist = CustomUser.objects.filter(username__iexact=username).exists()
        if account_exist:
            return Response({'success': 'Account already exists!'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Account does not exist!'}, status=status.HTTP_200_OK)


### END OF ADMIN CRUD ACCOUNTS VIEWS ###

### START OF PYOTP VIEWS ###


class VerifyOTPAPIView(GenericAPIView):
    authentication_classes = (CustomJWTAuthentication, )
    permission_classes = (AllowAny,)
    
    def post(self, request):
        input_OTP = request.data['otp']
        TOTP = pyotp.TOTP(settings.OTP_SECRET_KEY)
        is_valid = TOTP.verify(input_OTP)
        if is_valid:
            return Response({'success': 'OTP is valid!'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'OTP is not valid!'}, status=status.HTTP_200_OK)


### END OF PYOTP VIEWS ### 