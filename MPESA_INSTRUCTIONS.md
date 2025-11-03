# M-Pesa Integration Instructions

## Current Status
✅ M-Pesa STK Push configured with sandbox credentials
✅ Callback URL fixed with public webhook
✅ Auto-enrollment for test number implemented

## How to Test M-Pesa Payment

### 1. Use Test Phone Number
- **Phone Number**: `254708374149`
- This is the official Safaricom sandbox test number

### 2. Test Flow
1. Go to course page and click "Pay & Enroll"
2. Enter phone number: `254708374149`
3. You should receive M-Pesa prompt on your phone
4. Enter PIN: `1234` (sandbox PIN)
5. Payment will be processed
6. Auto-enrollment happens after 10 seconds for test number

### 3. Check Logs
Monitor backend console for:
- STK Push payload
- M-Pesa API response
- Auto-enrollment confirmation

### 4. Verify Enrollment
- Check `/student/progress` page
- Course should appear in enrolled courses

## Production Setup
For production, replace callback URL in `utils/mpesa_utils.py`:
```python
"CallBackURL": "https://yourdomain.com/api/payment/callback"
```

## Troubleshooting
- If no prompt: Check phone number format (254XXXXXXXXX)
- If payment fails: Check M-Pesa credentials in config.py
- If no enrollment: Check backend logs for auto-enrollment