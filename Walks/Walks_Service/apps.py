from django.apps import AppConfig
from django.db.models.signals import post_migrate

class WalksServiceConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'Walks_Service'

    def ready(self):
        from .signals import initial_web_app_group
        post_migrate.connect(initial_web_app_group, sender=self)