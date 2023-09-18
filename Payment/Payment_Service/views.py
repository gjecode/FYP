import stripe
import pytz
from dotenv import load_dotenv
import os
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import datetime, timedelta
import requests
from rest_framework import generics

from .auth.auth import CustomJWTAuthentication
from rest_framework.permissions import AllowAny

from .models import Donation
from . serializers import DonationSerializer

load_dotenv()

ORCHESTRATOR_URL = os.environ.get('ORCHESTRATOR_URL')
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')

# handles stripe checkout process
class StripeCheckoutView(APIView):
    authentication_classes = []
    permission_classes = (AllowAny,)
    
    def post(self, request):
        try:
            dogID = request.data['dogID']
            
            checkout_session = stripe.checkout.Session.create(
                line_items=[
                    {
                        'price': 'price_1NSKIzIhKWK4H8LW4mq6Pkyn',
                        'quantity': 1,
                    },
                ],
                mode='payment',
                success_url=os.environ.get('FRONTEND_URL') + '/success/{}/'.format(dogID),
                cancel_url=os.environ.get('FRONTEND_URL'),
                metadata={
                    'dogID': str(dogID),
                }
            )

            return Response({'url': checkout_session.url}, status=status.HTTP_200_OK)
        except:
            return Response({'error': 'Stripe Checkout API failed!'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# webhook that listens in real-time to stripe events
## -> if payment is successful (checkout-session-completed), send email to donater and update sponsor for dog
### NOTE if webhook is running on stripe-side, and server is deployed, dev-cloud webhook view will conflict
class StripeWebhookView(APIView):
    authentication_classes = []
    permission_classes = (AllowAny,)
    
    def post(self, request):
        endpoint_secret = os.environ.get('STRIPE_WEBHOOK_SECRET')
        payload = request.body
        sig_header = request.META['HTTP_STRIPE_SIGNATURE']
        event = None

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, endpoint_secret
            )
        except:
            return Response({'error': 'Stripe Webhook error!'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        if event['type'] == 'checkout.session.completed':
            
            checkoutSessionID = event['data']['object']['id']
            customerEmail = event['data']['object']['customer_details']['email']
            customerName = event['data']['object']['customer_details']['name']
            paymentIntent = event['data']['object']['payment_intent']
            amountTotal = event['data']['object']["amount_total"]
            currency = event['data']['object']["currency"].upper()
            timestamp = event['data']['object']['created']
            tz = pytz.timezone('Asia/Singapore')
            createdAt = datetime.fromtimestamp(timestamp, tz=tz)
            dogID = event['data']['object']['metadata']['dogID']
            sponsorExpirationDate = createdAt + timedelta(days=30) 

            Donation.objects.create(
                dogID=dogID,
                checkoutSessionID=checkoutSessionID,
                customerEmail=customerEmail,
                customerName=customerName,
                paymentIntent=paymentIntent,
                amountTotal=amountTotal,
                currency=currency,
                createdAt=createdAt,
            ) 
            
            data = {
                'id': dogID,
                'sponsorExpirationDate': sponsorExpirationDate.timestamp()
            }
            response = requests.post('http://{}/updateDogSponsor/'.format(ORCHESTRATOR_URL), json=data)
            data = response.json()
            dogName = data["dog_name"] 

            data = {
                'paymentID': paymentIntent,
                'recepient_email': customerEmail,
                'recepient_name': customerName.split()[0],
                "dog_name": dogName,
                "amount_paid": "{} {}".format('{:,.2f}'.format(amountTotal/100.0), currency)
            }
            response = requests.post('http://{}/sendDonationEmail/'.format(ORCHESTRATOR_URL), json=data)
        return Response(status=status.HTTP_200_OK)

# Get a payment object given its primary key
class PaymentDetailAPIView(generics.RetrieveAPIView):
    authentication_classes = (CustomJWTAuthentication, )
    permission_classes = (AllowAny,)
    
    queryset = Donation.objects.all()
    serializer_class = DonationSerializer
    lookup_field = 'pk'

# Get ALL payment objects 
class PaymentListAPIView(generics.ListAPIView):
    authentication_classes = (CustomJWTAuthentication, )
    permission_classes = (AllowAny,)
    
    queryset = Donation.objects.all()
    serializer_class = DonationSerializer

# Delete payment object given its primary key
class PaymentDestroyAPIView(generics.DestroyAPIView):
    authentication_classes = (CustomJWTAuthentication, )
    permission_classes = (AllowAny,)
    
    queryset = Donation.objects.all()
    serializer_class = DonationSerializer
    lookup_field = 'pk'
    
    def perform_destroy(self, instance):
        super().perform_destroy(instance)