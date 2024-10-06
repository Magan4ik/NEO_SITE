from django.urls import path
from neo.views import api_views

app_name = 'api'

urlpatterns = [
    path('get-model/', api_views.get_model, name="get_model"),
    path('get-solar-system/', api_views.get_solar_system_models, name="get_solar_system"),
    path('get-current-coords/<str:planet_name>/', api_views.get_planet_coordinates, name="get_current_coords"),
    path('get-planet-orbit/<str:planet_name>/', api_views.get_planet_orbit, name="get_planet_orbit"),
]
