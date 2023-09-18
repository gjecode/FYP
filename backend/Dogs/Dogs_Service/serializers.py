from rest_framework import serializers
from datetime import datetime

from .models import Dog, DogCategory

class DogSerializer(serializers.ModelSerializer):    
    age = serializers.SerializerMethodField()
    
    class Meta:
        model = Dog
        fields = ['id', 'microchipID', 'name', 'desc', 'image', 'is_sponsored', 'vaccinationDate', 'categories', 'DOB', 'age', 'gender', 'sponsorExpirationDate']
    
    def get_age(self, obj):
        if obj.DOB:
            current_year = datetime.now().year
            birth_year = obj.DOB.year
            age_in_years = current_year - birth_year
            return age_in_years
        return None
        
class DogCategorySerializer(serializers.ModelSerializer):    
    class Meta:
        model = DogCategory
        fields = '__all__'