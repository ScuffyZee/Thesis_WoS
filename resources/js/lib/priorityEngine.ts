/**
 * Priority Engine
 *
 * Formula:  Priority Score = (Urgency + Impact + WaitTimeScore) / 3
 *
 * Urgency (1–6) — chosen by the requestor
 *   6  Disrupts ongoing class / exam
 *   5  Disrupts a scheduled activity soon
 *   4  Affects work, time-crucial
 *   3  Affects work, not time-critical
 *   2  Minor inconvenience
 *   1  No immediate effect
 *
 * Impact (1–5) — AUTO-ASSIGNED from department
 *   5  FAO / OOR / MIS Office   (core institutional operations)
 *   4  Admin / HED              (broad operational impact)
 *   3  HRD                      (internal ops, workarounds exist)
 *   2  OSA                      (student services, limited impact)
 *   1  default / unknown
 *
 * WaitTimeScore — derived from estimated minutes to resolve
 *    0–10 min → 1
 *   11–20 min → 2
 *   21–30 min → 3
 *   31–40 min → 4
 *   41+   min → 5
 *
 * Priority Level
 *   4.00–5.00 → Critical
 *   3.00–3.99 → High
 *   2.00–2.99 → Medium
 *   1.00–1.99 → Low
 */

export type Priority = 'low' | 'medium' | 'high' | 'critical';

// ─── Urgency options (user-facing) ────────────────────────────────────────────

export const URGENCY_OPTIONS = [
    { value: 6, label: 'Disrupts ongoing class / exam' },
    { value: 5, label: 'Disrupts a scheduled activity soon' },
    { value: 4, label: 'Affects work, time-crucial' },
    { value: 3, label: 'Affects work, not time-critical' },
    { value: 2, label: 'Minor inconvenience' },
    { value: 1, label: 'No immediate effect' },
] as const;

// ─── Department → Impact mapping (must mirror PriorityEngine.php) ─────────────

const DEPARTMENT_IMPACT: Record<string, number> = {
    // Critical (5)
    'Finance and Accounting Office (FAO)': 5,
    'Office of the Registrar (OOR)': 5,
    'MIS Office': 5,
    // High (4)
    'Admin': 4,
    'Higher Education Department (HED)': 4,
    // Moderate (3)
    'Human Resources Department (HRD)': 3,
    // Low (2)
    'Office of the Student Affairs (OSA)': 2,
};

export const IMPACT_LABELS: Record<number, string> = {
    5: 'Critical Impact',
    4: 'High Impact',
    3: 'Moderate Impact',
    2: 'Low Impact',
    1: 'Minimal Impact',
};

export function impactFromDepartment(department: string): number {
    return DEPARTMENT_IMPACT[department] ?? 1;
}

// ─── Wait-time bands ──────────────────────────────────────────────────────────

export const WAIT_TIME_BANDS = [
    { max: 10,       score: 1, label: '0 – 10 minutes' },
    { max: 20,       score: 2, label: '11 – 20 minutes' },
    { max: 30,       score: 3, label: '21 – 30 minutes' },
    { max: 40,       score: 4, label: '31 – 40 minutes' },
    { max: Infinity, score: 5, label: '41+ minutes' },
] as const;

export function waitTimeScore(minutes: number): number {
    if (minutes <= 10) return 1;
    if (minutes <= 20) return 2;
    if (minutes <= 30) return 3;
    if (minutes <= 40) return 4;
    return 5;
}

// ─── Wait-time estimation from category + description ────────────────────────

/**
 * Baseline estimated minutes per service category.
 * Janitorial is intentionally excluded.
 */
const CATEGORY_BASE_MINUTES: Record<string, number> = {
    'Technical Support':    30,
    'Network Support':      45,
    'Hardware Repair':      60,
    'Software Installation':20,
    'Electrical':           60,
    'Plumbing':             45,
    'Carpentry':            90,
    'Aircon Maintenance':   60,
    'Other':                30,
};

/**
 * Keyword groups that adjust the baseline estimate.
 * Each entry: { patterns, adjustment (minutes), reason }
 */
