import json

from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

from djblth.models import User

from djblth.models import Doctor


class UserExerciseInfo:
    """
    Класс для обработки данных от пользователей во время выполнения упражнения
    """

    def __init__(self):
        """
        Инициализация класса
        """
        self.current_data = []

    def create_empty_data(self, user_id):
        """
        Создание пустой заготовки для хранения данных пользователя
        :param user_id: id пользователя
        :return:
        """
        ed = {
            'user_id': user_id,
            'context': [''],
            'graph_data': [],
            'current_cycle': [1],
            'exercise_settings': {
                'work': [''],
                'rest': [''],
                'cycles': [''],
            },
            'device_settings': {
                'grain': [''],
                'filter_freq': [''],
                'noise_lvl_out': [''],
                'noise_lvl_in': [''],
                'slide_average': [''],
                'average_ms': [''],
            }
        }
        self.current_data.append(ed)

    def get_graph_data(self, user_id):
        """
        Получение данный графика
        :param user_id: id пользователя
        :return: list с данными графика
        """
        resp = None
        res = self.search(user_id)
        if res is not None:
            resp = res.get('graph_data')
        return resp

    def update_graph_data(self, data):
        """
        Обновление данных графика
        :param data: данные от пользователя
        :return:
        """
        res = self.search(data.get('user_id'))
        if res is None:
            self.create_empty_data(data.get('user_id'))
            res = self.search(data.get('user_id'))
            res.get('graph_data').append(data.get('new_data'))
        else:
            res.get('graph_data').append(data.get('new_data'))

    def clear_graph_data(self, user_id):
        """
        Очистка данных графика
        :param user_id: id пользователя
        :return:
        """
        res = self.search(user_id)
        if res is not None:
            res.get('graph_data').clear()

    def get_context(self, user_id):
        """
        Получение текущего контекста
        :param user_id: id пользователя
        :return: str текущий контекст
        """
        resp = None
        res = self.search(user_id)
        if res is not None:
            resp = res.get('context')[0]
        return resp

    def update_context(self, data):
        """
        Обновление контекста пользователя
        :param data: данные от пользователя
        :return:
        """
        res = self.search(data.get('user_id'))
        if res is None:
            self.create_empty_data(data.get('user_id'))
            res = self.search(data.get('user_id'))
            res.get('context')[0] = data.get('context')
            if res.get('context')[0] == 'rest':
                self.clear_graph_data(data.get('user_id'))
        else:
            res.get('context')[0] = data.get('context')
            if res.get('context')[0] == 'rest':
                self.clear_graph_data(data.get('user_id'))

    def get_all_data(self, user_id):
        """
        Получение всей информации по id пользователя
        :param user_id: id пользователя
        :return: информация о текущем состоянии
        """
        res = self.search(user_id)
        return res

    def set_new_exercise_parameters(self, new_parameters):
        """
        Установка новых параметров упражнения
        :param new_parameters: новые параметры успражнения
        :return:
        """
        res = self.search(new_parameters.get('user_id'))
        if res is None:
            self.create_empty_data(new_parameters.get('user_id'))
            res = self.search(new_parameters.get('user_id'))
        res.get('exercise_settings').get('work')[0] = new_parameters.get("work")
        res.get('exercise_settings').get('rest')[0] = new_parameters.get("rest")
        res.get('exercise_settings').get('cycles')[0] = new_parameters.get("cycles")

    def set_current_cycle(self, user_id, cycle_number):
        """
        Метод устанавливает номер текущего цикла
        :param user_id: id пользователя
        :param cycle_number: новый номер цикла
        :return:
        """
        res = self.search(user_id)
        if res is None:
            self.create_empty_data(user_id)
            res = self.search(user_id)
        res.get('current_cycle')[0] = cycle_number

    def get_current_cycle(self, user_id):
        """
        Метод ывозвращает номер текущего цикла
        :param user_id: id пользователя
        :return: int номер текущего цикла
        """
        resp = None
        res = self.search(user_id)
        if res is not None:
            resp = res.get('current_cycle')[0]
        return resp

    def search(self, user_id):
        """
        Поиск записи пользователя в общей информации
        :param user_id: id пользователя
        :return: dist если запись есть, None - если записи нет
        """
        for i in range(len(self.current_data)):
            if self.current_data[i].get('user_id') == user_id:
                return self.current_data[i]
        return None


