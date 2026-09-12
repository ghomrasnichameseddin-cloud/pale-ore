import {
  POSState,
  WeeklyMuhasabahSummary,
  WeeklyScoreBreakdown,
  MuhasabahCategory,
  MuhasabahEntry,
  SpiritualDailyLog
} from '../types';
import { getXPAnalytics } from './xpCirculation';

/**
 * ═════════════════════════════════════════════════════════════════════════════
 * ISLAMIC SACRED MUHĀSABAH WEEKLY CYCLE ENGINE
 * ═════════════════════════════════════════════════════════════════════════════
 * 
 * SACRED WEEK BOUNDARY SPECIFICATION:
 * In Islamic tradition and spiritual practice, Friday (Yawm al-Jumu'ah) is the pinnacle,
 * "Sayyid al-Ayyam" (Master of Days), and the spiritual crown of the week.
 * 
 * Therefore, the Muḥāsabah week is strictly defined as:
 *   • WEEK START: Saturday (00:00)
 *   • WEEK END:   Friday (23:59) — the Jumu'ah spiritual audit and closing anchor.
 * 
 * SUNDAY AUTOMATED RESET TRIGGER:
 * Sunday marks the transition into the new civil/operational week (2 days after Jumu'ah).
 * On Sunday, the system reconciles the just-concluded Saturday→Friday week, generates its
 * permanent archival record (savedWeeklySummaries + planning markdown document), and
 * transitions the active Muḥāsabah ledger to the current week with zero data loss.
 * 
 * SINGLE SOURCE OF TRUTH:
 * Every trigger check, summary generation, archive filename, and date filter across
 * the codebase MUST derive from `getWeekBoundaries` or `getClosingWeekBoundaries`.
 * ═════════════════════════════════════════════════════════════════════════════
 */

export interface WeekBoundaries {
  weekStart: string;   // YYYY-MM-DD (Saturday)
  weekEnd: string;     // YYYY-MM-DD (Friday)
  anchorDate: string;  // YYYY-MM-DD (Friday anchor for summaries)
  daysInWeek: string[];// Exactly 7 dates [Sat, Sun, Mon, Tue, Wed, Thu, Fri]
  weekLabel: string;   // Human-readable label: "Week ending Friday, Month Day, Year"
}

/**
 * 6-Pillar Sacred Scoring Weights (Mathematical sum strictly equals 10.0)
 */
export const WEEKLY_SCORE_WEIGHTS = {
  fardhPrayers: 2.5,   // Preservation of 35 Fardh prayers (weighted on-time vs delayed)
  slipsRestraint: 2.0, // Restraint from sins, slips, and Nafs lapses
  adhkarFortress: 1.5, // Daily Morning, Evening, and Sleep Adhkār fortress
  sunnahQiyam: 1.5,    // Sunan Rawātib, Nawāfil, and Qiyām al-Layl
  salawat: 1.0,        // Covenant of Salawāt upon Prophet Muḥammad ﷺ (70+/day or 490+/wk)
  kaffarahTawbah: 1.5  // Prompt repentance and completed Kaffārah remedies
} as const;

export const TOTAL_MAX_WEEKLY_SCORE = Number(
  (
    WEEKLY_SCORE_WEIGHTS.fardhPrayers +
    WEEKLY_SCORE_WEIGHTS.slipsRestraint +
    WEEKLY_SCORE_WEIGHTS.adhkarFortress +
    WEEKLY_SCORE_WEIGHTS.sunnahQiyam +
    WEEKLY_SCORE_WEIGHTS.salawat +
    WEEKLY_SCORE_WEIGHTS.kaffarahTawbah
  ).toFixed(4)
);

// Compile/runtime validation to ensure no future weight changes break the 10.0 total
if (Math.abs(TOTAL_MAX_WEEKLY_SCORE - 10.0) > 0.0001) {
  throw new Error(`[CRITICAL] WEEKLY_SCORE_WEIGHTS must sum to exactly 10.0, but sums to ${TOTAL_MAX_WEEKLY_SCORE}`);
}

