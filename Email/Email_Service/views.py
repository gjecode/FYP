import sendgrid
from rest_framework import status
from rest_framework.generics import GenericAPIView
from sendgrid.helpers.mail import (Mail, Email, Personalization)
from python_http_client import exceptions
from rest_framework.response import Response
from django.conf import settings

# if 401 error is thrown, that means something happened to sendgrid api key 
sg = sendgrid.SendGridAPIClient(settings.SENDGRID_API_KEY)

# instantiates sendgrid variables and sends email with specified payload to donater
class SendDonationEmailAPIView(GenericAPIView):
    def send_mail(self, template_id, sender, recipient, data_dict):
        mail = Mail()
        mail.template_id = template_id
        mail.from_email = Email(sender)
        personalization = Personalization()
        personalization.add_to(Email(recipient))
        personalization.dynamic_template_data = data_dict
        mail.add_personalization(personalization)
        try:
            response = sg.client.mail.send.post(request_body=mail.get())
        except exceptions.BadRequestsError as e:
            exit()

    def post(self, request):
        recepient_email = request.data['recepient_email']
        recepient_name = request.data['recepient_name']
        paymentID = request.data['paymentID']
        dog_name = request.data['dog_name']
        amount_paid = request.data['amount_paid']
        template_id = settings.TEMPLATE_ID
        sender = settings.DEFAULT_FROM_EMAIL
        data_dict = {
            "paymentID": paymentID, 
            "recepient_name": recepient_name, 
            "dog_name": dog_name, 
            "amount_paid": amount_paid
        }
        SendDonationEmailAPIView.send_mail(self, template_id, sender, recepient_email, data_dict)
        return Response({"message": "Mail sent successfully."}, status=status.HTTP_200_OK)
    
    