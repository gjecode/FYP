from django.apps import AppConfig
from django.db.models.signals import post_migrate

class DogsServiceConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'Dogs_Service'
    
    def ready(self):
        from .signals import initial_web_app_group
        post_migrate.connect(initial_web_app_group, sender=self)

        from Dogs_Service import cron
        cron.start()