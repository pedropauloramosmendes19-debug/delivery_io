from django.urls import path
from .views import TypeListAPIView

urlpatterns = [
    path('api/types/', TypeListAPIView.as_view(), name='type-list'),
]
