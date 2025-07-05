<?php

namespace Database\Factories;

use App\Models\Supplier;
use Database\Factories\SupplierFactory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Supplier>
 */
class SupplierFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = Supplier::class;
    public function definition(): array
    {
        return [
            'supplier' => $this->faker->name(20, true),  
            'street_address' => $this->faker->name(50, true),  
            'area' => $this->faker->name(50, true),  
            'city' => $this->faker->name(50, true),  
            'state' => $this->faker->name(50, true),  
            'pincode' => $this->faker->postcode(),
            'country' => $this->faker->name(50, true),  
            'gstin' => $this->faker->regexify('[A-Z]{2}[0-9]{1}[A-Z]{1}[0-9]{4}[A-Z]{1}[0-9]{1}[A-Z]{1}[0-9]{1}'),   
            'contact_no' => $this->faker->unique()->safeEmail(),
            'department' => $this->faker->name(50, true),  
            'designation' => $this->faker->name(50, true),  
            'mobile_1' => $this->faker->unique()->numerify('##########'),   
            'mobile_2' => $this->faker->unique()->numerify('##########'),
            'email' => $this->faker->unique()->safeEmail(),
        ];
    }
}

// supplier: z.string().optional(),
// street_address: z.string().optional(),
// area: z.string().optional(),
// city: z.string().optional(),
// state: z.string().optional(),
// pincode: z.string().optional(),
// country: z.string().optional(),
// gstin: z.string().optional(),
// contact_no: z.string().optional(),
// department: z.string().optional(),
// designation: z.string().optional(),
// mobile_1: z.string().optional(),
// mobile_2: z.string().optional(),
// email: z.string().optional(),