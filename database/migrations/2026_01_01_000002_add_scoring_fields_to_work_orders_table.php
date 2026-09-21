<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('work_orders', function (Blueprint $table) {
            // Urgency: 1–6 (set by requestor)
            $table->unsignedTinyInteger('urgency')->nullable()->after('description');
            // Impact: 1–5 (set by requestor)
            $table->unsignedTinyInteger('impact')->nullable()->after('urgency');
            // Estimated wait time in minutes (set by requestor)
            $table->unsignedInteger('estimated_wait_minutes')->nullable()->after('impact');
            // Computed score stored for reporting (e.g. 3.67)
            $table->decimal('priority_score', 4, 2)->nullable()->after('estimated_wait_minutes');
        });
    }

    public function down(): void
    {
        Schema::table('work_orders', function (Blueprint $table) {
            $table->dropColumn([
                'urgency',
                'impact',
                'estimated_wait_minutes',
                'priority_score',
            ]);
        });
    }
};
