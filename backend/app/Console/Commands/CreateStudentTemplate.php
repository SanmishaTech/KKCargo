<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class CreateStudentTemplate extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'students:create-template';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a template Excel file for student imports';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $directory = base_path('excel');
        if (!is_dir($directory)) {
            mkdir($directory, 0755, true);
        }
        
        $filePath = $directory . '/students_import.xlsx';
        
        // Create spreadsheet object
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        
        // Set headers
        $sheet->setCellValue('A1', 'Student Name');
        $sheet->setCellValue('B1', 'PRN');
        $sheet->setCellValue('C1', 'Subject Name');
        $sheet->setCellValue('D1', 'Division Name');
        
        // Add some sample data
        $sheet->setCellValue('A2', 'John Doe');
        $sheet->setCellValue('B2', 'PRN12345');
        $sheet->setCellValue('C2', 'Physics');
        $sheet->setCellValue('D2', 'Division A');
        
        // Save the file
        $writer = new Xlsx($spreadsheet);
        $writer->save($filePath);
        
        $this->info('Student import template created successfully at: ' . $filePath);
        
        return Command::SUCCESS;
    }
}
