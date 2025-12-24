from django.urls import path
from . import views
from .metric_data import DashboardView


urlpatterns = [
    path('package/list/', views.PackageListView.as_view(), name='packages_list'),
    path('package/create/', views.PackageCreateView.as_view(), name='package_create'),
    path('package/<int:pk>', views.PackageDetailView.as_view(),name='package_detail'),
    path('package/<int:pk>/update/', views.PackageUpdateView.as_view(), name='package_update'),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('api/packages/list/', views.PackageListCreateAPIView.as_view(),name='api_create_list_package'),
    path('api/retrieve/update/<int:pk>/', views.PackageUpdateDetailAPIView.as_view(),name='api_retrieve_detail_view'),
    path('api/spy/', views.EspiaoView.as_view(), name='api_spy_data')
]
