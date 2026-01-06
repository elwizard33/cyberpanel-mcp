import secrets
import hashlib
from django.db import models
from django.utils import timezone


class APIKey(models.Model):
    """API Key model for MCP Server authentication.
    
    Security: Keys are stored as SHA-256 hashes. The raw key is only
    shown once at creation time and cannot be recovered.
    """
    admin = models.ForeignKey(
        'loginSystem.Administrator',
        on_delete=models.CASCADE,
        related_name='api_keys',
        db_column='admin_id'
    )
    key_hash = models.CharField(max_length=64, unique=True, db_index=True)
    key_prefix = models.CharField(max_length=15)  # "cp_abc123..." for identification
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    last_used = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'api_keys'
        managed = False  # Table is created by install script, not Django migrations
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.key_prefix}...)"
    
    @staticmethod
    def generate_key():
        """Generate a new API key with cp_ prefix.
        
        Returns the raw key - this is the ONLY time it's available.
        Store the hash, return raw key to user once.
        """
        return f'cp_{secrets.token_urlsafe(32)}'
    
    @staticmethod
    def hash_key(raw_key):
        """Hash a key using SHA-256 for secure storage."""
        return hashlib.sha256(raw_key.encode()).hexdigest()
    
    @staticmethod
    def get_prefix(raw_key):
        """Get the prefix portion of the key for display."""
        return raw_key[:12] if len(raw_key) >= 12 else raw_key
    
    def update_last_used(self):
        """Update the last_used timestamp."""
        self.last_used = timezone.now()
        self.save(update_fields=['last_used'])
    
    @classmethod
    def create_key(cls, admin, name):
        """Create a new API key, store hash, return raw key once."""
        raw_key = cls.generate_key()
        api_key = cls.objects.create(
            admin=admin,
            key_hash=cls.hash_key(raw_key),
            key_prefix=cls.get_prefix(raw_key),
            name=name
        )
        return api_key, raw_key  # raw_key shown to user ONCE
    
    @classmethod
    def validate_key(cls, raw_key):
        """Validate a raw API key by comparing its hash.
        
        Returns the APIKey object if valid and active, None otherwise.
        """
        if not raw_key or not raw_key.startswith('cp_'):
            return None
        
        key_hash = cls.hash_key(raw_key)
        try:
            api_key = cls.objects.select_related('admin').get(
                key_hash=key_hash,
                is_active=True
            )
            api_key.update_last_used()
            return api_key
        except cls.DoesNotExist:
            return None

