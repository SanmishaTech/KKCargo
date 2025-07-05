<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Staff Profile - {{ $staff->staff_name ?? 'N/A' }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
            color: #333;
            font-size: 12px;
            background-color: #f9f9f9; /* Light gray background for the page */
        }
        .container {
            width: 85%; /* Slightly narrower for better readability on A4 */
            margin: 30px auto; /* More top/bottom margin */
            padding: 25px;
            border: 1px solid #ccc; /* Lighter border */
            box-shadow: 0 2px 8px rgba(0,0,0,0.1); /* Softer shadow */
            background-color: #fff; /* White background for content */
        }

        /* Specific styling for the first header block (branding) */
        .container > .header:first-of-type { 
            text-align: center;
            padding-bottom: 15px;
            border-bottom: 2px solid #007bff; /* Professional blue */
            margin-bottom: 15px; /* Reduced margin after main title */
        }
        .container > .header:first-of-type h1 { /* "Jevandeep Shaishnik Santha POI's" */
            margin: 0 0 8px 0;
            font-size: 24px; /* Prominent main title */
            color: #007bff;
            font-weight: 600;
        }
        .container > .header:first-of-type p { /* "Institute: ..." */
            margin: 0;
            font-size: 15px;
            color: #555;
            font-style: italic;
        }

        /* Styling for the date div */
        .date {
            text-align: center;
            font-size: 11px;
            color: #666;
            margin-bottom: 25px; /* Space before next header */
        }

        /* Specific styling for the second header block (staff/institute name) */
        .container > .header:nth-of-type(2) { 
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 1px dashed #ccc; /* Lighter separator */
            padding-bottom: 15px;
        }
        .container > .header:nth-of-type(2) h1 { /* Institute Name */
            margin: 0 0 5px 0;
            font-size: 20px;
            color: #333;
            font-weight: 600;
        }
        .container > .header:nth-of-type(2) p { /* Staff Name */
            margin: 0;
            font-size: 18px;
            color: #007bff;
            font-weight: bold;
        }

        .profile-section {
            margin-bottom: 30px; /* Increased spacing between sections */
            padding: 20px;
            border: 1px solid #e0e0e0;
            border-radius: 5px; /* Slightly rounded corners for sections */
            background-color: #fdfdfd; /* Very light background for sections */
        }
        .profile-section h2 {
            font-size: 18px;
            color: #0056b3; /* Darker blue, consistent with headers */
            border-bottom: 1px solid #007bff;
            padding-bottom: 10px;
            margin-top: 0;
            margin-bottom: 20px; /* More space after section title */
            font-weight: 600;
        }
        .details-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); /* Responsive columns */
            gap: 12px 22px; /* Adjusted gap */
        }
        .detail-item {
            padding: 8px 0;
            border-bottom: 1px dotted #e7e7e7; /* Subtle separator for items */
        }
        .detail-item:last-child {
            border-bottom: none;
        }
        .detail-item strong {
            display: inline-block;
            min-width: 130px; /* Adjusted width for labels */
            color: #222; /* Darker label for more contrast */
            font-weight: 600; /* Bolder labels */
            margin-right: 8px;
        }
        .detail-item span {
            color: #555;
        }

        .footer {
            text-align: center;
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #007bff; /* Match header border */
            font-size: 11px;
            color: #555;
        }
        .footer p {
            margin: 5px 0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        th, td {
            border: 1px solid #d0d0d0; /* Slightly darker table border */
            padding: 10px 12px; /* More padding */
            text-align: left;
            vertical-align: top;
        }
        th {
            background-color: #0069d9; /* Darker blue for table header */
            color: #fff; /* White text on blue header */
            font-weight: 600;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.5px;
        }
        td {
            background-color: #fff;
        }
        tr:nth-child(even) td {
            background-color: #f8f9fa; /* Zebra striping for table rows */
        }
    </style>
</head>
<body>
    <div class="container">
    
        <div class="header">
            <h1>Jevandeep Shaishnik Santha POI's</h1>
            <!-- <p>Institute: {{ $staff->institute?->institute_name ?? 'N/A' }}</p> -->
        </div>
      
        <div class="header">
            <h1>{{ $staff->institute?->institute_name ?? 'N/A' }}</h1>
            <!-- <p>Staff Profile: {{ $staff->staff_name ?? 'N/A' }}</p> -->
        </div>

      

        <div class="profile-section">
            <h2>Personal Information</h2>
            <div class="details-grid">
                <div class="detail-item">
                    <strong>Full Name:</strong>
                    <span>{{ $staff->staff_name ?? 'N/A' }}</span>
                </div>
                <div class="detail-item">
                    <strong>Employee Code:</strong>
                    <span>{{ $staff->employee_code ?? 'N/A' }}</span>
                </div>
                <div class="detail-item">
                    <strong>Email Address:</strong>
                    <span>{{ $staff->email ?? 'N/A' }}</span>
                </div>
                <div class="detail-item">
                    <strong>Mobile Number:</strong>
                    <span>{{ $staff->mobile ?? 'N/A' }}</span>
                </div>
                <div class="detail-item">
                    <strong>Date of Birth:</strong>
                    <span>{{ isset($staff->date_of_birth) && $staff->date_of_birth ? \Carbon\Carbon::parse($staff->date_of_birth)->format('F j, Y') : 'N/A' }}</span>
                </div>
                <div class="detail-item">
                    <strong>Gender:</strong>
                    <span>{{ isset($staff->gender) ? ucfirst($staff->gender) : 'N/A' }}</span>
                </div>
                <div class="detail-item">
                    <strong>Blood Group:</strong>
                    <span>{{ isset($staff->blood_group) ? ucfirst($staff->blood_group) : 'N/A' }}</span>
                </div>
                <div class="detail-item">
                    <strong>Highest Qualification:</strong>
                    <span>{{ $staff->highest_qualification ?? 'N/A' }}</span>
                </div>
                <div class="detail-item">
                    <strong>PAN Number:</strong>
                    <span>{{ $staff->pan_number ?? 'N/A' }}</span>
                </div>
                <div class="detail-item">
                    <strong>Aadhaar Number:</strong>
                    <span>{{ $staff->aadhaar_number ?? 'N/A' }}</span>
                </div>
                <div class="detail-item">
                    <strong>Experience:</strong>
                    <span>{{ $staff->experience ?? 'N/A' }} {{ $staff->experience ? 'years' : '' }}</span>
                </div>
                 <div class="detail-item" style="grid-column: 1 / -1;"> <!-- Full width for address -->
                    <strong>Address:</strong>
                    <span>{{ $staff->address ?? ($staff->permanent_address ?? 'N/A') }}</span>
                </div>
                <div class="detail-item">
                    <strong>Subject Type:</strong>
                    <span>{{ $staff->subject_type ?? 'N/A' }}</span>
                </div>
                <div class="detail-item">
                    <strong>Salary:</strong>
                    <span>{{ $staff->salary ?? 'N/A' }}</span>
                </div>
                <div class="detail-item">
                    <strong>Mode of Payment:</strong>
                    <span>{{ $staff->mode_of_payment ?? 'N/A' }}</span>
                </div>
               
             </div>
        </div>

        @if(isset($staff->education) && $staff->education->count() > 0)
        <div class="profile-section">
            <h2>Educational Qualifications</h2>
            <table>
                <thead>
                    <tr>
                        <th>Qualification</th>
                        <th>College / Institution</th>
                        <th>Board / University</th>
                        <th>Year of Passing</th>
                        <th>Percentage / CGPA</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($staff->education as $edu)
                    <tr>
                        <td>{{ $edu->qualification ?? 'N/A' }}</td>
                        <td>{{ $edu->college_name ?? 'N/A' }}</td>
                        <td>{{ $edu->board_university ?? 'N/A' }}</td>
                        <td>{{ $edu->passing_year ?? 'N/A' }}</td>
                        <td>{{ $edu->percentage ?? 'N/A' }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        @endif

        @if(isset($staff->papers) && $staff->papers->count() > 0)
        <div class="profile-section">
            <h2>Research / Conference Papers</h2>
            <table>
                <thead>
                    <tr>
                        <th>Journal Title</th>
                        <th>Research Topic</th>
                        <th>Publication ID</th>
                        <th>Volume</th>
                        <th>Issue</th>
                        <th>Year</th>
                        <th>Peer Reviewed</th>
                        <th>Co-author</th>
                     </tr>
                </thead>
                <tbody>
                    @foreach($staff->papers as $paper)
                    <tr>
                        <td>{{ $paper->journal_title ?? 'N/A' }}</td>
                        <td>{{ $paper->research_topic ?? 'N/A' }}</td>
                        <td>{{ $paper->publication_identifier ?? 'N/A' }}</td>
                        <td>{{ $paper->volume ?? 'N/A' }}</td>
                        <td>{{ $paper->issue ?? 'N/A' }}</td>
                        <td>{{ $paper->year_of_publication ?? 'N/A' }}</td>
                        <td>{{ isset($paper->peer_reviewed) ? ($paper->peer_reviewed ? 'Yes' : 'No') : 'N/A' }}</td>
                        <td>{{ $paper->coauthor ?? 'N/A' }}</td>
                       
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        @endif

        @if(!empty($staff->medical_history) || !empty($staff->medical_image_path))
        <div class="profile-section">
            <h2>Medical Information</h2>

            @if(!empty($staff->medical_history))
                <p><strong>History:</strong> {{ $staff->medical_history }}</p>
            @endif

            @if(!empty($staff->medical_image_path))
                <div style="margin-top: 10px; text-align:center;">
                    <img src="{{ public_path('storage/staff_medical_images/' . $staff->medical_image_path) }}" alt="Medical Image" style="max-width: 250px; height: auto; border:1px solid #ddd; padding:4px;" />
                </div>
            @endif
        </div>
        @endif

        <div class="footer">
            <p>&copy; {{ \Carbon\Carbon::now()->format('Y') }} {{ $staff->institute?->institute_name ?? 'Your Institution Name' }}. All rights reserved.</p>
        </div>
        <div class="date">
            <p>Generated on: {{ $date }}</p>
        </div>
    </div>
</body>
</html>