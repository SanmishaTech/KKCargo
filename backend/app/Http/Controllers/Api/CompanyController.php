<?php

namespace App\Http\Controllers\Api;

use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\CompanyResource;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use App\Http\Controllers\Api\BaseController;

class CompanyController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        // Build the base query.
        $query = Company::query();

        // If there's a search term, apply additional filtering.
        if ($searchTerm = $request->query('search')) {
            $query->where('company_name', 'like', '%' . $searchTerm . '%');
        }

        // Company type filtering
        if ($companyType = $request->query('company_type')) {
            $query->where('type_of_company', $companyType);
        }

        // Date filtering by month and year
        if ($month = $request->query('month')) {
            $query->whereMonth('created_at', $month);
        }
        
        if ($year = $request->query('year')) {
            $query->whereYear('created_at', $year);
        }
        
        // If both month and year are provided, filter by both
        if ($request->query('date_filter')) {
            $dateFilter = $request->query('date_filter'); // Format: YYYY-MM
            if (preg_match('/^(\d{4})-(\d{2})$/', $dateFilter, $matches)) {
                $year = $matches[1];
                $month = $matches[2];
                $query->whereYear('created_at', $year)
                      ->whereMonth('created_at', $month);
            }
        }

        // Order by created_at desc to show latest first
        $query->orderBy('created_at', 'desc');

        // Paginate the results.
        $company = $query->paginate(7);
    
        // Return the paginated response with staff resources.
        return $this->sendResponse(
            [
                "Company" => CompanyResource::collection($company),
                'Pagination' => [
                    'current_page' => $company->currentPage(),
                    'last_page'    => $company->lastPage(),
                    'per_page'     => $company->perPage(),
                    'total'        => $company->total(),
                ]
            ],
            "Company retrieved successfully"
        );
    }


    public function store(Request $request): JsonResponse
    {
        // Create a new staff record and assign the institute_id from the logged-in admin
        $company = new Company();
         $company->company_name = $request->input('company_name');
        $company->street_address = $request->input('street_address');
        $company->area = $request->input('area');
        $company->city = $request->input('city');
        $company->state = $request->input('state');
        $company->pincode = $request->input('pincode');
        $company->country = $request->input('country');
        // Handle dynamic company type: if "Other" chosen, save the custom value
        $selectedType = $request->input('type_of_company');
        $otherType    = $request->input('other_type_of_company');
        if ($selectedType === 'Other' && !empty($otherType)) {
            $company->type_of_company        = $otherType;
            $company->other_type_of_company  = $otherType; // keep reference
        } else {
            $company->type_of_company        = $selectedType;
            $company->other_type_of_company  = null;
        }
        $company->contact_person = $request->input('contact_person');
        $company->contact_person_designation = $request->input('contact_person_designation');
        $company->contact_email = $request->input('contact_email');
        $company->contact_mobile = $request->input('contact_mobile');
        $company->alternate_contact_person = $request->input('alternate_contact_person');
        $company->alternate_contact_person_designation = $request->input('alternate_contact_person_designation');
        $company->alternate_contact_email = $request->input('alternate_contact_email');
        $company->alternate_contact_mobile = $request->input('alternate_contact_mobile');
        
        // Set default status to 'waiting' when a company is created
        $company->status = 'waiting';

         $company->save();
        
        return $this->sendResponse([new CompanyResource($company)], "Company stored successfully");
    }


    public function show(string $id): JsonResponse
    {
        $company = Company::find($id);

        if(!$company){
            return $this->sendError("Company not found", ['error'=>'Company not found']);
        }

  
        return $this->sendResponse([ "Company" => new CompanyResource($company) ], "Company retrived successfully");
    }


    public function update(Request $request, string $id): JsonResponse
    {
 
        $company = Company::find($id);

        if(!$company){
            return $this->sendError("Company not found", ['error'=>'Company not found']);
        }
       
                       
         $company->company_name = $request->input('company_name');
        $company->street_address = $request->input('street_address');
        $company->area = $request->input('area');
        $company->city = $request->input('city');
        $company->state = $request->input('state');
        $company->pincode = $request->input('pincode');
        $company->country = $request->input('country');
        // Handle dynamic company type: if "Other" chosen, save the custom value
        $selectedType = $request->input('type_of_company');
        $otherType    = $request->input('other_type_of_company');
        if ($selectedType === 'Other' && !empty($otherType)) {
            $company->type_of_company        = $otherType;
            $company->other_type_of_company  = $otherType; // keep reference
        } else {
            $company->type_of_company        = $selectedType;
            $company->other_type_of_company  = null;
        }
        $company->contact_person = $request->input('contact_person');
        $company->contact_person_designation = $request->input('contact_person_designation');
        $company->contact_email = $request->input('contact_email');
        $company->contact_mobile = $request->input('contact_mobile');
        $company->alternate_contact_person = $request->input('alternate_contact_person');
        $company->alternate_contact_person_designation = $request->input('alternate_contact_person_designation');
        $company->alternate_contact_email = $request->input('alternate_contact_email');
        $company->alternate_contact_mobile = $request->input('alternate_contact_mobile');


           
        $company->save();
       
        return $this->sendResponse([ new CompanyResource($company)], "Company updated successfully");

    }

    /**
     * Get distinct company types for dropdowns.
     */
    public function types(): JsonResponse
    {
        try {
            $types = Company::query()
                ->distinct()
                ->whereNotNull('type_of_company')
                ->where('type_of_company', '!=', '')
                ->pluck('type_of_company')
                ->values(); // Reset array keys
            
            return $this->sendResponse($types, 'Company types retrieved successfully');
        } catch (\Exception $e) {
            return $this->sendError('Error retrieving company types', ['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Delete a company type from dropdown options.
     */
    public function deleteType(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|string',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), 422);
        }

        $type = $request->input('type');
        
        // Don't allow deletion of "Other" type
        if ($type === 'Other') {
            return $this->sendError('Cannot delete', ['error' => 'Cannot delete "Other" type'], 400);
        }

        try {
            // Set type_of_company to null for all companies with this type
            $affectedCount = Company::where('type_of_company', $type)
                ->update(['type_of_company' => null]);
            
            return $this->sendResponse(
                ['affected_companies' => $affectedCount], 
                "Company type '{$type}' removed from dropdown. {$affectedCount} companies had their type set to null."
            );
        } catch (\Exception $e) {
            return $this->sendError('Delete Error', ['error' => $e->getMessage()], 500);
        }
    }

    public function destroy(string $id): JsonResponse
    {
        $company = Company::find($id);
        if(!$company){
            return $this->sendError("Company not found", ['error'=> 'Company not found']);
        }
         $company->delete();
         return $this->sendResponse([], "Company deleted successfully");
    }

    public function allCompany(): JsonResponse
    {
      
        // Retrieve all companies.
        $company = Company::all();
    
        return $this->sendResponse(
            ["Company" => CompanyResource::collection($company)],
            "Company retrieved successfully"
        );
    }

    public function sendBrochure(Request $request): JsonResponse
    {
        // Validate request data
        $validator = Validator::make($request->all(), [
            'companyId' => 'required|exists:companies,id',
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), 422);
        }

        try {
            // Retrieve the targeted company
            $company = Company::find($request->companyId);

            // Send a simple text email. Replace with Mailable if you need rich content.
            Mail::raw('Please find the brochure attached.', function ($message) use ($request) {
                $message->to($request->email)
                        ->subject('Company Brochure')
                        ->attach(base_path('pdf/blank.pdf'), [
                            'as' => 'CompanyBrochure.pdf',
                            'mime' => 'application/pdf',
                        ]);
            });

            // Update status to 'interested' after sending the brochure successfully
            if ($company) {
                $company->status = 'interested';
                $company->save();
            }

            return $this->sendResponse([], 'Brochure sent successfully');
        } catch (\Exception $e) {
            return $this->sendError('Mail Error', ['error' => $e->getMessage()], 500);
        }
    }

    public function importCompany(Request $request): JsonResponse
    {
        // Validate the uploaded file
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:xlsx,xls,csv',
        ]);
    
        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), 422);
        }
    
        try {
            $file = $request->file('file');
            $spreadsheet = IOFactory::load($file->getPathname());
            $worksheet = $spreadsheet->getActiveSheet();
            $rows = $worksheet->toArray();
            
            if (empty($rows) || count($rows) < 2) {
                return $this->sendError('Import Error', ['error' => 'The uploaded file is empty or does not contain any data rows.'], 422);
            }
            
            // Get header row and map column indices
            $headers = array_map('trim', $rows[0]);
            $columnMap = [
                'company_name'    => array_search('Company Name', $headers),
                'type_of_company' => array_search('Type Of Company', $headers),
                'street_address'  => array_search('Street Address', $headers),
                'city'           => array_search('City', $headers),
                'contact_email'         => array_search('Email', $headers),
                'contact_person'  => array_search('Contact Person', $headers),
                'contact_mobile'  => array_search('Contact Mobile', $headers),
            ];
    
            // Validate that all required columns are present
            foreach ($columnMap as $key => $index) {
                if ($index === false) {
                    // Create a user-friendly column name
                    $friendlyKey = ucwords(str_replace('_', ' ', $key));
                    return $this->sendError('Import Error', ['error' => "Required column '{$friendlyKey}' not found in the uploaded file."], 422);
                }
            }
    
            // Skip header row
            $dataRows = array_slice($rows, 1);
            
            $importCount = 0;
            $errors = [];
            $errorRows = [];
    
            foreach ($dataRows as $index => $row) {
                $rowNum = $index + 2; // +2 because of 1-indexing and header row
    
                // Skip empty rows (a row is considered empty if all its cells are empty)
                if (empty(array_filter($row))) {
                    continue;
                }
                
                try {
                    // Create new company
                    $company = new Company();
                    $company->company_name = trim($row[$columnMap['company_name']]);
                    $company->type_of_company = trim($row[$columnMap['type_of_company']]);
                    $company->street_address = trim($row[$columnMap['street_address']]);
                    $company->city = trim($row[$columnMap['city']]);
                    $company->contact_email = trim($row[$columnMap['contact_email']]);
                    $company->contact_person = trim($row[$columnMap['contact_person']]);
                    $company->contact_mobile = trim($row[$columnMap['contact_mobile']]);
                    // Set default status to 'waiting' during import
                    $company->status = 'waiting';
                    
                    $company->save();
                    
                    $importCount++;
                } catch (\Exception $e) {
                    $errors[] = 'Row ' . $rowNum . ': ' . $e->getMessage();
                    $errorRows[] = $rowNum;
                }
            }
            
            $message = "Successfully imported {$importCount} companies";
            $response = ['count' => $importCount];
            
            if (!empty($errors)) {
                $response['errors'] = $errors;
                $response['errorRows'] = $errorRows;
                if ($importCount == 0) {
                    $message = "No companies were imported. Please check the errors.";
                } else {
                    $message = "Imported {$importCount} companies with some errors.";
                }
            }
            
            return $this->sendResponse($response, $message);
            
        } catch (\Exception $e) {
            return $this->sendError('Import Error', ['error' => $e->getMessage()], 500);
        }
    }

     /**
     * Download the student import template Excel file.
     */
    public function downloadTemplate()
    {
        // Path to the template located in backend/excel/students.xlsx
        $filePath = base_path('excel/company.xlsx');

        if (!file_exists($filePath)) {
            return $this->sendError('File not found', ['error' => 'Template not found'], 404);
        }

        // Return the file as a download response
        return response()->download(
            $filePath,
            'company_template.xlsx',
            [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ]
        );
    }

}
