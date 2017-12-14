from django.conf.urls import url
from . import views


urlpatterns = [
    url(r'^$', views.rooms, name="rooms"),
    url(r'token$', views.token, name="token"),
    url(r'rooms/(?P<name>[-\w]+)/$', views.room_detail, name="room_detail"),
]
