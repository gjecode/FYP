def initial_web_app_group(sender, **kwargs):
    from django.conf import settings
    from .models import Dog, DogCategory
    import datetime
    
    ### START OF SEEDING DOGS SERVICE DATA ###
    
    if not DogCategory.objects.exists():
        name = [
            'Old is Gold', 
            'Bitey Dogs', 
            'Shy and Fearful Dogs', 
            'High-Energy Dogs', 
            'Low-Energy Dogs', 
            'Dogs with Medical Issues'
        ]
        desc = [
            'Age is just a number!', 
            "Caution: I'm suspicious and defensive. BUT I hope the right home can help me overcome that so I can show humans the love I have for them!",
            'Go slow with me and give me time and space to open up at my own pace!',
            "With me around, you'll always have enough of fun and entertainment!",
            'I prefer to sleep in my free time, but I promise I still love you!',
            'All the more I need a home for the rest of my days!'
        ]
        categories = []
        for i in range(len(name)):
            category = DogCategory.objects.create(
                name=name[i], 
                desc=desc[i]
            )
            categories.append(category)
    
    if not Dog.objects.exists():
        print('### Seeding DB for dogs service ###')
        name = [
            'Adam', 
            'Bob', 
            'Calvin', 
            'David', 
            'Elijah', 
            'Fabian'
        ]
        desc = [
            'Maroon 5', 
            'Ross', 
            'Klein', 
            'Beckham', 
            'Sheesh', 
            'Koh'
        ]
        today = datetime.date.today()
        v_date = [
            today, 
            today + datetime.timedelta(days=1), 
            today + datetime.timedelta(days=2), 
            today + datetime.timedelta(days=3), 
            today + datetime.timedelta(days=4),
            today + datetime.timedelta(days=5)
        ]
        dob = [
            datetime.datetime(year=today.year - 1, month=1, day=1),
            datetime.datetime(year=today.year - 2, month=1, day=1),
            datetime.datetime(year=today.year - 3, month=1, day=1),
            datetime.datetime(year=today.year - 4, month=1, day=1),
            datetime.datetime(year=today.year - 5, month=1, day=1),
            datetime.datetime(year=today.year - 6, month=1, day=1),
        ]
        for i in range(len(name)):
            gender = 'Female'
            if i % 2 == 0:
                gender = 'Male'
            dog = Dog.objects.create(
                name=name[i], 
                desc=desc[i], 
                vaccinationDate=v_date[i], 
                DOB=dob[i],
                gender=gender
            )
            if i == 0:
                dog.categories.add(categories[i])
                dog.categories.add(categories[i+1])
            else:
                dog.categories.add(categories[i])
    
    ### END OF SEEDING DOGS SERVICE DATA ###