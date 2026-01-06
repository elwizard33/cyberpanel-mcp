from django.urls import path
from . import views

urlpatterns = [
    path('', views.apiKeysHome, name='apiKeys'),
    # API endpoints - match the JS fetch calls in template
    path('api/keys/', views.listKeys, name='listAPIKeys'),
    path('api/keys/create/', views.createKey, name='createAPIKey'),
    path('api/keys/<int:key_id>/toggle/', views.toggleKey, name='toggleAPIKey'),
    path('api/keys/<int:key_id>/delete/', views.deleteKey, name='deleteAPIKey'),
    # Legacy endpoints (keep for compatibility)
    path('createKey', views.createKey, name='createAPIKeyLegacy'),
    path('listKeys', views.listKeys, name='listAPIKeysLegacy'),
    path('revokeKey', views.revokeKey, name='revokeAPIKey'),
    path('deleteKey', views.deleteKeyLegacy, name='deleteAPIKeyLegacy'),
    path('getMCPConfig', views.getMCPConfig, name='getMCPConfig'),
]
