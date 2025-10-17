<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Backup Authentication Code</title>
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
        .otp-container {
            background-color: #f0f9ff;
            border: 2px solid #3b82f6;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 30px 0;
        }
        .otp-code {
            font-size: 32px;
            font-weight: bold;
            color: #1e40af;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
        }
        .warning {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
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
        .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #3b82f6;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">{{ config('app.name') }}</div>
            <h2 style="color: #1f2937; margin: 10px 0;">Backup Authentication Code</h2>
        </div>

        <p>Hello {{ $user->name ?? $user->email }},</p>

        <p>You requested a backup authentication code because you don't have access to your authenticator app. Please use the following code to complete your login:</p>

        <div class="otp-container">
            <div style="font-size: 14px; color: #6b7280; margin-bottom: 10px;">Your authentication code is:</div>
            <div class="otp-code">{{ $otp }}</div>
            <div style="font-size: 14px; color: #6b7280; margin-top: 10px;">Valid for: {{ $validFor }}</div>
        </div>

        <div class="warning">
            <span class="warning-icon">⚠️</span>
            <strong>Important Security Notice:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
                <li>This code expires in 30 seconds</li>
                <li>Never share this code with anyone</li>
                <li>Our team will never ask for this code</li>
                <li>If you didn't request this code, please ignore this email and secure your account</li>
            </ul>
        </div>

        <p><strong>Why am I receiving this?</strong></p>
        <p>This backup method is provided for situations where you cannot access your authenticator app. For security reasons, we recommend:</p>
        <ul>
            <li>Re-enabling your authenticator app as soon as possible</li>
            <li>Keeping your recovery codes in a safe place</li>
            <li>Updating your 2FA settings if you've changed devices</li>
        </ul>

        <div class="footer">
            <p>This is an automated message from {{ config('app.name') }}.</p>
            <p>If you didn't request this code, please secure your account immediately.</p>
            <p style="margin-top: 10px;">
                <small>
                    Request Time: {{ now()->format('Y-m-d H:i:s') }} UTC<br>
                    Request IP: {{ request()->ip() }}
                </small>
            </p>
        </div>
    </div>
</body>
</html>