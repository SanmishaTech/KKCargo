<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Daily Activity Report</title>
  </head>
  <body style="font-family: Arial, sans-serif; color:#111;">
    <h2 style="margin-bottom:4px;">Daily Activity Report</h2>
    <div style="color:#555; margin-bottom:16px;">Date: <strong>{{ $summary['date'] }}</strong></div>

    <div style="margin-bottom:20px;">
      <div style="font-size:14px; margin-bottom:6px;">Total Activities: <strong>{{ $summary['total'] }}</strong></div>
    </div>

    <h3 style="margin: 16px 0 8px 0;">By Action</h3>
    <table width="100%" cellpadding="6" cellspacing="0" style="border-collapse: collapse;">
      <thead>
        <tr>
          <th align="left" style="border-bottom:1px solid #ddd;">Action</th>
          <th align="right" style="border-bottom:1px solid #ddd;">Count</th>
        </tr>
      </thead>
      <tbody>
        @forelse($summary['by_action'] as $action => $count)
          <tr>
            <td style="border-bottom:1px solid #f0f0f0;">{{ $action }}</td>
            <td align="right" style="border-bottom:1px solid #f0f0f0;">{{ $count }}</td>
          </tr>
        @empty
          <tr><td colspan="2" style="color:#777;">No actions</td></tr>
        @endforelse
      </tbody>
    </table>

    <h3 style="margin: 16px 0 8px 0;">By User</h3>
    <table width="100%" cellpadding="6" cellspacing="0" style="border-collapse: collapse;">
      <thead>
        <tr>
          <th align="left" style="border-bottom:1px solid #ddd;">User</th>
          <th align="right" style="border-bottom:1px solid #ddd;">Count</th>
        </tr>
      </thead>
      <tbody>
        @forelse($summary['by_user'] as $userId => $row)
          <tr>
            <td style="border-bottom:1px solid #f0f0f0;">{{ $row['name'] }}</td>
            <td align="right" style="border-bottom:1px solid #f0f0f0;">{{ $row['count'] }}</td>
          </tr>
        @empty
          <tr><td colspan="2" style="color:#777;">No user activity</td></tr>
        @endforelse
      </tbody>
    </table>

    <h3 style="margin: 16px 0 8px 0;">Latest Activities</h3>
    <table width="100%" cellpadding="6" cellspacing="0" style="border-collapse: collapse;">
      <thead>
        <tr>
          <th align="left" style="border-bottom:1px solid #ddd;">Created at</th>
          <th align="left" style="border-bottom:1px solid #ddd;">Company Name</th>
          <th align="left" style="border-bottom:1px solid #ddd;">Company Type</th>
          <th align="left" style="border-bottom:1px solid #ddd;">Time</th>
          <th align="left" style="border-bottom:1px solid #ddd;">User</th>
          <th align="left" style="border-bottom:1px solid #ddd;">Action</th>
          <th align="left" style="border-bottom:1px solid #ddd;">Status</th>
          <th align="left" style="border-bottom:1px solid #ddd;">Remark</th>
        </tr>
      </thead>
      <tbody>
        @forelse($summary['latest'] as $log)
          <tr>
            <td style="border-bottom:1px solid #f0f0f0; white-space:nowrap;">{{ ($log->company_created_at ?? $log->created_at)?->timezone('Asia/Kolkata')->format('Y-m-d') }}</td>
            <td style="border-bottom:1px solid #f0f0f0;">{{ data_get($log->properties, 'company_name', '-') }}</td>
            <td style="border-bottom:1px solid #f0f0f0;">{{ data_get($log->properties, 'company_type', '-') }}</td>
            <td style="border-bottom:1px solid #f0f0f0; white-space:nowrap;">{{ $log->created_at->timezone('Asia/Kolkata')->format('H:i') }}</td>
            <td style="border-bottom:1px solid #f0f0f0;">{{ optional($log->user)->name ?: 'System' }}</td>
            <td style="border-bottom:1px solid #f0f0f0;">{{ $log->action }}</td>
            <td style="border-bottom:1px solid #f0f0f0;">{{ data_get($log->properties, 'status') ?? data_get($log->properties, 'new_status') ?? '-' }}</td>
            <td style="border-bottom:1px solid #f0f0f0;">{{ data_get($log->properties, 'remarks', '-') }}</td>
          </tr>
        @empty
          <tr><td colspan="8" style="color:#777;">No recent activities</td></tr>
        @endforelse
      </tbody>
    </table>

    <div style="margin-top:20px; color:#777; font-size:12px;">
      This is an automated report from KK Cargo Movers system.
    </div>
  </body>
</html>

