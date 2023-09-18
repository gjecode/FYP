from rest_framework import generics
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import GenericAPIView
from datetime import datetime
import pytz

from .auth.auth import CustomJWTAuthentication
from rest_framework.permissions import AllowAny

from .models import Dog, DogCategory
from .serializers import DogSerializer, DogCategorySerializer

### START OF ADMIN CRUD DOGS VIEWS ###


# Get a dog object given its primary key
class DogDetailAPIView(generics.RetrieveAPIView):
    authentication_classes = []
    permission_classes = (AllowAny,)

    queryset = Dog.objects.all()
    serializer_class = DogSerializer
    lookup_field = "pk"


# Get ALL dog objects
# Create a dog object given valid form data
class DogListCreateAPIView(generics.ListCreateAPIView):
    authentication_classes = (CustomJWTAuthentication,)
    permission_classes = (AllowAny,)

    queryset = Dog.objects.all()
    serializer_class = DogSerializer
    parser_classes = (MultiPartParser, FormParser)

    def perform_create(self, serializer):
        image = self.request.FILES.get("image")
        if image:
            serializer.save(image=image)
        else:
            serializer.save()


# Get ALL dog objects with no permissions/authentication
class PublicDogListAPIView(generics.ListAPIView):
    authentication_classes = []
    permission_classes = (AllowAny,)

    queryset = Dog.objects.all()
    serializer_class = DogSerializer


# Update dog object given valid form data and its primary key
class DogUpdateAPIView(generics.UpdateAPIView):
    authentication_classes = (CustomJWTAuthentication,)
    permission_classes = (AllowAny,)

    queryset = Dog.objects.all()
    serializer_class = DogSerializer
    lookup_field = "pk"
    parser_classes = (MultiPartParser, FormParser)

    def perform_update(self, serializer):
        image = self.request.FILES.get("image")
        if image:
            serializer.save(image=image)
        else:
            serializer.save()


# Delete dog object given its primary key
class DogDestroyAPIView(generics.DestroyAPIView):
    authentication_classes = (CustomJWTAuthentication,)
    permission_classes = (AllowAny,)

    queryset = Dog.objects.all()
    serializer_class = DogSerializer
    lookup_field = "pk"

    def perform_destroy(self, instance):
        super().perform_destroy(instance)


# Checks if dog object already exists in the DB, given its name/microchipID
class CheckIfDogExistsAPIView(GenericAPIView):
    authentication_classes = []
    permission_classes = (AllowAny,)

    def post(self, request):
        name = request.data["name"]
        microchipID = request.data["microchipID"]
        if microchipID:
            dog_exist = Dog.objects.filter(
                name__iexact=name, microchipID=microchipID
            ).exists()
        else:
            dog_exist = Dog.objects.filter(name__iexact=name).exists()
        if dog_exist:
            return Response(
                {"success": "Dog already exists!"}, status=status.HTTP_200_OK
            )
        else:
            return Response({"error": "Dog does not exist!"}, status=status.HTTP_200_OK)


### END OF ADMIN CRUD DOGS VIEWS ###

### START OF ADMIN CRUD DOG CATEGORIES VIEWS ###


# Get a dog category object given its primary key
class DogCategoryDetailAPIView(generics.RetrieveAPIView):
    authentication_classes = []
    permission_classes = (AllowAny,)

    queryset = DogCategory.objects.all()
    serializer_class = DogCategorySerializer
    lookup_field = "pk"


# Get ALL dog category objects
# Create a dog category object given valid form data
class DogCategoryListCreateAPIView(generics.ListCreateAPIView):
    authentication_classes = (CustomJWTAuthentication,)
    permission_classes = (AllowAny,)

    queryset = DogCategory.objects.all()
    serializer_class = DogCategorySerializer
    parser_classes = (MultiPartParser, FormParser)

    def perform_create(self, serializer):
        image = self.request.FILES.get("image")
        if image:
            serializer.save(image=image)
        else:
            serializer.save()


# Get ALL dog category objects
class PublicDogCategoryListAPIView(generics.ListAPIView):
    authentication_classes = []
    permission_classes = (AllowAny,)

    queryset = DogCategory.objects.all()
    serializer_class = DogCategorySerializer


# Update dog category object given valid form data and its primary key
class DogCategoryUpdateAPIView(generics.UpdateAPIView):
    authentication_classes = (CustomJWTAuthentication,)
    permission_classes = (AllowAny,)

    queryset = DogCategory.objects.all()
    serializer_class = DogCategorySerializer
    lookup_field = "pk"
    parser_classes = (MultiPartParser, FormParser)

    def perform_update(self, serializer):
        image = self.request.FILES.get("image")
        if image:
            serializer.save(image=image)
        else:
            serializer.save()


# Delete dog category object given its primary key
class DogCategoryDestroyAPIView(generics.DestroyAPIView):
    authentication_classes = (CustomJWTAuthentication,)
    permission_classes = (AllowAny,)

    queryset = DogCategory.objects.all()
    serializer_class = DogCategorySerializer
    lookup_field = "pk"

    def perform_destroy(self, instance):
        super().perform_destroy(instance)


# Checks if dog category object already exists in the DB, given its name
class CheckIfDogCategoryExistsAPIView(GenericAPIView):
    authentication_classes = []
    permission_classes = (AllowAny,)

    def post(self, request):
        name = request.data["name"]
        dog_exist = DogCategory.objects.filter(name__iexact=name).exists()
        if dog_exist:
            return Response(
                {"success": "Dog Category already exists!"}, status=status.HTTP_200_OK
            )
        else:
            return Response(
                {"error": "Dog Category does not exist!"}, status=status.HTTP_200_OK
            )


### END OF ADMIN CRUD DOG CATEGORIES VIEWS ###

### START OF PUBLIC-RELATED VIEWS ###


# Gets ALL dog objects given category primary key
class DogsByCategoryAPIView(GenericAPIView):
    authentication_classes = []
    permission_classes = (AllowAny,)

    def post(self, request):
        category_id = request.data["category_id"]
        dogs = Dog.objects.filter(categories__id=category_id)
        serializer = DogSerializer(dogs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


### END OF PUBLIC-RELATED VIEWS ###

### START OF PAYMENT-RELATED VIEWS ###


# Updates sponsor, called when payment is successful
class UpdateDogSponsorAPIView(GenericAPIView):
    authentication_classes = []
    permission_classes = (AllowAny,)

    def post(self, request):
        id = request.data.get("id")
        timestamp = request.data.get("sponsorExpirationDate")
        tz = pytz.timezone('Asia/Singapore')
        sponsorExpirationDate = datetime.fromtimestamp(timestamp, tz=tz)
        dog = Dog.objects.get(id=id)
        Dog.objects.filter(id=id).update(
            is_sponsored=True, 
            sponsorExpirationDate=sponsorExpirationDate 
        )
        return Response({"dog_name": dog.name}, status=status.HTTP_200_OK)


### END OF PAYMENT-RELATED VIEWS ###
