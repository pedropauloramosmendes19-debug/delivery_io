from django.urls import path
from .views import BuildingListAPIView

urlpatterns = [
    path('/api/buildings/', BuildingListAPIView.as_view(), name='api_buildings_list'),
]
