from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from building.models import Building

User = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    building_id = serializers.PrimaryKeyRelatedField(
        queryset=Building.objects.all(), 
        source='building',
        required=False,
        allow_null=True
    )

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'building_id')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            building=validated_data.get('building')
        )
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Adicionar dados extras na resposta do login
        data['username'] = self.user.username
        data['id'] = self.user.id
        data['building'] = self.user.building.building_name if self.user.building else None
        
        return data
