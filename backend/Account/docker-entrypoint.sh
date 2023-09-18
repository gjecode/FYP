#!/bin/sh

echo "###   Applying database migrations for Account Service  ###"
python manage.py makemigrations
python manage.py migrate

echo "###   Starting Account Service server   ###"
python manage.py runserver 0.0.0.0:8000

