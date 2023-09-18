import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from dotenv import load_dotenv
import os
from rest_framework.parsers import MultiPartParser, FormParser

load_dotenv()

DOGS_URL = os.environ.get("DOGS_URL")
ACCOUNT_URL = os.environ.get('ACCOUNT_URL')
PAYMENT_URL = os.environ.get('PAYMENT_URL')
EMAIL_URL = os.environ.get('EMAIL_URL')
WALKS_URL = os.environ.get('WALKS_URL')

### START OF JWT VIEWS ###


class LoginAPIView(APIView):
    def post(self, request):
        response = requests.post('http://{}/api/token/'.format(ACCOUNT_URL), json=request.data)
        data = response.json()
        return Response(data, status=status.HTTP_200_OK)
    
class RefreshTokenAPIView(APIView):
    def post(self, request):
        response = requests.post('http://{}/api/token/refresh/'.format(ACCOUNT_URL), json=request.data)
        data = response.json()
        return Response(data, status=status.HTTP_200_OK)

class VerifyTokenAPIView(APIView):
    def post(self, request):
        response = requests.post('http://{}/api/token/verify/'.format(ACCOUNT_URL), json=request.data)
        if response.status_code == 200:
            return Response(status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)


### END OF JWT VIEWS ###

### START OF PYOTP VIEWS ###


class VerifyOTPAPIView(APIView):
    def post(self, request):
        accessToken = request.META.get('HTTP_AUTHORIZATION')
        headers = {
            'Authorization': accessToken
        }
        response = requests.post('http://{}/api/otp/'.format(ACCOUNT_URL), json=request.data, headers=headers)
        data = response.json()
        return Response(data, status=response.status_code)


### END OF PYOTP VIEWS ### 

### START OF ADMIN CRUD ACCOUNTS VIEWS ###


class GetAccountAPIView(APIView):
    def post(self, request):
        id = request.data['id']
        accessToken = request.META.get('HTTP_AUTHORIZATION')
        headers = {
            'Authorization': accessToken
        }
        response = requests.get('http://{}/api/account/{}/'.format(ACCOUNT_URL, id), headers=headers)
        data = response.json()
        return Response(data, status=status.HTTP_200_OK)

class ListAccountsAPIView(APIView):
    def get(self, request):
        accessToken = request.META.get('HTTP_AUTHORIZATION')
        headers = {
            'Authorization': accessToken
        }
        response = requests.get('http://{}/api/account/'.format(ACCOUNT_URL), headers=headers)
        data = response.json()
        return Response(data, status=status.HTTP_200_OK)
    
class AddAccountAPIView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    
    def post(self, request):
        accessToken = request.META.get('HTTP_AUTHORIZATION')
        headers = {
            'Authorization': accessToken
        }
        data = request.data.dict()
        response = requests.post('http://{}/api/account/'.format(ACCOUNT_URL), data=data, headers=headers)
        data = response.json()
        if "id" not in data:
            return Response(status=status.HTTP_409_CONFLICT)
        return Response(data, status=status.HTTP_201_CREATED)

class UpdateAccountAPIView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    
    def post(self, request):
        id = request.data['id']
        accessToken = request.META.get('HTTP_AUTHORIZATION')
        headers = {
            'Authorization': accessToken
        }
        data = request.data.dict()
        response = requests.put('http://{}/api/account/{}/update/'.format(ACCOUNT_URL, id), data=data, headers=headers)
        data = response.json()
        if "id" not in data:
            return Response(status=status.HTTP_409_CONFLICT)
        return Response(data, status=status.HTTP_200_OK)

class DeleteAccountAPIView(APIView):
    def post(self, request):
        id = request.data['id']
        accessToken = request.META.get('HTTP_AUTHORIZATION')
        headers = {
            'Authorization': accessToken
        }
        response = requests.delete('http://{}/api/account/{}/delete/'.format(ACCOUNT_URL, id), headers=headers)
        if response.status_code == 204:
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)

class CheckIfAccountExistsAPIView(APIView):
    def post(self, request):
        accessToken = request.META.get('HTTP_AUTHORIZATION')
        headers = {
            'Authorization': accessToken
        }
        response = requests.post(
            "http://{}/api/accountExists/".format(ACCOUNT_URL), json=request.data, headers=headers
        )
        data = response.json()
        return Response(data, status=response.status_code)


### END OF ADMIN CRUD ACCOUNTS VIEWS ###

### START OF ADMIN CRUD DOGS VIEWS ###


class GetDogAPIView(APIView):
    def post(self, request):
        id = request.data["id"]
        response = requests.get("http://{}/api/dogs/{}/".format(DOGS_URL, id))
        data = response.json()
        return Response(data, status=status.HTTP_200_OK)

