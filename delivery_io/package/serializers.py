from rest_framework import serializers
from .models import Package


class PackageSerializer(serializers.ModelSerializer):
    package_type_name = serializers.CharField(source='package_type.type', read_only=True)

    class Meta:
        model = Package
        fields = ['id',
                  'owner_name',
                  'ap_number',
                  'package_type',
                  'package_type_name',
                  'photo_field',
                  'created_at'
        ]