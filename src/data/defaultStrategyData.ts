import { Doctrine, StrategicDecision, StrategicExperiment, StrategicPostmortem } from '../types';

export const DEFAULT_DOCTRINES: Doctrine[] = [
  {
    id: 'doc-stability-over-intensity',
    name: 'Stability Over Intensity',
    rule: 'When execution collapses or fatigue strikes, reduce daily scope before abandoning the system. Consistency beats heroic erratic sprints.',
    appliesTo: 'All Campaigns & Daily Directives',
    origin: 'Strategic Review & Muḥāsabah',
    status: 'Active',
    category: 'Execution',
    createdAt: '2026-08-01T00:00:00.000Z'
  },
  {
    id: 'doc-first-principles',
    name: 'First Principles Before Scaling',
    rule: 'Do not automate, outsource, or prematurely scale an unproven hypothesis. Validate manually and repeatedly first.',
    appliesTo: 'Projects & Architecture',
    origin: 'Systems Engineering Audit',
    status: 'Active',
    category: 'Architecture',
    createdAt: '2026-08-10T00:00:00.000Z'
  },
  {
    id: 'doc-zero-ambiguity',
    name: 'Zero Ambiguity Directives',
    rule: 'A quest without a concrete, unmistakable finish line is an anxiety trigger. Deconstruct and split until the next physical action takes under 60 minutes.',
    appliesTo: 'Daily Directives & Quests',
    origin: 'Execution Postmortem',
    status: 'Active',
    category: 'Planning',
    createdAt: '2026-08-15T00:00:00.000Z'
  },
  {
    id: 'doc-golden-hours',
    name: 'Protect the Golden Hours',
    rule: 'The early morning window after Fajr is sacred focus capital. No passive media, open communications, or administrative chores are permitted.',
    appliesTo: 'Focus & Energy Allocation',
    origin: 'Spiritual & Focus Audit',
    status: 'Active',
    category: 'Temporal',
    createdAt: '2026-08-20T00:00:00.000Z'
  },
  {
    id: 'doc-fail-fast-codify',
    name: 'Fail Fast, Codify Permanently',
    rule: 'Every operational friction or failed directive must produce a tangible Lesson or an SOP update within 48 hours. Unrecorded failures repeat indefinitely.',
    appliesTo: 'Operations & Postmortems',
    origin: 'System Doctrine',
    status: 'Active',
    category: 'Knowledge',
    createdAt: '2026-08-25T00:00:00.000Z'
  }
];

export const DEFAULT_STRATEGIC_DECISIONS: StrategicDecision[] = [
  {
    id: 'sdec-01',
    problem: 'Cognitive fragmentation across 3 concurrent technical projects and primary software architecture roadmap.',
    context: 'Daily momentum was diluting. Tasks were stalling across multiple branches, creating mental friction and delayed milestones.',
    options: [
      'Maintain concurrent execution across all three at reduced pace',
      'Enact a total Strategic Freeze on secondary projects and commit 100% capacity to core architecture',
      'Outsource lower-level feature implementation to external contractors'
    ],
    frameworkUsed: 'Eisenhower Matrix & Pareto 80/20 Analysis',
    decision: 'Enact strict Strategic Freeze on secondary projects until core architecture hits production milestone.',
    reason: '80% of career advancement and leverage stems from the core architecture. Context switching was consuming an estimated 35% of cognitive energy.',
    expectedResult: 'Deliver core milestone 3 weeks ahead of original schedule with zero architectural debt.',
    confidence: 90,
    reviewDate: '2026-10-01',
    actualResult: 'Core architecture v1.0 achieved testing milestone 14 days early with pristine test coverage.',
    lesson: 'Singular focus creates compounding velocity; concurrency in complex creative craft is an illusion.',
    createdAt: '2026-08-15T09:00:00.000Z'
  }
];

export const DEFAULT_STRATEGIC_EXPERIMENTS: StrategicExperiment[] = [
  {
    id: 'sexp-01',
    hypothesis: 'Executing the heaviest campaign directive immediately following Fajr without checking notifications will increase deep work hours by 50% and eliminate afternoon brain fog.',
    prediction: 'Achieve 90 minutes of unbroken focus before 08:00 AM for 14 consecutive days.',
    experiment: 'Phone locked in charging sanctum; workstation initialized night before with directive open.',
    timeboxDays: 14,
    startDate: '2026-09-01',
    endDate: '2026-09-15',
    measurement: 'Uninterrupted focus minutes logged via Pomodoro engine and morning directive completion status.',
    result: '12 out of 14 days achieved. Deep focus rose from 75m to 142m daily average. Stress levels reduced markedly.',
    verdict: 'Keep',
    decision: 'Codified as permanent rule in Golden Hours Doctrine and Daily Sanctum SOP.',
    codifiedSopOrDoctrine: 'Doctrine: Protect the Golden Hours',
    createdAt: '2026-09-01T06:00:00.000Z'
  }
];

export const DEFAULT_STRATEGIC_POSTMORTEMS: StrategicPostmortem[] = [
  {
    id: 'spm-01',
    event: 'Quarterly Systems Deployment Delayed by 12 Days',
    expectedOutcome: 'Ship release build with complete automated test suite by end of Month 2.',
    actualOutcome: 'Shipped 12 days late due to unverified external dependencies and mid-sprint scope additions.',
    impact: 'Delayed follow-up onboarding campaign and compressed weekly rest schedule.',
    timeline: 'Week 2: Scope expanded without adjustment; Week 4: External dependency broke; Week 7: Late-night refactoring.',
    failurePoint: 'Accepting unvalidated dependency assumptions and late feature requests without pushing deadlines.',
    rootCause: '5 Whys analysis showed absence of a hard architectural feature freeze gate.',
    correctiveAction: 'Enforce mandatory dependency spikes in Week 1 of every campaign; enforce hard feature freeze 10 days before target date.',
    experiment: 'Enforce feature freeze protocol on next campaign cycle.',
    result: 'Subsequent release shipped 2 days ahead of schedule.',
    lesson: 'A target date without an intentional buffer and hard freeze gate is an aspiration, not an engineering plan.',
    codifiedSopOrDoctrine: 'SOP-04: Campaign Milestone & Dependency Validation Protocol',
    createdAt: '2026-08-28T14:30:00.000Z'
  }
];
