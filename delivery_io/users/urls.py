from django.urls import path
from .views import UserCreateView, RegisterAPIView


urlpatterns = [
    path('register/', UserCreateView.as_view(), name='create_user'),
    path('api/register/', RegisterAPIView.as_view(), name='api_register'),
]