const KEYWORD_ADJUSTMENTS: {
    patterns: RegExp;
    delta: number;
    reason: string;
}[] = [
    {
        patterns: /\b(not turning on|dead|no power|won'?t boot|won't start|doesn'?t turn on)\b/i,
        delta: 30,
        reason: 'likely hardware replacement needed',
    },
    {
        patterns: /\b(whole lab|entire floor|multiple (units|computers|pcs)|all units|all computers)\b/i,
        delta: 20,
        reason: 'wider scope — multiple units affected',
    },
    {
        patterns: /\b(slow|lag(ging)?|frozen|freezing|hanging|hangs|unresponsive)\b/i,
        delta: 10,
        reason: 'needs extended diagnosis',
    },
    {
        patterns: /\b(reinstall|reformat|format|fresh install|clean install)\b/i,
        delta: 25,
        reason: 'full OS / software reinstall',
    },
    {
        patterns: /\b(no internet|no wifi|no wi-fi|no connection|can'?t connect|cannot connect|disconnected|no signal|wifi not working|wi-fi not working|internet down|no network|internet (is )?not working)\b/i,
        delta: 20,
        reason: 'ISP check + router/switch diagnosis',
    },
    {
        patterns: /\b(simple|quick fix|just need to|minor issue|minor problem|small issue)\b/i,
        delta: -10,
        reason: 'requestor flagged as simple',
    },
    {
        patterns: /\b(password|reset password|unlock account|unlock|forgot password|access (issue|problem))\b/i,
        delta: -15,
        reason: 'quick account/credential fix',
    },
];

export interface WaitEstimate {
    /** Final clamped estimate in minutes */
    minutes: number;
    /** Category baseline before keyword adjustments */
    baseline: number;
    /** Net adjustment from keywords */
    adjustment: number;
    /** Which keyword rules fired */
    matchedReasons: string[];
}

/**
 * Estimate wait time from category + free-text description.
 * Returns baseline + keyword adjustments, minimum 5 minutes.
 */
export function estimateWaitTime(
    category: string,
    description: string,
): WaitEstimate {
    const baseline   = CATEGORY_BASE_MINUTES[category] ?? 30;
    let adjustment   = 0;
    const reasons: string[] = [];

    for (const rule of KEYWORD_ADJUSTMENTS) {
        if (rule.patterns.test(description)) {
            adjustment += rule.delta;
            reasons.push(
                `${rule.delta > 0 ? '+' : ''}${rule.delta} min: ${rule.reason}`,
            );
        }
    }

    const minutes = Math.max(5, baseline + adjustment);

    return { minutes, baseline, adjustment, matchedReasons: reasons };
}

// ─── Priority level ───────────────────────────────────────────────────────────

export function priorityLevel(score: number): Priority {
    if (score >= 4.0) return 'critical';
    if (score >= 3.0) return 'high';
    if (score >= 2.0) return 'medium';
    return 'low';
}

export const PRIORITY_LABELS: Record<Priority, string> = {
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
};

// ─── Main computation ─────────────────────────────────────────────────────────

export interface PriorityResult {
    urgency: number;
    impact: number;
    impactLabel: string;
    waitScore: number;
    estimatedMinutes: number;
    score: number;
    scoreDisplay: string;
    level: Priority;
    levelLabel: string;
}

export function computePriority(
    urgency: number,
    department: string,
    estimatedMinutes: number,
): PriorityResult {
    const impact    = impactFromDepartment(department);
    const wScore    = waitTimeScore(estimatedMinutes);
    const raw       = (urgency + impact + wScore) / 3;
    const score     = Math.round(raw * 100) / 100;
    const level     = priorityLevel(score);

    return {
        urgency,
        impact,
        impactLabel: IMPACT_LABELS[impact] ?? 'Unknown',
        waitScore: wScore,
        estimatedMinutes,
        score,
        scoreDisplay: score.toFixed(2),
        level,
        levelLabel: PRIORITY_LABELS[level],
    };
}