class ListDogsAPIView(APIView):
    def get(self, request):
        response = requests.get("http://{}/api/dogs/".format(DOGS_URL))
        data = response.json()
        return Response(data, status=status.HTTP_200_OK)

class AddDogAPIView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        accessToken = request.META.get('HTTP_AUTHORIZATION')
        headers = {
            'Authorization': accessToken
        }
        data = request.data.dict()
        if data["categories"]:
            data["categories"] = [int(i) for i in data["categories"].split(",")]
        else:
            data["categories"] = []
        del data["image"]
        files = []
        for file in request.FILES.getlist("image"):
            files.append(("image", (file.name, file, file.content_type)))
        response = requests.post(
            "http://{}/api/dogs/".format(DOGS_URL), data=data, files=files, headers=headers
        )
        data = response.json()
        return Response(data, status=status.HTTP_201_CREATED)

class UpdateDogAPIView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        accessToken = request.META.get('HTTP_AUTHORIZATION')
        headers = {
            'Authorization': accessToken
        }
        id = request.data["id"]
        data = request.data.dict()
        if data["categories"]:
            data["categories"] = [int(i) for i in data["categories"].split(",")]
        else:
            data["categories"] = []
        del data["image"]
        files = []
        for file in request.FILES.getlist("image"):
            files.append(("image", (file.name, file, file.content_type)))
        response = requests.put(
            "http://{}/api/dogs/{}/update/".format(DOGS_URL, id), data=data, files=files, headers=headers
        )
        data = response.json()
        return Response(data, status=status.HTTP_200_OK)

class DeleteDogAPIView(APIView):
    def post(self, request):
        accessToken = request.META.get('HTTP_AUTHORIZATION')
        headers = {
            'Authorization': accessToken
        }
        id = request.data["id"]
        response = requests.delete("http://{}/api/dogs/{}/delete/".format(DOGS_URL, id), headers=headers)
        if response.status_code == 204:
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)

class CheckIfDogExistsAPIView(APIView):
    def post(self, request):
        response = requests.post(
            "http://{}/api/dogs/dogExists/".format(DOGS_URL), json=request.data
        )
        data = response.json()
        return Response(data, status=response.status_code)


### END OF ADMIN CRUD DOGS VIEWS ###

### START OF ADMIN CRUD DOG CATEGORIES VIEWS ###


class GetDogCategoryAPIView(APIView):
    def post(self, request):
        id = request.data["id"]
        response = requests.get(
            "http://{}/api/dogs/categories/{}/".format(DOGS_URL, id)
        )
        data = response.json()
        return Response(data, status=status.HTTP_200_OK)

class ListDogCategoriesAPIView(APIView):
    def get(self, request):
        response = requests.get("http://{}/api/dogs/categories/".format(DOGS_URL))
        data = response.json()
        return Response(data, status=status.HTTP_200_OK)

class AddDogCategoryAPIView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        accessToken = request.META.get('HTTP_AUTHORIZATION')
        headers = {
            'Authorization': accessToken
        }
        data = request.data.dict()
        del data["image"]
        files = []
        for file in request.FILES.getlist("image"):
            files.append(("image", (file.name, file, file.content_type)))
        response = requests.post(
            "http://{}/api/dogs/categories/".format(DOGS_URL), data=data, files=files, headers=headers
        )
        data = response.json()
        return Response(data, status=status.HTTP_201_CREATED)

class UpdateDogCategoryAPIView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        accessToken = request.META.get('HTTP_AUTHORIZATION')
        headers = {
            'Authorization': accessToken
        }
        id = request.data["id"]
        data = request.data.dict()
        del data["image"]
        files = []
        for file in request.FILES.getlist("image"):
            files.append(("image", (file.name, file, file.content_type)))
        response = requests.put(
            "http://{}/api/dogs/categories/{}/update/".format(DOGS_URL, id),
            data=data,
            files=files,
            headers=headers
        )
        data = response.json()
        return Response(data, status=status.HTTP_200_OK)

class DeleteDogCategoryAPIView(APIView):
    def post(self, request):
        accessToken = request.META.get('HTTP_AUTHORIZATION')
        headers = {
            'Authorization': accessToken
        }
        id = request.data["id"]
        response = requests.delete(
            "http://{}/api/dogs/categories/{}/delete/".format(DOGS_URL, id), headers=headers
        )
        if response.status_code == 204:
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)

class CheckIfDogCategoryExistsAPIView(APIView):
    def post(self, request):
        response = requests.post(
            "http://{}/api/dogs/dogCategoryExists/".format(DOGS_URL), json=request.data
        )
        data = response.json()
        return Response(data, status=response.status_code)


### END OF ADMIN CRUD DOG CATEGORIES VIEWS ###

### START OF PUBLIC-RELATED VIEWS ###


