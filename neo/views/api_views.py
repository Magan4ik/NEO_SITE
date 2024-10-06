from datetime import timedelta

from django.http import HttpRequest, HttpResponse, JsonResponse
from django.shortcuts import render
from django.http import FileResponse
import os

from skyfield.constants import AU_KM
from skyfield.errors import EphemerisRangeError

from config import settings
from django.http import JsonResponse
from skyfield.api import Loader, Topos
from skyfield.positionlib import ICRF
import numpy as np


# Create your views here.


def get_model(request: HttpRequest) -> FileResponse:
    filepath = os.path.join(settings.BASE_DIR / "static" / "models", 'roma_model.obj')
    return FileResponse(open(filepath, 'rb'), content_type='application/octet-stream')


def get_solar_system_models(request):
    models_data = [
        {
            'name': 'Sun',
            'diameter': '16.84 km',
            'absolute_magnitude_param': "10.41",
            'magnitude_slope_param': "0.46",
            'standard_gravitational_param': "4.463e-04 km^3/s^2",
            'obj_url': os.path.join(settings.MEDIA_URL, 'models/sphere.obj'),
            'mtl_url': os.path.join(settings.MEDIA_URL, 'resources/sphere.mtl'),
            'texture_url': os.path.join(settings.MEDIA_URL, 'textures/sphere.jpg'),
            'size': 3,
            'position': {'x': 0, 'y': 0, 'z': 0},
            "year": 0
        },
        {
            'name': 'Mercury',
            'diameter': '16.84 km',
            'absolute_magnitude_param': "10.41",
            'magnitude_slope_param': "0.46",
            'standard_gravitational_param': "4.463e-04 km^3/s^2",
            'obj_url': os.path.join(settings.MEDIA_URL, 'models/sphere.obj'),
            'mtl_url': os.path.join(settings.MEDIA_URL, 'resources/sphere.mtl'),
            'texture_url': os.path.join(settings.MEDIA_URL, 'textures/sphere.jpg'),
            'size': 0.2,
            'position': {'x': 0, 'y': 0, 'z': 0},
            'year': 88,
        },
        {
            'name': 'Venus',
            'diameter': '16.84 km',
            'absolute_magnitude_param': "10.41",
            'magnitude_slope_param': "0.46",
            'standard_gravitational_param': "4.463e-04 km^3/s^2",
            'obj_url': os.path.join(settings.MEDIA_URL, 'models/sphere.obj'),
            'mtl_url': os.path.join(settings.MEDIA_URL, 'resources/sphere.mtl'),
            'texture_url': os.path.join(settings.MEDIA_URL, 'textures/sphere.jpg'),
            'size': 0.25,
            'position': {'x': 0, 'y': 0, 'z': 0},
            'year': 225,
        },
        {
            'name': 'Earth',
            'diameter': '16.84 km',
            'absolute_magnitude_param': "10.41",
            'magnitude_slope_param': "0.46",
            'standard_gravitational_param': "4.463e-04 km^3/s^2",
            'obj_url': os.path.join(settings.MEDIA_URL, 'models/sphere.obj'),
            'mtl_url': os.path.join(settings.MEDIA_URL, 'resources/sphere.mtl'),
            'texture_url': os.path.join(settings.MEDIA_URL, 'textures/sphere.jpg'),
            'size': 0.3,
            'position': {'x': 0, 'y': 0, 'z': 0},
            'year': 365,
        },
        {
            'name': 'Mars',
            'diameter': '16.84 km',
            'absolute_magnitude_param': "10.41",
            'magnitude_slope_param': "0.46",
            'standard_gravitational_param': "4.463e-04 km^3/s^2",
            'obj_url': os.path.join(settings.MEDIA_URL, 'models/sphere.obj'),
            'mtl_url': os.path.join(settings.MEDIA_URL, 'resources/sphere.mtl'),
            'texture_url': os.path.join(settings.MEDIA_URL, 'textures/sphere.jpg'),
            'size': 0.27,
            'position': {'x': 0, 'y': 0, 'z': 0},
            'year': 687,
        },
        {
            'name': 'Jupiter',
            'diameter': '16.84 km',
            'absolute_magnitude_param': "10.41",
            'magnitude_slope_param': "0.46",
            'standard_gravitational_param': "4.463e-04 km^3/s^2",
            'obj_url': os.path.join(settings.MEDIA_URL, 'models/sphere.obj'),
            'mtl_url': os.path.join(settings.MEDIA_URL, 'resources/sphere.mtl'),
            'texture_url': os.path.join(settings.MEDIA_URL, 'textures/sphere.jpg'),
            'size': 1,
            'position': {'x': 0, 'y': 0, 'z': 0},
            'year': 4332,
        },
        {
            'name': 'Saturn',
            'diameter': '16.84 km',
            'absolute_magnitude_param': "10.41",
            'magnitude_slope_param': "0.46",
            'standard_gravitational_param': "4.463e-04 km^3/s^2",
            'obj_url': os.path.join(settings.MEDIA_URL, 'models/sphere.obj'),
            'mtl_url': os.path.join(settings.MEDIA_URL, 'resources/sphere.mtl'),
            'texture_url': os.path.join(settings.MEDIA_URL, 'textures/sphere.jpg'),
            'size': 0.8,
            'position': {'x': 0, 'y': 0, 'z': 0},
            'year': 10759,
        },
        {
            'name': 'Uranus',
            'diameter': '16.84 km',
            'absolute_magnitude_param': "10.41",
            'magnitude_slope_param': "0.46",
            'standard_gravitational_param': "4.463e-04 km^3/s^2",
            'obj_url': os.path.join(settings.MEDIA_URL, 'models/sphere.obj'),
            'mtl_url': os.path.join(settings.MEDIA_URL, 'resources/sphere.mtl'),
            'texture_url': os.path.join(settings.MEDIA_URL, 'textures/sphere.jpg'),
            'size': 0.7,
            'position': {'x': 0, 'y': 0, 'z': 0},
            'year': 30688,
        },
        {
            'name': 'Neptune',
            'diameter': '16.84 km',
            'absolute_magnitude_param': "10.41",
            'magnitude_slope_param': "0.46",
            'standard_gravitational_param': "4.463e-04 km^3/s^2",
            'obj_url': os.path.join(settings.MEDIA_URL, 'models/sphere.obj'),
            'mtl_url': os.path.join(settings.MEDIA_URL, 'resources/sphere.mtl'),
            'texture_url': os.path.join(settings.MEDIA_URL, 'textures/sphere.jpg'),
            'size': 0.6,
            'position': {'x': 0, 'y': 0, 'z': 0},
            'year': 60182,
        },
    ]

    return JsonResponse(models_data, safe=False)


