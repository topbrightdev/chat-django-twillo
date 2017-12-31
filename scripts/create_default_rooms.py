from chat.models import Room

DEFAULT_ROOMS = [
    {
        'name': 'General',
        'slug': 'general',
        'description': "Stop by and say hi! Everyone's welcome."
    }, {
        'name': 'Random',
        'slug': 'random',
        'description': "Random chit chat. Best place to just chill"
    }, {
        'name': 'Twilio Chat',
        'slug': 'twilio-chat',
        'description': 'Chat about... Twilio Programmable Chat'
    }
]

def run():
    for room in DEFAULT_ROOMS:
        Room.objects.get_or_create(
            name=room['name'],
            slug=room['slug'],
            description=room['description' ]
        )
    print('Rooms created')
