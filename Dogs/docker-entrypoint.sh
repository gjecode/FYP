#!/bin/sh

echo "###   Applying Database Migrations for Dogs Service   ###"
python manage.py makemigrations
python manage.py migrate

echo "###   Starting Dogs Service Server   ###"
python manage.py runserver 0.0.0.0:8001 --noreload

