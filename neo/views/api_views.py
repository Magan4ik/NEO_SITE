from django.http import HttpRequest, HttpResponse
from django.shortcuts import render
from django.http import FileResponse
import os
from config.settings import BASE_DIR

# Create your views here.


def get_model(request: HttpRequest) -> FileResponse:
    filepath = os.path.join(BASE_DIR / "static", 'model.obj')
    return FileResponse(open(filepath, 'rb'), content_type='application/octet-stream')
