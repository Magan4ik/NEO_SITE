from django.conf.urls.static import static
from django.urls import path

from config import settings
from neo.views import page_views, api_views

app_name = 'neo'

urlpatterns = [
    path('', page_views.main_page, name="main"),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
