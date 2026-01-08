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
            table-layout: fixed;
        }
        table th, table td {
            border: 1px solid #dee2e6;
            padding: 8px;
            text-align: left;
            vertical-align: top;
            word-break: break-word;
            overflow-wrap: break-word;
        }
        table th {
            background-color: #f8f9fa;
            font-weight: bold;
            color: #495057;
            font-size: 10px;
        }
        .srno {
            text-align: center;
            vertical-align: middle;
            white-space: nowrap;
        }
        .remark-row td {
            background-color: #ffffff;
            font-size: 10px;
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
        <p><strong>Generated:</strong> {{ now()->timezone('Asia/Kolkata')->format('Y-m-d h:i A') }}</p>
        <p><strong>Company:</strong> KK Cargo Movers</p>
    </div>

    <div class="section">
        <h2>Recent Activities</h2>
        @if($summary['latest']->count() > 0)
            <table>
                <thead>
                    <tr>
                        <th class="srno" style="width: 6%;">Sr No</th>
                        <th style="width: 10%;">Created at</th>
                        <th style="width: 20%;">Company Name</th>
                        <th style="width: 12%;">Company Type</th>
                        <th style="width: 10%;">Time</th>
                        <th style="width: 14%;">User</th>
                        <th style="width: 16%;">Action</th>
                        <th style="width: 14%;">Status</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($summary['latest'] as $i => $log)
                        <tr>
                            <td class="srno" rowspan="2" style="font-size: 10px;">{{ $i + 1 }}</td>
                            <td style="font-size: 10px; white-space: nowrap;">{{ ($log->company_created_at ?? $log->created_at)?->timezone('Asia/Kolkata')->format('Y-m-d') }}</td>
                            <td style="font-size: 10px;">{{ data_get($log->properties, 'company_name', '-') }}</td>
                            <td style="font-size: 10px;">{{ data_get($log->properties, 'company_type') ?? data_get($log->properties, 'type_of_company') ?? '-' }}</td>
                            <td style="font-size: 10px; white-space: nowrap;">{{ $log->created_at->timezone('Asia/Kolkata')->format('h:i a') }}</td>
                            <td style="font-size: 10px;">{{ optional($log->user)->name ?: 'System' }}</td>
                            <td><span style="background-color: #e3f2fd; padding: 2px 8px; border-radius: 12px; font-size: 10px; color: #1565c0;">{{ $log->action }}</span></td>
                            <td style="font-size: 10px;">{{ data_get($log->properties, 'status') ?? data_get($log->properties, 'new_status') ?? '-' }}</td>
                        </tr>
                        <tr class="remark-row">
                            <td colspan="7" style="padding-top: 6px; padding-bottom: 6px;">
                                <strong>Remark:</strong> {{ data_get($log->properties, 'remarks', '-') }}
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @else
            <div class="no-data">No recent activities found for this date.</div>
        @endif
    </div>
</body>
</html>
