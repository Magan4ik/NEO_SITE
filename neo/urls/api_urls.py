from django.urls import path
from neo.views import api_views

app_name = 'api'

urlpatterns = [
    path('get-model/', api_views.get_model, name="get_model"),
]