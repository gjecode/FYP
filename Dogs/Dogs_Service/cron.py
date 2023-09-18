from django.utils import timezone
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
import logging

from .models import Dog

def renewSponsors():
    currentDate = timezone.now().date()
    expiredSponsorsDogs = Dog.objects.filter(sponsorExpirationDate__lt=currentDate)
    for dog in expiredSponsorsDogs:
        dog.is_sponsored = False
        dog.sponsorExpirationDate = None
        dog.save()

def start():
    print('###   Running APScheduler for Dogs Service   ###')
    # logging.basicConfig()
    # logging.getLogger('apscheduler').setLevel(logging.DEBUG)
    scheduler = BackgroundScheduler()
    scheduler.add_job(
        renewSponsors, 
        trigger=CronTrigger.from_crontab('* * * * *'), 
        max_instances=1
    )
    scheduler.start()