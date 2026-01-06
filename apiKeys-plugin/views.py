import json
import os
from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from loginSystem.models import Administrator
from .apiKeyManager import APIKeyManager


def get_plugin_version():
    """Read the plugin version from version.json."""
    try:
        version_file = os.path.join(os.path.dirname(__file__), 'version.json')
        with open(version_file, 'r') as f:
            data = json.load(f)
            return data.get('version', '1.0.0')
    except:
        return '1.0.0'


def apiKeysHome(request):
    """Render the API Keys management page."""
    try:
        userID = request.session['userID']
        admin = Administrator.objects.get(pk=userID)
        
        # Only allow admin user to manage API keys
        if admin.userName != 'admin':
            return redirect('/login')
        
        return render(request, 'apiKeys/apiKeys.html', {
            'admin': True,
            'serverHost': request.META.get('HTTP_HOST', 'your-server.com:8090'),
            'plugin_version': get_plugin_version()
        })
    except KeyError:
        return redirect('/login')
    except Administrator.DoesNotExist:
        return redirect('/login')


@csrf_exempt
def createKey(request):
    """AJAX endpoint to create a new API key."""
    try:
        userID = request.session['userID']
        admin = Administrator.objects.get(pk=userID)
        data = json.loads(request.body)
        akm = APIKeyManager(admin)
        return akm.createKey(data)
    except Exception as e:
        return HttpResponse(json.dumps({
            'status': 0,
            'error_message': str(e)
        }))


@csrf_exempt
def listKeys(request):
    """AJAX endpoint to list all API keys for current admin."""
    try:
        userID = request.session['userID']
        admin = Administrator.objects.get(pk=userID)
        akm = APIKeyManager(admin)
        return akm.listKeys()
    except Exception as e:
        return HttpResponse(json.dumps({
            'status': 0,
            'error_message': str(e)
        }))


@csrf_exempt
def toggleKey(request, key_id):
    """AJAX endpoint to toggle API key active status (new URL format)."""
    try:
        userID = request.session['userID']
        admin = Administrator.objects.get(pk=userID)
        akm = APIKeyManager(admin)
        return akm.revokeKey({'keyID': key_id})
    except Exception as e:
        return HttpResponse(json.dumps({
            'status': 0,
            'error_message': str(e)
        }))


@csrf_exempt
def revokeKey(request):
    """AJAX endpoint to toggle API key active status (legacy)."""
    try:
        userID = request.session['userID']
        admin = Administrator.objects.get(pk=userID)
        data = json.loads(request.body)
        akm = APIKeyManager(admin)
        return akm.revokeKey(data)
    except Exception as e:
        return HttpResponse(json.dumps({
            'status': 0,
            'error_message': str(e)
        }))


@csrf_exempt
def deleteKey(request, key_id):
    """AJAX endpoint to delete an API key (new URL format)."""
    try:
        userID = request.session['userID']
        admin = Administrator.objects.get(pk=userID)
        akm = APIKeyManager(admin)
        return akm.deleteKey({'keyID': key_id})
    except Exception as e:
        return HttpResponse(json.dumps({
            'status': 0,
            'error_message': str(e)
        }))


@csrf_exempt
def deleteKeyLegacy(request):
    """AJAX endpoint to delete an API key (legacy)."""
    try:
        userID = request.session['userID']
        admin = Administrator.objects.get(pk=userID)
        data = json.loads(request.body)
        akm = APIKeyManager(admin)
        return akm.deleteKey(data)
    except Exception as e:
        return HttpResponse(json.dumps({
            'status': 0,
            'error_message': str(e)
        }))


@csrf_exempt
def getMCPConfig(request):
    """AJAX endpoint to get MCP configuration JSON for a key."""
    try:
        userID = request.session['userID']
        admin = Administrator.objects.get(pk=userID)
        data = json.loads(request.body)
        akm = APIKeyManager(admin)
        return akm.getMCPConfig(data)
    except Exception as e:
        return HttpResponse(json.dumps({
            'status': 0,
            'error_message': str(e)
        }))
