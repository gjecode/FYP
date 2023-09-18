def initial_web_app_group(sender, **kwargs):
    from django.conf import settings
    from django.contrib.auth import get_user_model
    
    ### START OF SEEDING ACCOUNT SERVICE DATA ###
    
    User = get_user_model()

    if len(User.objects.filter(username='admin@gmail.com')) == 0:
        print("### Creating admin user for account service ###")
        user = User.objects.create_superuser('admin@gmail.com', '', 'admin')
        user.role = 'Admin'
        user.save()
    
    ### END OF SEEDING ACCOUNT SERVICE DATA ###