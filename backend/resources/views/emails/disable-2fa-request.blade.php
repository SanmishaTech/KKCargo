<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Disable Two-Factor Authentication Request</title>
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
        .warning {
            background-color: #fee2e2;
            border: 1px solid #ef4444;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
        }
        .warning-icon {
            color: #ef4444;
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
            background-color: #ef4444;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 20px 0;
        }
        .button:hover {
            background-color: #dc2626;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">{{ config('app.name') }}</div>
            <h2 style="color: #1f2937; margin: 10px 0;">Disable Two-Factor Authentication</h2>
        </div>

        <p>Hello {{ $user->name ?? $user->email }},</p>

        <p>We received a request to disable two-factor authentication on your account. If you lost access to your authenticator app, you can disable 2FA by clicking the button below.</p>

        <div style="text-align: center;">
            <a href="{{ $verificationUrl }}" class="button">Disable Two-Factor Authentication</a>
        </div>

        <p style="font-size: 12px; color: #6b7280;">Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; font-size: 12px; color: #6b7280;">{{ $verificationUrl }}</p>

        <div class="warning">
            <span class="warning-icon">⚠️</span>
            <strong>Important Security Notice:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
                <li>This link will expire in 1 hour</li>
                <li>Clicking this link will disable 2FA on your account</li>
                <li>Your account will be less secure without 2FA</li>
                <li>If you didn't request this, please ignore this email and secure your account</li>
                <li>Consider changing your password if you suspect unauthorized access</li>
            </ul>
        </div>

        <p><strong>What happens next?</strong></p>
        <ul>
            <li>After disabling 2FA, you'll be able to log in with just your email and password</li>
            <li>We strongly recommend re-enabling 2FA as soon as you regain access to your authenticator app</li>
            <li>You can set up 2FA again anytime from your account settings</li>
        </ul>

        <p><strong>Didn't request this?</strong></p>
        <p>If you didn't request to disable 2FA, please:</p>
        <ul>
            <li>Ignore this email - the link will expire automatically</li>
            <li>Change your account password immediately</li>
            <li>Contact support if you suspect unauthorized access</li>
        </ul>

        <div class="footer">
            <p>This is an automated message from {{ config('app.name') }}.</p>
            <p>This link will expire on {{ now()->addHour()->format('Y-m-d H:i:s') }} UTC</p>
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
