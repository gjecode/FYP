#!/bin/sh

echo "###   Applying Database Migrations for Walks Service   ###"
python manage.py makemigrations
python manage.py migrate

echo "###   Starting Walks Service Server   ###"
python manage.py runserver 0.0.0.0:8004

