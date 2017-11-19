from django.conf.urls import url
from . import views


urlpatterns = [
    url(r'$', views.chat, name="chat"),
    url(r'^$', views.chat, name="chat"),
]
