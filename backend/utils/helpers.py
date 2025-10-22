
from datetime import datetime

def format_datetime(dt=None):
    if dt is None:
        dt = datetime.utcnow()
    return dt.strftime("%Y-%m-%d %H:%M:%S")

def success_response(message, data=None):
    return {"success": True, "message": message, "data": data}


