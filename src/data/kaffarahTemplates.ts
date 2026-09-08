import { MuhasabahCategory } from '../types';

export type KaffarahType = 'Sadaqah' | 'Quran' | 'Prayer' | 'Detox' | 'Service' | 'Focus';

export interface KaffarahTemplate {
  title: string;
  type: KaffarahType;
  desc: string;
  xp: number;
  theologicalBasis: string;
  remedyAction: string;
}

/**
 * Canonical Sacred Kaffārah (Restitution / Penance) Registry
 * 
 * In Islamic ethics and spiritual psychology, each category of spiritual transgression (Zallah / Sayyi'ah)
 * has a direct therapeutic and expiatory counterweight (Hasanah that wipes it out, following the Hadith:
 * "وأتبع السيئة الحسنة تمحها" - 'Follow a bad deed with a good deed, it will wipe it out' [At-Tirmidhi]).
 * 
 * This registry defines the default targeted restorative deeds mapped to each of the 6 Muhasabah categories.
 */
export const DEFAULT_KAFFARAH_TEMPLATES: Record<MuhasabahCategory, KaffarahTemplate> = {
  Obligations: {
    title: "2 Rak'ahs of Tawbah & Surah Al-Mulk Recitation",
    type: 'Prayer',
    desc: 'Immediate spiritual re-alignment through sincere voluntary prayer (Salat at-Tawbah) and solemn Quranic recitation.',
    xp: 60,
    theologicalBasis: 'Hadith of Ali (ra): The Prophet ﷺ said: "There is no servant who commits a sin, then purifies himself well, then stands and prays two Rak\'ahs, then asks Allah for forgiveness, except that Allah forgives him." [Abu Dawud, Tirmidhi].',
    remedyAction: 'Perform Wudu with heightened presence, pray 2 heartfelt Rak\'ahs of Tawbah in solitude, and recite Surah Al-Mulk with tadabbur.'
  },
  Desires: {
    title: 'Dopamine Fast (45m Screen Detox) & $5 Sadaqah Charity',
    type: 'Detox',
    desc: 'Break appetite and impulse hooks through voluntary screen fasting and tangible monetary charity.',
    xp: 50,
    theologicalBasis: 'The Prophet ﷺ taught that charity extinguishes sin as water extinguishes fire ("الصدقة تطفئ الخطيئة كما يطفئ الماء النار" [Tirmidhi]). Fasting the senses tames the impulsive Nafs.',
    remedyAction: 'Disconnect from all screens and sensory dopamine for 45 minutes, and transfer a monetary charity (Sadaqah) immediately.'
  },
  Speech: {
    title: "100x Istighfār & Sincere Secret Du'a for Others",
    type: 'Quran',
    desc: 'Cleanse speech slips by uttering 100 sincere seekings of forgiveness and making heartfelt secret prayers for those spoken of.',
    xp: 45,
    theologicalBasis: 'Speech sins (backbiting, vanity, harsh words) burden the scales. The remedy is Istighfar, dhikr, and supplicating for the rights and elevation of others in the unseen ("دعوة المرء المسلم لأخيه بظهر الغيب مستجابة").',
    remedyAction: 'Recite 100x Astaghfirullah with reflective contrition, followed by a heartfelt secret supplication for the people involved.'
  },
  Heart: {
    title: 'Perform 1 Hidden Good Deed with Zero Broadcast',
    type: 'Service',
    desc: 'Purge vanity, jealousy, and spiritual pride (Riya\' / Kibr) by executing an intentional act of goodness known only to the Creator.',
    xp: 55,
    theologicalBasis: 'Hidden deeds (Khabī\'ah min \'amal salih) directly dismantle hypocrisy and pride, grounding sincerity (Ikhlās) back in the heart.',
    remedyAction: 'Execute a thoughtful act of kindness, anonymous donation, or secret service that nobody on earth will ever know about.'
  },
  Rights: {
    title: 'Direct Sincere Apology or Act of Service for Kin',
    type: 'Service',
    desc: 'Mend broken interpersonal ties through prompt humility, verbal apology, or a physical act of helpfulness.',
    xp: 50,
    theologicalBasis: 'Human rights (Huquq al-Ibad) require proactive reconciliation and restoration of honor before the Day of Judgment.',
    remedyAction: 'Promptly reach out with humility to acknowledge fault, ask for forgiveness, or perform an unprompted act of kindness for the affected party.'
  },
  'Wasted Potential': {
    title: 'Execute 1 Locked Deep Focus Sprint (25m)',
    type: 'Focus',
    desc: 'Shatter procrastination drift and negligence with a strictly monitored 25-minute single-task deep focus cycle.',
    xp: 60,
    theologicalBasis: 'Time is the capital of the human being (Surah Al-\'Asr). Sloth and distraction are remedied through resolute action and concentration lock.',
    remedyAction: 'Engage a zero-distraction 25-minute Pomodoro focus block dedicated entirely to high-impact purposeful work.'
  }
};
