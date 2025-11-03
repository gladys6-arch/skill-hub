# M-Pesa Payment Setup

## Issue
M-Pesa callbacks cannot reach localhost URLs. For development, you need a publicly accessible URL.

## Solution: Use ngrok

### 1. Install ngrok
```bash
# Download from https://ngrok.com/download
# Or install via package manager
brew install ngrok  # macOS
```

### 2. Expose your local server
```bash
# Start your Flask app on port 5000
python app.py

# In another terminal, expose port 5000
ngrok http 5000
```

### 3. Update callback URL
Copy the ngrok URL (e.g., `https://abc123.ngrok.io`) and update in:
- `backend/utils/mpesa_utils.py` line 45
- Change: `"CallBackURL": "http://127.0.0.1:5000/api/payment/callback"`
- To: `"CallBackURL": "https://abc123.ngrok.io/api/payment/callback"`

### 4. Test payment flow
1. Student initiates payment
2. M-Pesa sends callback to ngrok URL
3. Automatic enrollment happens
4. Student can access `/student/progress`

## Fallback Options
If callback fails, students can use:
- **Manual enrollment button** on course cards
- **Enhanced payment verification** that polls and ensures enrollment