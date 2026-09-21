<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Clear existing users first
        User::truncate();

        $users = [
            // Tech Support
            ['name' => 'Lorenzo Elis Ortega Gutierrez', 'username' => 'lorenzo',      'email' => 'gutierrezlg@sfac.edu.ph',        'phone' => '09156571059', 'role' => 'tech_support'],
            ['name' => 'Gerardo F. Vibar Jr.',           'username' => 'GVibar',       'email' => 'mayorvibar@gmail.com',            'phone' => '09669405778', 'role' => 'tech_support'],
            ['name' => 'Joseph San Miguel Apolonio',     'username' => 'joseph',       'email' => 'josephsanmiguelapolonio@gmail.com','phone' => '09917692304', 'role' => 'tech_support'],
            ['name' => 'Kenneth Issac Calma Yango',      'username' => 'kenneth',      'email' => 'kennethy.ango@gmail.com',          'phone' => '09773759022', 'role' => 'tech_support'],
            ['name' => 'Jason C. Casas',                 'username' => 'jason',        'email' => 'jason.carlo.hocasas@gmail.com',   'phone' => '09369898840', 'role' => 'tech_support'],
            ['name' => 'Axle John A. Javillonar',        'username' => 'AJavillonar',  'email' => 'axlejohn.javillonar@sfac.edu.ph', 'phone' => '09292005180', 'role' => 'tech_support'],
            // Admins
            ['name' => 'MISO Head Jason',                'username' => 'misoHead',     'email' => 'miso@sfac.edu.ph',               'phone' => '09270459310', 'role' => 'admin'],
            ['name' => 'Lorenzo Elis Ortega Gutierrez',  'username' => 'lorenzoadmin', 'email' => 'lorenzogutierrez@sfac.edu.ph',   'phone' => '09156571059', 'role' => 'admin'],
            ['name' => 'Sharon V. Dimatulac',            'username' => 'pd_Dimatulac', 'email' => 'sharon.dimatulac@sfac.edu.ph',   'phone' => '+639369812345','role' => 'admin'],
            ['name' => 'Aries Roldan',                   'username' => 'ARoldan',      'email' => 'aries.roldan@sfac.edu.ph',        'phone' => '09771234567', 'role' => 'admin'],
            // Primary admin (always last so it gets the highest id → used as current user)
            ['name' => 'Zidane Lineses',                 'username' => 'zidane',       'email' => 'zidane@sfac.edu.ph',             'phone' => '09171234567', 'role' => 'admin'],
        ];

        foreach ($users as $u) {
            User::create([
                ...$u,
                'password'          => Hash::make('password'),
                'email_verified_at' => now(),
            ]);
        }
    }
}
