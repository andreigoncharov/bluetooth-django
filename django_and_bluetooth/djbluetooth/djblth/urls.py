from djblth import views
from django.urls import path

urlpatterns = [path('', views.djblth, name='index'),
                path('view_graph', views.view_graph, name='view_graph'),
               path('validate_username', views.validate_username, name='validate_username'),
               path('set_value', views.set_value, name='set_value'),
               path('get_value', views.get_value, name='get_value'),
                path('stop_value', views.stop_value, name='stop_value'),
               ]