class ExercisePages:
    def __init__(self):
        pass

    def djblth(self, request):
        return render(request, 'index.html', {})

    def view_graph(self, request):
        return render(request, 'index2.html', {})


class UsersManager:
    """
    Класс для работы с информацией о пользователях
    """

    def __init__(self):
        pass

    @staticmethod
    def get_all_users():
        """
        Получение всех пользователей
        :return: list пользователей
        """
        users = []
        for user in User.objects.raw('SELECT * from djblth_user'):
            users.append([user.userName, user.userId])
        # d = Doctor(doctorId='Doctor1', doctorPassword='1111', doctorName='Olga',
        #            doctorPatients="{'patientsIDs': ['Patient1', 'Patient2', 'Patient3']}")
        # d.save()
        return users


class RequestsManager:
    """
    Класс для обработки запросов
    """

    def __init__(self):
        """
        Инициализация класса
        """
        self.exercise_info = UserExerciseInfo()
        self.users_info = UsersManager()

        self.response = {
            'is_taken': 'true'
        }

    @csrf_exempt
    def set_value(self, request):
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)

        data = {'user_id': body.get('user_id'), 'new_data': body.get('new_data')}
        self.exercise_info.update_graph_data(data)
        return JsonResponse(self.response)

    @csrf_exempt
    def set_context(self, request):
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)

        data = {'user_id': body.get('user_id'), 'context': body.get('context')}
        self.exercise_info.update_context(data)
        return JsonResponse(self.response)

    @csrf_exempt
    def get_all_users(self, request):
        resp = {'users_list': self.users_info.get_all_users()}
        return JsonResponse(resp)

    @csrf_exempt
    def online_mode_data(self, request):
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)
        user_id = body.get('user_id')
        resp = None
        if user_id is not None:
            resp = self.exercise_info.get_all_data(user_id)
        return JsonResponse({'resp': 'error'}) if resp is None else JsonResponse(resp)

    @csrf_exempt
    def set_new_exercise_parameters(self, request):
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)
        self.exercise_info.set_new_exercise_parameters(body)
        return JsonResponse({'resp': 'OK'})

    @csrf_exempt
    def get_graph_data(self, request):
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)
        user_id = body.get('user_id')
        resp = None
        if user_id is not None:
            resp = {'graph_data': self.exercise_info.get_graph_data(user_id),
                    'context': self.exercise_info.get_context(user_id),
                    'current_cycle': self.exercise_info.get_current_cycle(user_id)}
        return JsonResponse({'resp': 'error'}) if resp is None else JsonResponse(resp)

    @csrf_exempt
    def clear_graph_data(self, request):
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)
        user_id = body.get('user_id')
        self.exercise_info.clear_graph_data(user_id)
        return JsonResponse(self.response)

    @csrf_exempt
    def set_cycle_number(self, request):
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)
        user_id = body.get('user_id')
        cycle_number = body.get('cycle_number')
        self.exercise_info.set_current_cycle(user_id, cycle_number)
        return JsonResponse(self.response)

    @csrf_exempt
    def get_current_cycle(self, request):
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)
        user_id = body.get('user_id')
        resp = None
        if user_id is not None:
            resp = {'current_cycle': self.exercise_info.get_current_cycle(user_id)}
        return JsonResponse({'resp': 'error'}) if resp is None else JsonResponse(resp)


    def get_value(self, requset):
        # print(request.data)
        response = {
            'new_value': 0,
            'new_y': 0
        }
        return JsonResponse(response)

    def stop_value(self, requset):
        # print(request.data)
        response = {
            'new_value': 0,
            'new_y': 0
        }
        return JsonResponse(response)
