from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,

)



from users.views import CustomTokenObtainPairView

urlpatterns = [
    path("admin/", admin.site.urls),


    path('', include('package.urls')),
    path('',include('users.urls')),
    path('', include('building.urls')),
    path('', include('type.urls')),

    path('accounts/', include('django.contrib.auth.urls')),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('', RedirectView.as_view(url='/accounts/login/')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)