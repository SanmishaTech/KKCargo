<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Daily Activity Report</title>
  </head>
  <body style="font-family: Arial, sans-serif; color:#111;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #007bff; margin-bottom: 20px;">Daily Activity Report</h2>
      
      <p>Dear Admin,</p>
      
      <p>Please find attached the daily activity report for <strong>{{ $summary['date'] }}</strong>.</p>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #007bff;">Report Summary</h3>
        <ul style="margin: 0; padding-left: 20px;">
          <li><strong>Total Activities:</strong> {{ $summary['total'] }}</li>
          <li><strong>Unique Actions:</strong> {{ $summary['by_action']->count() }}</li>
          <li><strong>Active Users:</strong> {{ $summary['by_user']->count() }}</li>
        </ul>
      </div>
      
      <p>The detailed report is attached as a PDF file for your review.</p>
      
      <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
      
      <div style="color: #6c757d; font-size: 12px;">
        <p><strong>KK Cargo Movers</strong><br/>
        Activity Monitoring System</p>
        <p>This is an automated email. Please do not reply to this message.</p>
        <p>Generated on: {{ now()->format('Y-m-d H:i:s') }}</p>
      </div>
    </div>
  </body>
</html>
