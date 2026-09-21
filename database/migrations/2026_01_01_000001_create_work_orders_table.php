<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('work_orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->string('requestor_name');
            $table->string('requestor_department')->nullable();
            $table->string('campus');
            $table->string('category');
            $table->text('description')->nullable();
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->enum('status', ['pending', 'in_progress', 'alternative', 'contracted', 'completed', 'cancelled'])->default('pending');
            $table->string('assigned_to')->nullable();
            $table->date('target_completion')->nullable();
            $table->string('images')->nullable(); // JSON array of image paths
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('work_orders');
    }
};
