import sys
sys.path.insert(0, '/usr/lib/python3/dist-packages')
import requests
import base64
import datetime
from config import Config

def get_mpesa_access_token():
    """Get M-Pesa access token"""
    url = f"{Config.MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials"
    auth = base64.b64encode(f"{Config.MPESA_CONSUMER_KEY}:{Config.MPESA_CONSUMER_SECRET}".encode()).decode()

    headers = {
        'Authorization': f'Basic {auth}',
        'Content-Type': 'application/json'
    }

    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json()['access_token']
    else:
        raise Exception(f"Failed to get access token: {response.text}")

def generate_password():
    """Generate password for STK Push"""
    timestamp = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
    password_str = f"{Config.MPESA_SHORTCODE}{Config.MPESA_PASSKEY}{timestamp}"
    password = base64.b64encode(password_str.encode()).decode()
    return password, timestamp

def stk_push(phone_number, amount, account_reference, transaction_desc):
    """Initiate STK Push"""
    access_token = get_mpesa_access_token()
    password, timestamp = generate_password()

    url = f"{Config.MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest"

    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }

    payload = {
        "BusinessShortCode": Config.MPESA_SHORTCODE,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": amount,
        "PartyA": phone_number,
        "PartyB": Config.MPESA_SHORTCODE,
        "PhoneNumber": phone_number,
        "CallBackURL": "https://your-domain.com/api/payment/callback",  # Replace with your actual callback URL
        "AccountReference": account_reference,
        "TransactionDesc": transaction_desc
    }

    response = requests.post(url, json=payload, headers=headers)
    return response.json()