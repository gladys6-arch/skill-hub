import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///skillhub.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key'
    JWT_ACCESS_TOKEN_EXPIRES = False

    # M-Pesa Configuration
    MPESA_CONSUMER_KEY = os.environ.get('MPESA_CONSUMER_KEY') or 'GG2eN8PSyNqfkBXJ9wXGSN4IrJpP8uvuUKCwPuE3rOeqylrX'
    MPESA_CONSUMER_SECRET = os.environ.get('MPESA_CONSUMER_SECRET') or 'GWQAqXXvENvLGeGpS3hdB2VzVDgqP2x8jUJBD9abRFHdeLVGwUJULXYDwDsjiKqJ'
    MPESA_BASE_URL = 'https://sandbox.safaricom.co.ke'
    MPESA_SHORTCODE = os.environ.get('MPESA_SHORTCODE') or '174379'  # Sandbox shortcode
    MPESA_PASSKEY = os.environ.get('MPESA_PASSKEY') or 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919'  # Sandbox passkey