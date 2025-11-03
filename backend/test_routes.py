from app import create_app

app = create_app()

print('Routes:')
for rule in app.url_map.iter_rules():
    if 'payment' in str(rule):
        print(rule)

print('\nTesting OPTIONS /api/payment/payment/pay:')
with app.test_client() as client:
    response = client.options('/api/payment/payment/pay')
    print('OPTIONS response status:', response.status_code)
    print('Response headers:', dict(response.headers))

print('\nTesting POST /api/payment/payment/pay:')
with app.test_client() as client:
    response = client.post('/api/payment/payment/pay')
    print('POST response status:', response.status_code)