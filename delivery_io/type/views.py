from rest_framework import generics
from .models import Type
from .serializers import TypeSerializer
from rest_framework.permissions import AllowAny

class TypeListAPIView(generics.ListAPIView):
    queryset = Type.objects.all()
    serializer_class = TypeSerializer
    permission_classes = [AllowAny]
