<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quotation</title>
    <style>
        body {
            font-family: Arial, sans-serif; 
            font-size: 14px;
            color: #000;
        }
        .invoice-box {
            max-width: 800px;
            margin: auto;
            padding: 20px;
            border: 1px solid #000;
        }
        .invoice-box h4 {
            margin: 0;
            font-size: 18px;
        }
        .invoice-box h6 {
            margin: 0;
            font-size: 14px;
        }
        .invoice-box table {
            width: 100%;
            border-collapse: collapse;
        }
        .invoice-box table, .invoice-box th, .invoice-box td {
            border: 1px solid black;
        }
        .invoice-box th, .invoice-box td {
            padding: 8px;
            text-align: left;
        }
        .invoice-box .header, .invoice-box .footer {
            text-align: center;
            margin-bottom: 20px;
        }
        .invoice-box .header td {
            border: none;
            padding: 0;
        }
        .invoice-box .information td {
            border: none;
            padding: 0;
        }
        .invoice-box .totals td {
            border: none;
            text-align: right;
            padding: 5px 5px;
        }
        .invoice-box .totals td:last-child {
            width: 100px;
            border-bottom: 1px solid #000;
        }
        .invoice-box .round-off td {
            border: none;
            text-align: right;
            padding: 5px 5px;
        }
        .invoice-box .round-off td:last-child {
            border-bottom: 2px solid #000;
        }
        .text-end {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        .text-left {
            text-align: left;
        }
     
    </style>
</head>
<body>
    @php
    $i = 1;
    @endphp
    <h4 style="text-align: center">QUOTATION</h4>
    <div class="invoice-box">
        <table cellpadding="0" cellspacing="0">
            {{-- <tr class="header">
                <td colspan="6">
                    <h4>INVOICE</h4>
                    <h6>ORIGINAL</h6>
                </td>
            </tr> --}}

            <tr class="information">
                <td colspan="4" style="padding-left:10px; ">
                  <strong>CRM</strong><br>
                    {{-- HafyMish Technologies<br> --}}
                     <P>Maharashtra - 400605</P>
                    {{-- {{$profile->state}} - {{$profile->pincode}}<br> --}}
                    {{-- GST: {{$profile->gstin}} --}}
                </td>
                <td colspan="4" class="text-end" style=" text-align: right; padding-right:10px; padding-top:10px;">
                    Quotation No: {{@$leads->quotation_number}}<br>
                    {{-- Date: {{\Carbon\Carbon::now()->format('d-m-Y')}}<br> --}}
                  Date: {{@$leads->quotation_date}}<br>
                  version: {{@$leads->quotation_version}}<br>
                    <strong>To</strong><br>
                    {{-- {{$profile->name}}<br>
                    {{$profile->city}},thane
                    {{$profile->state}} <br>
                    Mobile{{$profile->mobile}} <br>
                    Email: {{$user->email}}        --}}
                      test user<br>
                      thane,
                      Maharashtra<br> 
                      Mobile: 9999887766 <br>
                      Email: test@gmail.com
                    <br><br><br>
                </td>
            </tr>
            
            <tr class="heading">
                <th>Sl.</th>
                <th>Product Name</th>
                <th>Rate</th>
                <th>Qty</th>
                <th>Gst%</th>
                <th>Gst₹</th>
                <th>Total</th>
            </tr>

            @foreach($leads->leadProducts as $product)
            <tr class="item">
                <td>{{$i++}}</td>
                <td>{{@$product->product->product}}</td>
                <td>{{@$product->rate}}</td>
                <td>{{@$product->quantity}}</td>
                <td>{{@$product->product->gst_rate}}%</td>
                <td>{{@$product->gst_amount}}</td>
                <td>{{@$product->amount_without_gst}}</td>
            </tr>
            @endforeach
          
        </table>

        <table cellpadding="0" cellspacing="0">
            <tr>
                <td colspan="7" style="border-top: 1px solid #000; border-bottom: none;">
                    Items: {{ --$i}}
                </td>
            </tr>
            <tr>
                <td colspan="7" style="border-bottom: 1px solid #000; border-top: none;">
                    E&amp;OE. Goods once sold cannot be taken back or exchanged
                </td>
            </tr>
            <tr class="totals">
                <td colspan="5"></td>
                <td>Total Taxable:</td>
                {{-- <td>₹1000.00</td>     --}}
                <td>₹{{$leads->total_taxable}}</td>    

            </tr>
            <tr class="totals">
                <td colspan="5"></td>
                <td>Total Tax:</td>
                {{-- <td>₹180.00</td> --}}
                <td>₹{{$leads->total_gst}}</td>    
            </tr>
            <tr class="round-off">
                <td colspan="5"></td>
                <td>Round-off:</td>
                <td>₹0.00</td>
            </tr>
            <tr class="round-off">
                <td colspan="5"></td>
                <td><strong>Total:</strong></td>
                {{-- <td><strong>₹1180.00</strong></td> --}}
                <td><strong>{{$leads->total_amount_with_gst}}</strong></td>
            </tr>
        </table>

        <div class="text-center" style="margin-top: 20px;">
            <p>GST% 18% &nbsp;&nbsp; Taxable ₹{{$leads->total_taxable}} &nbsp;&nbsp; CGST ₹3.60&nbsp;&nbsp; SGST ₹3.60</p>
            <p>Thank you. Have a great day!</p>
        </div>

        <div class="text-end" style="margin-top: 20px;">
            <p>For Gst Pro</p>
            <p>Signatory</p>
        </div>
    </div>
    {{-- ₹ &#8377;  &#x20B9; --}}
</body>
</html>
