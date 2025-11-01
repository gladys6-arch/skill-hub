import base64
import requests
from datetime import datetime
from flask import current_app

def get_access_token():
    consumer_key = current_app.config['MPESA_CONSUMER_KEY']
    consumer_secret = current_app.config['MPESA_CONSUMER_SECRET']
    url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    r = requests.get(url, auth=(consumer_key, consumer_secret))
    r.raise_for_status()
    return r.json()['access_token']

def initiate_stk_push(phone_number: str, amount: float, account_reference: str, description: str):
    access_token = get_access_token()
    shortcode = current_app.config['MPESA_SHORTCODE']
    passkey = current_app.config['MPESA_PASSKEY']
    callback_url = current_app.config['MPESA_CALLBACK_URL']

    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    password = base64.b64encode((shortcode + passkey + timestamp).encode()).decode()

    payload = {
        "BusinessShortCode": shortcode,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": int(amount),
        "PartyA": phone_number,
        "PartyB": shortcode,
        "PhoneNumber": phone_number,
        "CallBackURL": callback_url,
        "AccountReference": account_reference,
        "TransactionDesc": description
    }

    headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}
    resp = requests.post("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
                         json=payload, headers=headers)
    return resp.json()

def send_b2c_payment(phone_number: str, amount: float, remarks="Payout from SkillHub"):
    """
    Admin->Teacher B2C (simplified). In sandbox you need credentials and an endpoint for B2C.
    Implement depending on your Daraja account (this is a placeholder).
    """
    # Implementation may vary depending on Daraja B2C access.
    raise NotImplementedError("Implement B2C with your Daraja credentials / endpoints.")
