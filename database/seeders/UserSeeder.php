<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['username' => 'zidane'],
            [
                'name' => 'Zidane',
                'email' => 'zidane@sfac.edu.ph',
                'phone' => null,
                'role' => 'admin',
                'avatar' => null,
                'signature' => null,
                'password' => '123456789',
            ]
        );
    }
}
public function run(): void
{
    $this->call([
        UserSeeder::class,
    ]);
}