import { parseDateSafe, formatDateStr, getLocalDateString, addDays } from './dateUtils';
export { parseDateSafe, formatDateStr, addDays };

/**
 * Single source of truth for weekly boundaries.
 * Given ANY reference date, returns the Islamic week containing it (Saturday → Friday).
 * 
 * Day of week index (JS getDay):
 * 0 = Sunday    -> subtract 1 day to reach Saturday
 * 1 = Monday    -> subtract 2 days to reach Saturday
 * 2 = Tuesday   -> subtract 3 days to reach Saturday
 * 3 = Wednesday -> subtract 4 days to reach Saturday
 * 4 = Thursday  -> subtract 5 days to reach Saturday
 * 5 = Friday    -> subtract 6 days to reach Saturday
 * 6 = Saturday  -> subtract 0 days to reach Saturday
 */
export function getWeekBoundaries(referenceDate: Date | string = new Date()): WeekBoundaries {
  const refDate = parseDateSafe(referenceDate);
  const dayOfWeek = refDate.getDay();

  // Days to subtract from reference date to arrive at Saturday
  const daysToSaturday = (dayOfWeek + 1) % 7;
  const saturdayStr = addDays(refDate, -daysToSaturday);

  const daysInWeek: string[] = [];
  for (let i = 0; i < 7; i++) {
    daysInWeek.push(addDays(saturdayStr, i));
  }

  const weekStart = daysInWeek[0]; // Saturday
  const weekEnd = daysInWeek[6];   // Friday
  const anchorDate = weekEnd;      // Friday is the canonical weekly anchor

  const fridayObj = parseDateSafe(weekEnd);
  const formattedFriday = fridayObj.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  const weekLabel = `Week ending Friday, ${formattedFriday}`;

  return {
    weekStart,
    weekEnd,
    anchorDate,
    daysInWeek,
    weekLabel
  };
}

/**
 * Calculates the week boundaries for the week closing on a given Sunday.
 * On Sunday, the week to be archived ended on Friday (Sunday - 2 days).
 */
export function getClosingWeekBoundaries(sundayReferenceDate: Date | string): WeekBoundaries {
  const fridayAnchor = addDays(sundayReferenceDate, -2);
  return getWeekBoundaries(fridayAnchor);
}

/**
 * Generates the canonical Markdown document for a weekly summary.
 */
