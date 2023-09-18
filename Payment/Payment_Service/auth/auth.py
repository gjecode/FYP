from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
import requests
from dotenv import load_dotenv
import os

load_dotenv()

class CustomJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        token = self.get_token(request)
        
        endpoint = "http://{}/verifyToken/".format(os.environ.get("ORCHESTRATOR_URL")) 
        r = requests.post(endpoint, json={'token': token})

        if r.status_code == 200:
            return None, token

        raise AuthenticationFailed('Invalid or expired token!')

    def get_token(self, request):
        authorization_header = request.META.get('HTTP_AUTHORIZATION')
        if authorization_header and authorization_header.startswith('Bearer '):
            return authorization_header.split(' ')[1]
        return None