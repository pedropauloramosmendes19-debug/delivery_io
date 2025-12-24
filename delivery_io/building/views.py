from rest_framework import generics
from .models import Building
from .serializers import BuildingSerializer
from rest_framework.permissions import AllowAny

class BuildingListAPIView(generics.ListAPIView):
    queryset = Building.objects.all()
    serializer_class = BuildingSerializer
    permission_classes = [AllowAny]
