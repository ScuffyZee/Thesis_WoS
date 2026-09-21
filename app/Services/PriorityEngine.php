<?php

namespace App\Services;

/**
 * Priority Engine
 *
 * Formula:  Priority Score = (Urgency + Impact + WaitTimeScore) / 3
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ Urgency (1–6)  — chosen by the requestor                           │
 * │  6  Disrupts ongoing class / exam                                  │
 * │  5  Disrupts a scheduled activity soon                             │
 * │  4  Affects work, time-crucial                                     │
 * │  3  Affects work but not time-critical                             │
 * │  2  Minor inconvenience                                            │
 * │  1  No immediate effect                                            │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │ Impact (1–5)  — AUTO-ASSIGNED from department                      │
 * │  5  FAO / OOR / MIS Office  (core institutional operations)        │
 * │  4  Admin / HED             (broad operational impact)             │
 * │  3  HRD                     (internal ops, workarounds exist)      │
 * │  2  OSA                     (student services, limited impact)     │
 * │  1  (default for unknown)                                          │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │ WaitTimeScore — derived from estimated minutes to resolve          │
 * │   0–10 min → 1                                                     │
 * │  11–20 min → 2                                                     │
 * │  21–30 min → 3                                                     │
 * │  31–40 min → 4                                                     │
 * │  41+   min → 5                                                     │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │ Priority Level                                                      │
 * │  4.00–5.00 → urgent   (Critical)                                   │
 * │  3.00–3.99 → high                                                  │
 * │  2.00–2.99 → medium                                                │
 * │  1.00–1.99 → low                                                   │
 * └─────────────────────────────────────────────────────────────────────┘
 */
class PriorityEngine
{
    /** Department → Impact score mapping. */
    private const DEPARTMENT_IMPACT = [
        // Critical (5) — core institutional operations
        'Finance and Accounting Office (FAO)' => 5,
        'Office of the Registrar (OOR)'       => 5,
        'MIS Office'                          => 5,

        // High (4) — broad operational impact
        'Admin'                               => 4,
        'Higher Education Department (HED)'   => 4,

        // Moderate (3) — internal ops, workarounds usually exist
        'Human Resources Department (HRD)'    => 3,

        // Low (2) — student services, limited operational impact
        'Office of the Student Affairs (OSA)' => 2,
    ];

    /**
     * Auto-assign impact score from department.
     */
    public static function impactFromDepartment(string $department): int
    {
        return self::DEPARTMENT_IMPACT[$department] ?? 1;
    }

    /**
     * Derive the wait-time band score from estimated minutes.
     */
    public static function waitTimeScore(int $minutes): int
    {
        return match (true) {
            $minutes <= 10 => 1,
            $minutes <= 20 => 2,
            $minutes <= 30 => 3,
            $minutes <= 40 => 4,
            default        => 5,
        };
    }

    /**
     * Baseline estimated minutes per service category.
     * Janitorial is intentionally excluded from the system.
     */
    private const CATEGORY_BASE_MINUTES = [
        'Technical Support'     => 30,
        'Network Support'       => 45,
        'Hardware Repair'       => 60,
        'Software Installation' => 20,
        'Electrical'            => 60,
        'Plumbing'              => 45,
        'Carpentry'             => 90,
        'Aircon Maintenance'    => 60,
        'Other'                 => 30,
    ];

    /**
     * Keyword rules that adjust the baseline estimate.
     * Each entry: [pattern, delta_minutes, reason]
     */
    private const KEYWORD_ADJUSTMENTS = [
        ['/\b(not turning on|dead|no power|won\'?t boot|won\'t start|doesn\'?t turn on)\b/i',              +30, 'likely hardware replacement needed'],
        ['/\b(whole lab|entire floor|multiple (units|computers|pcs)|all units|all computers)\b/i',         +20, 'wider scope — multiple units affected'],
        ['/\b(slow|lag(ging)?|frozen|freezing|hanging|hangs|unresponsive)\b/i',                            +10, 'needs extended diagnosis'],
        ['/\b(reinstall|reformat|format|fresh install|clean install)\b/i',                                 +25, 'full OS / software reinstall'],
        ['/\b(no internet|no wifi|no wi-fi|no connection|can\'?t connect|cannot connect|disconnected|no signal|wifi not working|wi-fi not working|internet down|no network|internet (is )?not working)\b/i', +20, 'ISP check + router/switch diagnosis'],
        ['/\b(simple|quick fix|just need to|minor issue|minor problem|small issue)\b/i',                   -10, 'requestor flagged as simple'],
        ['/\b(password|reset password|unlock account|unlock|forgot password|access (issue|problem))\b/i', -15, 'quick account/credential fix'],
    ];

    /**
     * Estimate wait time (minutes) from category + description.
     *
     * @return array{minutes: int, baseline: int, adjustment: int, reasons: string[]}
     */
    public static function estimateWaitTime(string $category, string $description): array
    {
        $baseline   = self::CATEGORY_BASE_MINUTES[$category] ?? 30;
        $adjustment = 0;
        $reasons    = [];

        foreach (self::KEYWORD_ADJUSTMENTS as [$pattern, $delta, $reason]) {
            if (preg_match($pattern, $description)) {
                $adjustment += $delta;
                $reasons[]   = ($delta > 0 ? '+' : '') . $delta . ' min: ' . $reason;
            }
        }

        $minutes = max(5, $baseline + $adjustment);

        return [
            'minutes'    => $minutes,
            'baseline'   => $baseline,
            'adjustment' => $adjustment,
            'reasons'    => $reasons,
        ];
    }

    /**
     * Compute the priority score (2 decimal places).
     */
    public static function score(int $urgency, int $impact, int $estimatedMinutes): float
    {
        $waitScore = self::waitTimeScore($estimatedMinutes);

        return round(($urgency + $impact + $waitScore) / 3, 2);
    }

    /**
     * Map a numeric score to the priority enum value.
     */
    public static function level(float $score): string
    {
        return match (true) {
            $score >= 4.00 => 'urgent',  // "Critical" in spec
            $score >= 3.00 => 'high',
            $score >= 2.00 => 'medium',
            default        => 'low',
        };
    }

    /**
     * Full computation from raw inputs. Returns score + level + breakdown.
     *
     * @return array{score: float, level: string, impact: int, wait_score: int}
     */
    public static function compute(
        int    $urgency,
        string $department,
        int    $estimatedMinutes,
    ): array {
        $impact    = self::impactFromDepartment($department);
        $waitScore = self::waitTimeScore($estimatedMinutes);
        $score     = round(($urgency + $impact + $waitScore) / 3, 2);

        return [
            'score'      => $score,
            'level'      => self::level($score),
            'impact'     => $impact,
            'wait_score' => $waitScore,
        ];
    }
}
