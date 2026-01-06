import json
from django.http import HttpResponse
from .models import APIKey


class APIKeyManager:
    """Business logic manager for API Key operations."""
    
    def __init__(self, admin=None):
        self.admin = admin
    
    def ajaxPre(self, status, errorMessage):
        """Standard CyberPanel AJAX response format."""
        return HttpResponse(json.dumps({
            'status': status,
            'error_message': errorMessage
        }))
    
    def createKey(self, data):
        """Create a new API key for the current admin.
        
        The raw key is returned ONLY in this response.
        It cannot be retrieved later as only the hash is stored.
        """
        try:
            name = data.get('name', 'Unnamed Key')
            api_key, raw_key = APIKey.create_key(
                admin=self.admin,
                name=name
            )
            return HttpResponse(json.dumps({
                'status': 1,
                'key': raw_key,  # ONLY time the raw key is shown
                'id': api_key.id,
                'name': api_key.name,
                'key_prefix': api_key.key_prefix,
                'created_at': api_key.created_at.isoformat(),
                'warning': 'Save this key now! It cannot be shown again.'
            }))
        except Exception as e:
            return self.ajaxPre(0, str(e))
    
    def listKeys(self):
        """List all API keys for the current admin.
        
        Only shows key_prefix (not the full key, which is not stored).
        """
        try:
            keys = APIKey.objects.filter(admin=self.admin)
            key_list = [{
                'id': k.id,
                'name': k.name,
                'key_preview': f"{k.key_prefix}...",
                'created_at': k.created_at.isoformat(),
                'last_used': k.last_used.isoformat() if k.last_used else None,
                'is_active': k.is_active
            } for k in keys]
            return HttpResponse(json.dumps({
                'status': 1,
                'keys': key_list
            }))
        except Exception as e:
            return self.ajaxPre(0, str(e))
    
    def revokeKey(self, data):
        """Toggle the active status of an API key."""
        try:
            key_id = data.get('keyID')
            api_key = APIKey.objects.get(id=key_id, admin=self.admin)
            api_key.is_active = not api_key.is_active
            api_key.save()
            return HttpResponse(json.dumps({
                'status': 1,
                'is_active': api_key.is_active
            }))
        except APIKey.DoesNotExist:
            return self.ajaxPre(0, 'API key not found')
        except Exception as e:
            return self.ajaxPre(0, str(e))
    
    def deleteKey(self, data):
        """Delete an API key."""
        try:
            key_id = data.get('keyID')
            APIKey.objects.get(id=key_id, admin=self.admin).delete()
            return HttpResponse(json.dumps({'status': 1}))
        except APIKey.DoesNotExist:
            return self.ajaxPre(0, 'API key not found')
        except Exception as e:
            return self.ajaxPre(0, str(e))
    
    def getMCPConfig(self, data):
        """Generate MCP configuration JSON for a specific API key.
        
        Note: This returns a template - user must paste their saved key.
        We cannot retrieve the raw key as only the hash is stored.
        """
        try:
            key_id = data.get('keyID')
            host = data.get('host', 'https://your-server.com:8090')
            api_key = APIKey.objects.get(id=key_id, admin=self.admin)
            
            # VS Code mcp.json configuration
            vscode_config = {
                'servers': {
                    'cyberpanel': {
                        'type': 'stdio',
                        'command': 'node',
                        'args': ['/path/to/cyberpanel-mcp/dist/index.js'],
                        'env': {
                            'CYBERPANEL_HOST': host,
                            'CYBERPANEL_API_KEY': f'{api_key.key_prefix}... (paste your saved key)'
                        }
                    }
                }
            }
            
            # Claude Desktop claude_desktop_config.json configuration
            claude_config = {
                'mcpServers': {
                    'cyberpanel': {
                        'command': 'node',
                        'args': ['/path/to/cyberpanel-mcp/dist/index.js'],
                        'env': {
                            'CYBERPANEL_HOST': host,
                            'CYBERPANEL_API_KEY': f'{api_key.key_prefix}... (paste your saved key)'
                        }
                    }
                }
            }
            
            return HttpResponse(json.dumps({
                'status': 1,
                'vscode_config': json.dumps(vscode_config, indent=2),
                'claude_config': json.dumps(claude_config, indent=2),
                'note': 'Paste your saved API key in place of the placeholder'
            }))
        except APIKey.DoesNotExist:
            return self.ajaxPre(0, 'API key not found')
        except Exception as e:
            return self.ajaxPre(0, str(e))
    
    @staticmethod
    def validateKey(key_value):
        """Validate an API key and return the associated admin if valid.
        
        This method is called by the cloudAPI authentication patch.
        """
        api_key = APIKey.validate_key(key_value)
        if api_key:
            return api_key.admin
        return None