export function buildWeeklySummaryMarkdown(summary: WeeklyMuhasabahSummary): { path: string; name: string; content: string } {
  const b = summary.weeklyScoreBreakdown;
  const scoreStr = summary.scoreOutOf10 !== undefined ? `${summary.scoreOutOf10.toFixed(1)} / 10.0` : '10/10';
  const gradeStr = b ? `${b.gradeAr} (${b.gradeEn})` : summary.spiritualRating;
  const breakdownMd = b ? `
### ⚖️ 10/10 Pillar Score Breakdown:
- **1. Farā'iḍ Prayers (أركان الصلاة):** ${b.fardhPrayersScore.toFixed(1)} / ${WEEKLY_SCORE_WEIGHTS.fardhPrayers.toFixed(1)} pts
- **2. Slips & Restraint (حفظ الجوارح والعثرات):** ${b.slipsRestraintScore.toFixed(1)} / ${WEEKLY_SCORE_WEIGHTS.slipsRestraint.toFixed(1)} pts
- **3. Adhkār Fortress (حصن الأذكار):** ${b.adhkarFortressScore.toFixed(1)} / ${WEEKLY_SCORE_WEIGHTS.adhkarFortress.toFixed(1)} pts
- **4. Sunan & Qiyām (السنن وقيام الليل):** ${b.sunnahQiyamScore.toFixed(1)} / ${WEEKLY_SCORE_WEIGHTS.sunnahQiyam.toFixed(1)} pts
- **5. Salawāt upon ﷺ (الصلاة على النبي):** ${b.salawatScore.toFixed(1)} / ${WEEKLY_SCORE_WEIGHTS.salawat.toFixed(1)} pt
- **6. Tawbah & Kaffārah (التوبة وتصفية الكفارات):** ${b.kaffarahTawbahScore.toFixed(1)} / ${WEEKLY_SCORE_WEIGHTS.kaffarahTawbah.toFixed(1)} pts

### 🎯 Refine to 10/10 Action Plan:
${b.actionPlan10OutOf10.map(plan => `- ${plan}`).join('\n')}
` : '';

  const docPath = `04 Operations/Weekly Muhasabah/Weekly Summary - ${summary.generatedDate}.md`;
  const docName = `Weekly Summary - ${summary.generatedDate}`;
  const docContent = `# 📜 Weekly Muḥāsabah Sacred Review (${summary.weekLabel})

**Generated:** ${summary.generatedDate} (Jumu'ah Review)
**Weekly Sacred Audit Score:** **${scoreStr}** — *${gradeStr}*
**Net Weekly XP:** ${summary.totalNetXP >= 0 ? '+' : ''}${summary.totalNetXP} XP (Earned: +${summary.totalEarnedXP} XP, Lost: −${summary.totalLostXP} XP)
${breakdownMd}
## 🕌 Prayer & Worship Fulfillments (Out of 35 Fardh)
- **Fardh Completed:** ${summary.prayersCount} / 35
- **On-Time (في وقتها):** ${summary.prayersOnTimeCount} (+40 XP bonus per prayer)
- **Delayed / Late:** ${summary.prayersDelayedCount} (−50 XP deduction)
- **Sunan Rawātib:** ${summary.sunnahRawatibCount}
- **Morning Adhkar:** ${summary.adhkarSabahCount} / 7
- **Evening Adhkar:** ${summary.adhkarMasaCount} / 7
- **Night Sleep Adhkar:** ${summary.adhkarSleepNightCount || 0} / 7
- **Dhohr Qaylulah Adhkar:** ${summary.adhkarSleepDhohrCount || 0} / 7
- **Salawāt upon the Prophet (ﷺ):** ${summary.salawatTotal}
- **Qiyām al-Layl Rak'ahs:** ${summary.qiyamTotalRakats}

## ⚖️ Slip Ledger Summary
- **Total Slips Audited:** ${summary.totalSlipsCount}
- **Total Coin Fines:** −${summary.totalLostCoins} Coins
- **Top Vulnerability Realm:** ${summary.topWeaknessCategories[0]?.category || 'None'} (${summary.topWeaknessCategories[0]?.count || 0} slips)

## 🎯 Targeted Recommendations for the New Week
${summary.recommendations.map(r => `- ${r}`).join('\n')}

---
*Auto-archived weekly cycle (${summary.startDate} → ${summary.endDate}). XP is an in-app motivational measure. The true reward of worship belongs to Allah alone.*`;

  return { path: docPath, name: docName, content: docContent };
}

/**
 * Pure function to generate a WeeklyMuhasabahSummary from state and target date.
 */