class PublicListDogsAPIView(APIView):
    def get(self, request):
        response = requests.get('http://{}/api/dogs/public/'.format(DOGS_URL))
        data = response.json()
        return Response(data, status=status.HTTP_200_OK)
    
class PublicListDogCategoriesAPIView(APIView):
    def get(self, request):
        response = requests.get('http://{}/api/dogs/public/categories/'.format(DOGS_URL))
        data = response.json()
        return Response(data, status=status.HTTP_200_OK)

class ListDogsByCategoryAPIView(APIView):
    def post(self, request):
        response = requests.post(
            "http://{}/api/dogs/byCategory/".format(DOGS_URL), json=request.data
        )
        data = response.json()
        return Response(data, status=status.HTTP_200_OK)


### END OF PUBLIC-RELATED VIEWS ###

### START OF PAYMENT-RELATED VIEWS ###


class DonateAPIView(APIView):
    def post(self, request):
        response = requests.post('http://{}/api/payment/create-checkout-session/'.format(PAYMENT_URL), json=request.data)
        data = response.json()
        if response.status_code == 200:
            return Response(data, status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)

class UpdateDogSponsorAPIView(APIView):
    def post(self, request):
        response = requests.post('http://{}/api/dogs/updateDogSponsor/'.format(DOGS_URL), json=request.data)
        data = response.json()
        if response.status_code == 200:
            return Response(data, status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)

class GetPaymentAPIView(APIView):
    def post(self, request):
        id = request.data['id']
        accessToken = request.META.get('HTTP_AUTHORIZATION')
        headers = {
            'Authorization': accessToken
        }
        response = requests.get('http://{}/api/payment/{}/'.format(PAYMENT_URL, id), headers=headers)
        data = response.json()
        return Response(data, status=status.HTTP_200_OK)

class ListPaymentsAPIView(APIView):
    def get(self, request):
        accessToken = request.META.get('HTTP_AUTHORIZATION')
        headers = {
            'Authorization': accessToken
        }
        response = requests.get('http://{}/api/payment/'.format(PAYMENT_URL), headers=headers)
        data = response.json()
        return Response(data, status=status.HTTP_200_OK)

class DeletePaymentAPIView(APIView):
    def post(self, request):
        id = request.data['id']
        accessToken = request.META.get('HTTP_AUTHORIZATION')
        headers = {
            'Authorization': accessToken
        }
        response = requests.delete('http://{}/api/payment/{}/delete/'.format(PAYMENT_URL, id), headers=headers)
        if response.status_code == 204:
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)

### END OF PAYMENT-RELATED VIEWS ###

### START OF EMAIL VIEWS ###

class SendDonationEmailAPIView(APIView):
    def post(self, request):
        response = requests.post('http://{}/api/email/sendDonationEmail/'.format(EMAIL_URL), json=request.data)
        data = response.json()
        if response.status_code == 200:
            return Response(data, status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)


### END OF EMAIL VIEWS ###

### START OF WALK RECORDS VIEWS ###


class GetWalkAPIView(APIView):
    def post(self, request):
        id = request.data['id']
        response = requests.get('http://{}/api/walks/{}/'.format(WALKS_URL, id))
        data = response.json()
        return Response(data, status=status.HTTP_200_OK)

class ListWalksAPIView(APIView):
    def get(self, request):
        accessToken = request.META.get('HTTP_AUTHORIZATION')
        headers = {
            'Authorization': accessToken
        }
        response = requests.get('http://{}/api/walks/'.format(WALKS_URL), headers=headers)
        data = response.json()
        return Response(data, status=status.HTTP_200_OK)
    
class AddWalkAPIView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    
    def post(self, request):
        accessToken = request.META.get('HTTP_AUTHORIZATION')
        headers = {
            'Authorization': accessToken
        }
        data = request.data.dict()
        response = requests.post('http://{}/api/walks/'.format(WALKS_URL), data=data, headers=headers)
        data = response.json()
        return Response(data, status=status.HTTP_201_CREATED)
    
class UpdateWalkAPIView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    
    def post(self, request):
        id = request.data['id']
        accessToken = request.META.get('HTTP_AUTHORIZATION')
        headers = {
            'Authorization': accessToken
        }
        data = request.data.dict()
        response = requests.put('http://{}/api/walks/{}/update/'.format(WALKS_URL, id), data=data, headers=headers)
        data = response.json()
        return Response(data, status=status.HTTP_200_OK)

class DeleteWalkAPIView(APIView):
    def post(self, request):
        id = request.data['id']
        accessToken = request.META.get('HTTP_AUTHORIZATION')
        headers = {
            'Authorization': accessToken
        }
        response = requests.delete('http://{}/api/walks/{}/delete/'.format(WALKS_URL, id), headers=headers)
        if response.status_code == 204:
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)


### END OF WALK RECORDS VIEWS ###

