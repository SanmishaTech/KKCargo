<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Disable Two-Factor Authentication Code</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e0e0e0;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
        }
        .otp-box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-size: 32px;
            font-weight: bold;
            text-align: center;
            padding: 20px;
            border-radius: 8px;
            margin: 30px 0;
            letter-spacing: 8px;
        }
        .warning {
            background-color: #fef3c7;
            border: 1px solid #fbbf24;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
        }
        .warning-icon {
            color: #f59e0b;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            font-size: 12px;
            color: #666;
        }
        .info-box {
            background-color: #f0f9ff;
            border: 1px solid #0ea5e9;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">{{ config('app.name') }}</div>
            <h2 style="color: #1f2937; margin: 10px 0;">Your Verification Code</h2>
        </div>

        <p>Hello {{ $user->name ?? $user->email }},</p>

        <p>You requested to disable two-factor authentication on your account. Use the code below to complete this action:</p>

        <div class="otp-box">
            {{ $otp }}
        </div>

        <div class="info-box">
            <strong>ℹ️ Important:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
                <li>This code is valid for <strong>{{ $validFor }}</strong></li>
                <li>Enter this code in the 2FA disable form</li>
                <li>Do not share this code with anyone</li>
            </ul>
        </div>

        <p><strong>How to use this code:</strong></p>
        <ol>
            <li>Go back to your account settings</li>
            <li>Navigate to the Two-Factor Authentication section</li>
            <li>Enter this 6-digit code in the "Enter your current 6-digit code" field</li>
            <li>Click "Disable 2FA" to complete the process</li>
        </ol>

        <div class="warning">
            <span class="warning-icon">⚠️</span>
            <strong>Security Notice:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Disabling 2FA will make your account less secure</li>
                <li>We recommend re-enabling 2FA as soon as possible</li>
                <li>If you didn't request this code, please secure your account immediately</li>
            </ul>
        </div>

        <p><strong>Didn't request this code?</strong></p>
        <p>If you didn't request to disable 2FA, please:</p>
        <ul>
            <li>Ignore this email - the code will expire automatically</li>
            <li>Change your account password immediately</li>
            <li>Contact support if you suspect unauthorized access</li>
        </ul>

        <div class="footer">
            <p>This is an automated message from {{ config('app.name') }}.</p>
            <p>Code generated at: {{ now()->format('Y-m-d H:i:s') }} UTC</p>
            <p style="margin-top: 10px;">
                <small>
                    Request IP: {{ request()->ip() }}<br>
                    This code expires in {{ $validFor }}
                </small>
            </p>
        </div>
    </div>
</body>
</html>