export function generateWeeklyMuhasabahSummaryPure(
  state: Pick<POSState, 'muhasabahEntries' | 'spiritualLogs' | 'xpHistory' | 'quests' | 'profile'> & { skills?: POSState['skills'] },
  targetFridayDate?: string
): WeeklyMuhasabahSummary {
  const boundaries = targetFridayDate ? getWeekBoundaries(targetFridayDate) : getWeekBoundaries();
  const { startDate, endDate, daysInWeek, anchorDate, weekLabel } = {
    startDate: boundaries.weekStart,
    endDate: boundaries.weekEnd,
    daysInWeek: boundaries.daysInWeek,
    anchorDate: boundaries.anchorDate,
    weekLabel: boundaries.weekLabel
  };

  const allEntries = state.muhasabahEntries || [];
  const weekSlips = allEntries.filter(e => {
    if (!e.date) return false;
    return e.date >= startDate && e.date <= endDate;
  });
  const effectiveSlips = weekSlips;

  let totalLostXP = 0;
  let totalLostCoins = 0;
  const categoryStats: Record<MuhasabahCategory, { count: number; lostXP: number }> = {
    Obligations: { count: 0, lostXP: 0 },
    Desires: { count: 0, lostXP: 0 },
    Speech: { count: 0, lostXP: 0 },
    Heart: { count: 0, lostXP: 0 },
    Rights: { count: 0, lostXP: 0 },
    'Wasted Potential': { count: 0, lostXP: 0 }
  };

  effectiveSlips.forEach(s => {
    const xp = s.xpDeducted || s.rawPenalty || 0;
    const coins = s.coinsDeducted || 0;
    totalLostXP += xp;
    totalLostCoins += coins;
    if (categoryStats[s.category]) {
      categoryStats[s.category].count += 1;
      categoryStats[s.category].lostXP += xp;
    }
  });

  const topWeaknessCategories = (Object.keys(categoryStats) as MuhasabahCategory[])
    .map(cat => ({
      category: cat,
      count: categoryStats[cat].count,
      lostXP: categoryStats[cat].lostXP
    }))
    .sort((a, b) => b.lostXP - a.lostXP || b.count - a.count);

  let prayersCount = 0;
  let prayersOnTimeCount = 0;
  let prayersDelayedCount = 0;
  let prayersMissedCount = 0;
  let sunnahRawatibCount = 0;
  let adhkarSabahCount = 0;
  let adhkarMasaCount = 0;
  let adhkarSleepDhohrCount = 0;
  let adhkarSleepNightCount = 0;
  let salawatTotal = 0;
  let qiyamTotalRakats = 0;

  const prayerKeys: ('fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha')[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

  daysInWeek.forEach(dateKey => {
    const log = state.spiritualLogs?.[dateKey];
    if (log) {
      prayerKeys.forEach(p => {
        const pState = log[p];
        if (pState?.fardh) {
          prayersCount++;
          if (pState.onTime) prayersOnTimeCount++;
          if (pState.delayed) prayersDelayedCount++;
        } else {
          prayersMissedCount++;
        }
        if (pState?.sunnahRawatib || pState?.sunnahBefore || pState?.sunnahAfter) {
          sunnahRawatibCount++;
        }
      });
      if (log.adhkarSabah) adhkarSabahCount++;
      if (log.adhkarMasa) adhkarMasaCount++;
      if (log.adhkarSleepDhohr) adhkarSleepDhohrCount++;
      if (log.adhkarSleepNight) adhkarSleepNightCount++;
      salawatTotal += log.salawatCount || 0;
      qiyamTotalRakats += log.qiyamRakats || 0;
    } else {
      prayersMissedCount += 5;
    }
  });

  const weekXpEntries = (state.xpHistory || []).filter(h => {
    const dStr = h.timestamp ? h.timestamp.split('T')[0] : '';
    return dStr >= startDate && dStr <= endDate && h.xp > 0;
  });
  const totalEarnedXP = weekXpEntries.reduce((sum, h) => sum + h.xp, 0);
  const totalNetXP = totalEarnedXP - totalLostXP;

  const questsCompletedInWeek = (state.quests || []).filter(q => {
    if (q.status !== 'Completed' || !q.completedAt) return false;
    const dStr = q.completedAt.split('T')[0];
    return dStr >= startDate && dStr <= endDate;
  }).length;

  const focusMinutesTotal = state.profile?.focusMinutesToday || 0;

  const questPendingKaffarah = (state.quests || []).filter(q => 
    q.status === 'Active' && 
    (q.name.includes('[KAFFĀRAH]') || q.name.includes('[REMEDY]'))
  ).length;

  const questSettledKaffarah = (state.quests || []).filter(q => 
    q.status === 'Completed' && 
    (q.name.includes('[KAFFĀRAH]') || q.name.includes('[REMEDY]'))
  ).length;

  const entrySettledKaffarah = effectiveSlips.filter(s => s.kaffarahCompleted === true).length;
  const entryPendingKaffarah = effectiveSlips.filter(s => s.kaffarahCompleted === false && !s.isExempt).length;

  const settledKaffarah = Math.max(questSettledKaffarah, entrySettledKaffarah);
  const pendingKaffarah = Math.max(questPendingKaffarah, entryPendingKaffarah);

  // 1. Farā'iḍ Prayers Preservation (Max 2.5 pts)
  const fardhPrayersScore = Number(
    Math.min(
      WEEKLY_SCORE_WEIGHTS.fardhPrayers,
      Math.max(0, (prayersOnTimeCount * 2.5 + prayersDelayedCount * 1.5) / 35)
    ).toFixed(2)
  );

  // 2. Restraint from Sins & Slips Ledger (Max 2.0 pts)
  let slipDeductions = 0;
  effectiveSlips.forEach(s => {
    if (s.severity === 'Critical') slipDeductions += 1.2;
    else if (s.severity === 'Severe') slipDeductions += 0.8;
    else if (s.severity === 'Major') slipDeductions += 0.5;
    else if (s.severity === 'Moderate') slipDeductions += 0.3;
    else slipDeductions += 0.15;
  });
  const slipsRestraintScore = Number(
    Math.min(
      WEEKLY_SCORE_WEIGHTS.slipsRestraint,
      Math.max(0, WEEKLY_SCORE_WEIGHTS.slipsRestraint - slipDeductions)
    ).toFixed(2)
  );

  // 3. Adhkār Fortress (Max 1.5 pts)
  const totalAdhkarUnits = adhkarSabahCount + adhkarMasaCount + (adhkarSleepNightCount * 0.7) + (adhkarSleepDhohrCount * 0.5);
  const adhkarFortressScore = Number(
    Math.min(
      WEEKLY_SCORE_WEIGHTS.adhkarFortress,
      Math.max(0, (totalAdhkarUnits / 14) * WEEKLY_SCORE_WEIGHTS.adhkarFortress)
    ).toFixed(2)
  );

  // 4. Sunan & Qiyām al-Layl (Max 1.5 pts)
  const rawatibPart = Math.min(0.8, (sunnahRawatibCount / 20) * 0.8);
  const qiyamPart = Math.min(0.7, (qiyamTotalRakats / 14) * 0.7);
  const sunnahQiyamScore = Number(
    Math.min(
      WEEKLY_SCORE_WEIGHTS.sunnahQiyam,
      Math.max(0, rawatibPart + qiyamPart)
    ).toFixed(2)
  );

  // 5. Salawāt upon ﷺ (Max 1.0 pt)
  const salawatScore = Number(
    Math.min(
      WEEKLY_SCORE_WEIGHTS.salawat,
      Math.max(0, Math.min(1.0, salawatTotal / 490) * WEEKLY_SCORE_WEIGHTS.salawat)
    ).toFixed(2)
  );

  // 6. Tawbah & Kaffārah Settlement (Max 1.5 pts)
  const kaffarahTawbahScore = Number(
    Math.min(
      WEEKLY_SCORE_WEIGHTS.kaffarahTawbah,
      Math.max(0, WEEKLY_SCORE_WEIGHTS.kaffarahTawbah - (pendingKaffarah * 0.4) + (settledKaffarah > 0 ? 0.2 : 0))
    ).toFixed(2)
  );

  const totalWeeklyScore = Number(
    Math.min(10.0, Math.max(0, fardhPrayersScore + slipsRestraintScore + adhkarFortressScore + sunnahQiyamScore + salawatScore + kaffarahTawbahScore)).toFixed(1)
  );

  let gradeAr = 'مرتبة الإحسان والمراقبة (10/10)';
  let gradeEn = 'Ihsanic Excellence (10/10 Mastery)';
  let spiritualRating: WeeklyMuhasabahSummary['spiritualRating'] = 'Mumtaz (Exceptional)';

  if (totalWeeklyScore >= 9.5) {
    gradeAr = 'مرتبة الإحسان والمراقبة (10/10)';
    gradeEn = 'Ihsanic Excellence (10/10 Mastery)';
    spiritualRating = 'Mumtaz (Exceptional)';
  } else if (totalWeeklyScore >= 8.5) {
    gradeAr = 'النفس المطمئنة';
    gradeEn = "Al-Nafs Al-Mutma'innah (Steadfast Tranquility)";
    spiritualRating = 'Jayyid Jiddan (Very Good)';
  } else if (totalWeeklyScore >= 7.0) {
    gradeAr = 'النفس اللوامة (مجاهدة مستمرة)';
    gradeEn = 'Al-Nafs Al-Lawwamah (Active Vigilance & Struggle)';
    spiritualRating = 'Jayyid (Good)';
  } else if (totalWeeklyScore >= 5.0) {
    gradeAr = 'مقتصد - يحتاج تقوية';
    gradeEn = 'Muqtasid (Passing - Requires Fortification)';
    spiritualRating = 'Maqbool (Passing)';
  } else {
    gradeAr = 'تنبيه واستدراك فوري';
    gradeEn = 'Urgent Spiritual Triage & Reform';
    spiritualRating = 'Needs Immediate Reform';
  }

  const actionPlan10OutOf10: string[] = [];
  if (fardhPrayersScore < 2.45) {
    actionPlan10OutOf10.push(`+${(2.5 - fardhPrayersScore).toFixed(1)} pts: Protect all 35 weekly Farā'iḍ strictly on-time at first Adhan to eliminate delay penalties.`);
  }
  if (slipsRestraintScore < 1.95) {
    actionPlan10OutOf10.push(`+${(2.0 - slipsRestraintScore).toFixed(1)} pts: Forge protective behavioral Power Seals to eliminate recurring slips in ${topWeaknessCategories[0]?.category || 'weakness realms'}.`);
  }
  if (adhkarFortressScore < 1.45) {
    actionPlan10OutOf10.push(`+${(1.5 - adhkarFortressScore).toFixed(1)} pts: Seal both Morning and Evening Adhkār daily without missing a session.`);
  }
  if (sunnahQiyamScore < 1.45) {
    actionPlan10OutOf10.push(`+${(1.5 - sunnahQiyamScore).toFixed(1)} pts: Guard the 12 Sunan Rawātib and revive at least 2 Rak'ahs of Qiyām al-Layl & Witr nightly.`);
  }
  if (salawatScore < 0.95) {
    actionPlan10OutOf10.push(`+${(1.0 - salawatScore).toFixed(1)} pts: Fulfill the daily covenant of 70+ Salawāt upon Prophet Muhammad ﷺ.`);
  }
  if (kaffarahTawbahScore < 1.45 && pendingKaffarah > 0) {
    actionPlan10OutOf10.push(`+${(1.5 - kaffarahTawbahScore).toFixed(1)} pts: Settle and complete ${pendingKaffarah} pending Kaffārah / remedy quest(s).`);
  }
  if (actionPlan10OutOf10.length === 0) {
    actionPlan10OutOf10.push('Maintain steadfast consistency (Istiqāmah) across all obligations and preserve 10/10 Ihsanic status.');
  }

  const recommendations: string[] = [];
  if (prayersDelayedCount > 3 || prayersMissedCount > 7) {
    recommendations.push('Establish a strict 5-minute pre-Adhan alarm to protect mandatory prayer timing and eliminate delay penalties.');
  }
  if (adhkarSabahCount < 4 || adhkarMasaCount < 4) {
    recommendations.push('Fortify your spiritual shields: Commit to daily Morning & Evening Adhkar right after Fajr and Asr.');
  }
  if (topWeaknessCategories[0] && topWeaknessCategories[0].count > 0) {
    const topCat = topWeaknessCategories[0];
    recommendations.push(`Primary slip vulnerability detected in ${topCat.category} (${topCat.count} recorded lapses). Forge targeted Power Seals to construct behavioral boundaries.`);
  }
  if (qiyamTotalRakats < 4) {
    recommendations.push("Integrate at least 2 Rak'ahs of Qiyam al-Layl & Witr in the last third of the night for heightened clarity.");
  }
  if (recommendations.length === 0) {
    recommendations.push('Maintain steadfast consistency (Istiqāmah) across all obligations and continue proactive voluntary deeds.');
  }

  const weeklyScoreBreakdown: WeeklyScoreBreakdown = {
    fardhPrayersScore,
    slipsRestraintScore,
    adhkarFortressScore,
    sunnahQiyamScore,
    salawatScore,
    kaffarahTawbahScore,
    totalScore: totalWeeklyScore,
    gradeAr,
    gradeEn,
    actionPlan10OutOf10
  };

  const summaryReflection = `Weekly Muḥāsabah Audit (${startDate} → ${endDate}): Judged ${totalWeeklyScore}/10 [${gradeAr} — ${gradeEn}]. Completed Fardh prayers: ${prayersCount}/35 (${prayersOnTimeCount} on-time, ${prayersDelayedCount} delayed). Audited Slips: ${effectiveSlips.length}. Positive XP: +${totalEarnedXP} XP vs. Lost XP: −${totalLostXP} XP (Net: ${totalNetXP >= 0 ? '+' : ''}${totalNetXP} XP).`;

  const xpAnalytics = getXPAnalytics({
    xpHistory: state.xpHistory || [],
    systemDate: anchorDate,
    skills: state.skills || [],
    quests: state.quests || []
  });

  return {
    id: `weekly-summary-${anchorDate}-${Date.now()}`,
    generatedDate: anchorDate,
    weekLabel,
    startDate,
    endDate,
    totalNetXP,
    totalEarnedXP,
    totalLostXP,
    totalLostCoins,
    totalSlipsCount: effectiveSlips.length,
    prayersCount,
    prayersOnTimeCount,
    prayersDelayedCount,
    prayersMissedCount,
    sunnahRawatibCount,
    adhkarSabahCount,
    adhkarMasaCount,
    adhkarSleepDhohrCount,
    adhkarSleepNightCount,
    salawatTotal,
    qiyamTotalRakats,
    questsCompletedCount: questsCompletedInWeek,
    focusMinutesTotal,
    kaffarahSettledCount: settledKaffarah,
    kaffarahPendingCount: pendingKaffarah,
    topWeaknessCategories,
    spiritualRating,
    scoreOutOf10: totalWeeklyScore,
    weeklyScoreBreakdown,
    xpAnalytics,
    summaryReflection,
    recommendations,
    archivedAt: new Date().toISOString()
  };
}

/**
 * Result structure returned by reconcileMissedWeeks
 */
export interface ReconcileMissedWeeksResult {
  wasReconciled: boolean;
  missedSummaries: WeeklyMuhasabahSummary[];
  newLastResetDate: string | null;
  activeEntries: MuhasabahEntry[];
  summaryMessage: string;
}

/**
 * Reconciles missed weekly cycles.
 * 
 * Handles cases where:
 * 1. The user opened the app normally on Sunday.
 * 2. The user did not open the app on Sunday, but opened it later in the week (e.g., Monday or Wednesday).
 * 3. The user was inactive for 2 or more weeks, accumulating multiple unarchived weekly cycles.
 * 
 * Transactional behavior:
 * - Walks week by week in chronological order from lastResetDate to today.
 * - Generates exactly one WeeklyMuhasabahSummary per completed week.
 * - Filters entries so that each week's summary accurately reflects only that week's slips.
 * - Leaves only the current week's active entries in the active ledger.
 * - Never leaves gaps or drops historical slips into the void.
 */
export function reconcileMissedWeeks(
  state: POSState,
  currentSysDate: string
): ReconcileMissedWeeksResult {
  const today = parseDateSafe(currentSysDate);
  const currentWeek = getWeekBoundaries(today);
  const savedSummaries = state.savedWeeklySummaries || [];
  const existingSummaryDates = new Set(savedSummaries.map(s => s.generatedDate));

  // Quick exit if already reset on this exact date
  if (state.lastWeeklyMuhasabahResetDate && state.lastWeeklyMuhasabahResetDate === currentSysDate) {
    return {
      wasReconciled: false,
      missedSummaries: [],
      newLastResetDate: state.lastWeeklyMuhasabahResetDate,
      activeEntries: state.muhasabahEntries || [],
      summaryMessage: 'Already reconciled for current date.'
    };
  }

  // Determine starting point
  let lastResetDateStr = state.lastWeeklyMuhasabahResetDate;

  let cursorSundayStr: string;

  if (lastResetDateStr) {
    // If last reset date was already recorded, the previous cycle was completed on that date.
    // Therefore, the first potential unarchived Sunday is 7 days after lastResetDate.
    const prevSunday = parseDateSafe(lastResetDateStr);
    const prevDay = prevSunday.getDay();
    const alignedSunday = prevDay === 0 ? formatDateStr(prevSunday) : addDays(prevSunday, 7 - prevDay);
    cursorSundayStr = addDays(alignedSunday, 7);
  } else {
    // If no last reset date is recorded, check saved summaries
    if (savedSummaries.length > 0) {
      const sorted = [...savedSummaries].sort((a, b) => b.generatedDate.localeCompare(a.generatedDate));
      // The Sunday following that Friday is Friday + 2 days
      const followingSunday = addDays(sorted[0].generatedDate, 2);
      cursorSundayStr = addDays(followingSunday, 7);
    } else {
      // Find the earliest entry or spiritual log
      const dates: string[] = [];
      (state.muhasabahEntries || []).forEach(e => { if (e.date) dates.push(e.date); });
      Object.keys(state.spiritualLogs || {}).forEach(d => dates.push(d));

      if (dates.length > 0) {
        dates.sort();
        const earliestWeek = getWeekBoundaries(dates[0]);
        // The Sunday closing that earliest week is Friday + 2 days
        cursorSundayStr = addDays(earliestWeek.weekEnd, 2);
      } else {
        // Brand new state with no entries
        const day = today.getDay();
        const daysToSun = (7 - day) % 7;
        cursorSundayStr = addDays(today, daysToSun === 0 ? 7 : daysToSun);
      }
    }
  }

  const missedSummaries: WeeklyMuhasabahSummary[] = [];
  let latestResetDate = lastResetDateStr || cursorSundayStr;
  const todayStr = formatDateStr(today);

  // Iterate forward week-by-week as long as cursorSunday <= today
  // Cap at 52 weeks to prevent infinite loops in corrupted dates
  let loopCount = 0;
  while (cursorSundayStr <= todayStr && loopCount < 52) {
    loopCount++;
    const sundayStr = cursorSundayStr;
    const closingWeek = getClosingWeekBoundaries(cursorSundayStr);

    // Only archive if this week has ended and hasn't already been archived
    if (!existingSummaryDates.has(closingWeek.anchorDate)) {
      const summary = generateWeeklyMuhasabahSummaryPure(state, closingWeek.anchorDate);
      missedSummaries.push(summary);
      existingSummaryDates.add(closingWeek.anchorDate);
    }

    latestResetDate = sundayStr;

    // Advance to next Sunday
    cursorSundayStr = addDays(cursorSundayStr, 7);
  }

  if (missedSummaries.length === 0) {
    return {
      wasReconciled: false,
      missedSummaries: [],
      newLastResetDate: state.lastWeeklyMuhasabahResetDate || null,
      activeEntries: state.muhasabahEntries || [],
      summaryMessage: 'No missed weekly cycles detected. Ledger is up to date.'
    };
  }

  // Retain only entries belonging to the current active week
  const allEntries = state.muhasabahEntries || [];
  const activeEntries = allEntries.filter(e => {
    if (!e.date) return false;
    return e.date >= currentWeek.weekStart;
  });

  const summaryMessage = missedSummaries.length === 1
    ? `Weekly Muḥāsabah cycle archived for ${missedSummaries[0].weekLabel}. Active ledger reset clean.`
    : `Catch-up reconciliation completed: ${missedSummaries.length} weekly Muḥāsabah cycles archived across missed periods. Active ledger synchronized.`;

  return {
    wasReconciled: true,
    missedSummaries,
    newLastResetDate: latestResetDate,
    activeEntries,
    summaryMessage
  };
}
