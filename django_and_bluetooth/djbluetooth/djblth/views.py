import json

from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

CURRENT_X = None
CURRENT_y = None


def djblth(request):
    return render(request, 'index.html', {})


def view_graph(request):
    return render(request, 'index2.html', {})


def validate_username(request):
    """Проверка доступности логина"""
    print(request)
    response = {
        'is_taken': 'true'
    }
    return JsonResponse(response)


@csrf_exempt
def set_value(request):
    # global CURRENT_VALUE
    # CURRENT_VALUE = int(request.body.decode('UTF-8')[6:])
    req = request.body.decode('UTF-8')
    global CURRENT_X
    CURRENT_X = int(req[6:req.index('y=') - 1])
    global CURRENT_y
    CURRENT_y = int(req[req.index('y=') + 2:])
    response = {
        'is_taken': 'true'
    }
    return JsonResponse(response)


def get_value(requset):
    # print(request.data)
    global CURRENT_X
    global CURRENT_y
    response = {
        'new_value': CURRENT_X,
        'new_y': CURRENT_y
    }
    return JsonResponse(response)

def stop_value(requset):
    # print(request.data)
    global CURRENT_X
    CURRENT_X = None

    global CURRENT_y
    CURRENT_y = None
    response = {
        'new_value': CURRENT_X,
        'new_y': CURRENT_y
    }
    return JsonResponse(response)
