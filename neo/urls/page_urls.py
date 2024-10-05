from django.urls import path
from neo.views import page_views, api_views

app_name = 'neo'

urlpatterns = [
    path('', page_views.main_page, name="main"),
]
