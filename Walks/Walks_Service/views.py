from rest_framework import generics
from .auth.auth import CustomJWTAuthentication
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime

from .models import Walk
from .serializers import WalkSerializer

# get a walk record object based on primary key
class WalkDetailAPIView(generics.RetrieveAPIView):
    queryset = Walk.objects.all()
    serializer_class = WalkSerializer
    authentication_classes = []
    permission_classes = (AllowAny,)
    lookup_field = 'pk'

# Get ALL walk record objects
# Create a walk record object given valid form data
class WalkListCreateAPIView(generics.ListCreateAPIView):
    queryset = Walk.objects.all()
    serializer_class = WalkSerializer
    authentication_classes = (CustomJWTAuthentication, )
    permission_classes = (AllowAny,)
    parser_classes = (MultiPartParser, FormParser)

# Update walk record object given valid form data and its primary key
class WalkUpdateAPIView(generics.UpdateAPIView):
    queryset = Walk.objects.all()
    serializer_class = WalkSerializer
    lookup_field = 'pk'
    authentication_classes = (CustomJWTAuthentication, )
    permission_classes = (AllowAny,)
    parser_classes = (MultiPartParser, FormParser)

# Delete walk record object given its primary key
class WalkDestroyAPIView(generics.DestroyAPIView):
    queryset = Walk.objects.all()
    serializer_class = WalkSerializer
    lookup_field = 'pk'
    authentication_classes = (CustomJWTAuthentication, )
    permission_classes = (AllowAny,)
    
    def perform_destroy(self, instance):
        super().perform_destroy(instance)










