<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Daily Activity Report - {{ $summary['date'] }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #007bff;
            padding-bottom: 20px;
        }
        .header h1 {
            color: #007bff;
            margin: 0 0 10px 0;
            font-size: 24px;
        }
        .header p {
            margin: 5px 0;
            color: #666;
        }
        .summary-box {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .summary-item {
            display: inline-block;
            margin-right: 30px;
            margin-bottom: 10px;
        }
        .summary-label {
            font-weight: bold;
            color: #555;
        }
        .summary-value {
            font-size: 14px;
            color: #007bff;
            font-weight: bold;
        }
        .section {
            margin-bottom: 30px;
        }
        .section h2 {
            color: #007bff;
            font-size: 16px;
            margin-bottom: 15px;
            border-bottom: 1px solid #dee2e6;
            padding-bottom: 5px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        table th, table td {
            border: 1px solid #dee2e6;
            padding: 8px;
            text-align: left;
        }
        table th {
            background-color: #f8f9fa;
            font-weight: bold;
            color: #495057;
        }
        table tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        .no-data {
            color: #6c757d;
            font-style: italic;
            text-align: center;
            padding: 20px;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
            text-align: center;
            color: #6c757d;
            font-size: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Daily Activity Report</h1>
        <p><strong>Date:</strong> {{ $summary['date'] }}</p>
        <p><strong>Generated:</strong> {{ now()->format('Y-m-d H:i:s') }}</p>
        <p><strong>Company:</strong> KK Cargo Movers</p>
    </div>

    <div class="summary-box">
        <div class="summary-item">
            <span class="summary-label">Total Activities:</span>
            <span class="summary-value">{{ $summary['total'] }}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Unique Actions:</span>
            <span class="summary-value">{{ $summary['by_action']->count() }}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Active Users:</span>
            <span class="summary-value">{{ $summary['by_user']->count() }}</span>
        </div>
    </div>

    <div class="section">
        <h2>Activity Summary by Action</h2>
        @if($summary['by_action']->count() > 0)
            <table>
                <thead>
                    <tr>
                        <th>Action</th>
                        <th style="text-align: right;">Count</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($summary['by_action'] as $action => $count)
                        <tr>
                            <td>{{ $action }}</td>
                            <td style="text-align: right;">{{ $count }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @else
            <div class="no-data">No actions recorded for this date.</div>
        @endif
    </div>

    <div class="section">
        <h2>Activity Summary by User</h2>
        @if($summary['by_user']->count() > 0)
            <table>
                <thead>
                    <tr>
                        <th>User</th>
                        <th style="text-align: right;">Count</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($summary['by_user'] as $userId => $userData)
                        <tr>
                            <td>{{ $userData['name'] }}</td>
                            <td style="text-align: right;">{{ $userData['count'] }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @else
            <div class="no-data">No user activity recorded for this date.</div>
        @endif
    </div>

    <div class="section">
        <h2>Recent Activities</h2>
        @if($summary['latest']->count() > 0)
            <table>
                <thead>
                    <tr>
                        <th style="width: 15%;">Time</th>
                        <th style="width: 20%;">User</th>
                        <th style="width: 25%;">Action</th>
                        <th style="width: 25%;">Description</th>
                        <th style="width: 15%;">IP Address</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($summary['latest'] as $log)
                        <tr>
                            <td style="font-size: 10px;">{{ $log->created_at->format('H:i:s') }}</td>
                            <td>{{ optional($log->user)->name ?: 'System' }}</td>
                            <td><span style="background-color: #e3f2fd; padding: 2px 8px; border-radius: 12px; font-size: 10px; color: #1565c0;">{{ $log->action }}</span></td>
                            <td>{{ $log->description ?: '-' }}</td>
                            <td style="font-family: monospace; font-size: 10px;">{{ $log->ip_address ?: '-' }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @else
            <div class="no-data">No recent activities found for this date.</div>
        @endif
    </div>

    <div class="footer">
        <p>This is an automated report generated by KK Cargo Movers Activity Monitoring System.</p>
        <p>Report generated at {{ now()->format('Y-m-d H:i:s') }}</p>
    </div>
</body>
</html>
