from django.http import HttpRequest, HttpResponse, JsonResponse
from django.shortcuts import render
from django.http import FileResponse
import os
from config import settings

# Create your views here.


def get_model(request: HttpRequest) -> FileResponse:
    filepath = os.path.join(settings.BASE_DIR / "static" / "models", 'roma_model.obj')
    return FileResponse(open(filepath, 'rb'), content_type='application/octet-stream')


def get_solar_system_models(request):

    models_data = [
        {
            'name': '433 Eros (A898 PA)',
            'diameter': '16.84 km',
            'absolute_magnitude_param': "10.41",
            'magnitude_slope_param': "0.46",
            'standard_gravitational_param': "4.463e-04 km^3/s^2",
            'obj_url': os.path.join(settings.MEDIA_URL, 'models/Eros433.obj'),
            'size': 0.2,
            'position': {'x': -10, 'y': 0, 'z': 0}
        },
        {
            'name': '433 Eros (A898 PA)',
            'diameter': '16.84 km',
            'absolute_magnitude_param': "10.41",
            'magnitude_slope_param': "0.46",
            'standard_gravitational_param': "4.463e-04 km^3/s^2",
            'obj_url': os.path.join(settings.MEDIA_URL, 'models/Eros433-2.obj'),
            'size': 0.2,
            'position': {'x': 10, 'y': 0, 'z': 0}
        },
        # {
        #     'name': 'Venus',
        #     'obj_url': os.path.join(settings.MEDIA_URL, 'models/model.obj'),
        #     'size': 1.6,
        #     'position': {'x': 15, 'y': 0, 'z': 0}
        # },
    ]

    return JsonResponse(models_data, safe=False)
