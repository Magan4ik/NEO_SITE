from django.urls import path
from neo import views

app_name = 'neo'

urlpatterns = [
    path('', views.main_page, name="main")
]
