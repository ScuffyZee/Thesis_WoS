<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $order_number
 * @property string $requestor_name
 * @property string|null $requestor_department
 * @property string $campus
 * @property string $category
 * @property string|null $description
 * @property string $priority
 * @property string $status
 * @property string|null $assigned_to
 * @property Carbon|null $target_completion
 * @property string|null $images
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'order_number',
    'requestor_name',
    'requestor_department',
    'campus',
    'category',
    'description',
    'resolution_notes',
    'urgency',
    'impact',
    'estimated_wait_minutes',
    'priority_score',
    'priority',
    'status',
    'assigned_to',
    'target_completion',
    'date_completed',
    'images',
])]
class WorkOrder extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'target_completion' => 'date',
            'date_completed'    => 'datetime',
            'images'            => 'array',
        ];
    }

    /**
     * Generate the next work order number in the format JO-YYYY-NNNN.
     */
    public static function generateOrderNumber(): string
    {
        $year = now()->year;
        $prefix = "JO-{$year}-";
        $last = static::where('order_number', 'like', "{$prefix}%")
            ->orderBy('id', 'desc')
            ->first();

        $next = $last
            ? (int) substr($last->order_number, strlen($prefix)) + 1
            : 1;

        return $prefix . str_pad((string) $next, 4, '0', STR_PAD_LEFT);
    }

    /** Scope filter by campus. */
    public function scopeCampus(\Illuminate\Database\Eloquent\Builder $query, ?string $campus): \Illuminate\Database\Eloquent\Builder
    {
        return $campus ? $query->where('campus', $campus) : $query;
    }

    /** Scope filter by status. */
    public function scopeStatus(\Illuminate\Database\Eloquent\Builder $query, ?string $status): \Illuminate\Database\Eloquent\Builder
    {
        return $status ? $query->where('status', $status) : $query;
    }

    /** Scope filter by priority. */
    public function scopePriority(\Illuminate\Database\Eloquent\Builder $query, ?string $priority): \Illuminate\Database\Eloquent\Builder
    {
        return $priority ? $query->where('priority', $priority) : $query;
    }
}