# Загружаем эфемериды
load = Loader('~/skyfield-data')  # Папка для данных эфемерид
planets = load('de421.bsp')  # Загружаем файл эфемерид
ts = load.timescale()

# Планеты, которые мы можем наблюдать
planet_names = {
    'Mercury': 'mercury barycenter',
    'Venus': 'venus barycenter',
    'Earth': 'earth',
    'Mars': 'mars barycenter',
    'Jupiter': 'jupiter barycenter',
    'Saturn': 'saturn barycenter',
    'Uranus': 'uranus barycenter',
    'Neptune': 'neptune barycenter',
}

SCALE_FACTOR = 50 / 150_000_000


def get_planet_coordinates(request, planet_name):
    days_delta = request.GET.get("days", 0)
    # Проверяем, что планета существует в словаре
    if planet_name.capitalize() not in planet_names:
        return JsonResponse({'error': 'Unknown planet name'}, status=400)

    # Текущее время
    t = ts.now() + int(days_delta)

    # Выбираем планету и Солнце
    planet = planets[planet_names[planet_name.capitalize()]]
    sun = planets['sun']

    # Получаем положение планеты относительно Солнца
    astrometric = planet.at(t).observe(sun)
    position = astrometric.position.km  # Получаем координаты в километрах

    x, y, z = [coord * SCALE_FACTOR for coord in position]

    return JsonResponse({
        'planet': planet_name.capitalize(),
        'coordinates': {
            'x': x,
            'y': y,
            'z': z,
        }
    })


def get_planet_orbit(request, planet_name):
    days = int(request.GET.get("year", 365)) + 2
    # Загрузка эфемерид
    ts = load.timescale()
    planets = load('de421.bsp')
    planet = planets[planet_names[planet_name.capitalize()]]
    sun = planets['sun']

    # Начальная дата - сегодня
    t0 = ts.now()

    # Создаем массив дат на несколько дней вперед
    dates = [t0 + timedelta(days=i) for i in range(0, days, 2)]

    # Получаем координаты планеты относительно Солнца
    positions = []
    for t in dates:
        try:
            astrometric = planet.at(t).observe(sun)
        except EphemerisRangeError:
            break
        distance = astrometric.position.au * AU_KM  # Преобразуем в километры
        x, y, z = [coord * SCALE_FACTOR for coord in distance]
        positions.append({'x': x, 'y': y, 'z': z})

    return JsonResponse({'positions': positions})