from rest_framework import serializers

from .models import Walk

class WalkSerializer(serializers.ModelSerializer):    
    class Meta:
        model = Walk
        fields = '__all__'
        
        