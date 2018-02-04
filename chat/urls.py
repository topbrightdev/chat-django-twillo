from django.conf.urls import url
from . import views


urlpatterns = [
    url(r'^$', views.all_rooms, name="all_rooms"),
    url(r'token$', views.token, name="token"),
    url(r'rooms/(?P<slug>[-\w]+)/$', views.room_detail, name="room_detail"),
]
