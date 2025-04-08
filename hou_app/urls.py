from django.urls import path
from . import views


urlpatterns = [
    path('selection/', views.process_selection, name='process_selection'),
]
