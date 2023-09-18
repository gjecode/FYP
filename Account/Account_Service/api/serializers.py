from rest_framework import serializers
from rest_framework.exceptions import APIException
from django.contrib.auth import get_user_model

from ..models import CustomUser

User = get_user_model()

class APIException409(APIException):
    status_code = 409

class CustomUserSerializer(serializers.ModelSerializer):    
    class Meta:
        model = CustomUser
        fields = '__all__'
    
    def create(self, validated_data):
        user = User.objects.create_user(username=validated_data['username'], password=validated_data["password"], role=validated_data["role"])
        return user

    def update(self, instance, validated_data):
        user = User.objects.get(id=instance.id)
        user.username = validated_data['username']
        user.set_password(validated_data['password'])
        user.role = validated_data['role']
        user.save()
        return user

