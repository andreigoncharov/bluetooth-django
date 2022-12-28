from djblth.views import ExercisePages, RequestsManager
from django.urls import path

ep = ExercisePages()
rm = RequestsManager()

urlpatterns = [
    path('', ep.djblth, name='index'),
    path('view_graph', ep.view_graph, name='view_graph'),

    path('set_value', rm.set_value, name='set_value'),
    path('set_context', rm.set_context, name='set_context'),
    path('get_value', rm.get_value, name='get_value'),
    path('stop_value', rm.stop_value, name='stop_value'),

    path('get_all_users', rm.get_all_users, name='get_all_users'),
    path('online_mode_data', rm.online_mode_data, name='online_mode_data'),
    path('set_new_exercise_parameters', rm.set_new_exercise_parameters, name='set_new_exercise_parameters'),
    path('get_graph_data', rm.get_graph_data, name='get_graph_data'),
    path('clear_graph_data', rm.clear_graph_data, name='clear_graph_data'),
    path('set_cycle_number', rm.set_cycle_number, name='set_cycle_number'),
    path('get_current_cycle', rm.get_current_cycle, name='get_current_cycle'),
]