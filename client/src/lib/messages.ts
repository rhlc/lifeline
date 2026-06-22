// Hinglish copy (spec §6). Funny on good-day slips, gentle on bad days.
// Humor never mocks failure.

type MsgKey =
  | 'morning'
  | 'streak7'
  | 'missedGym'
  | 'foodLost'
  | 'scrollSlip'
  | 'survivalUsed'
  | 'lowMorale'
  | 'month90'
  | 'onTrack'
  | 'warn'
  | 'lockedIn';

// all lowercase by convention (non-negotiable rule #1).
const MESSAGES: Record<MsgKey, string[]> = {
  morning: ['uth ja beta, duniya jeetni hai.', 'naya din, naya jugaad. chalo shuru karein.'],
  streak7: ['7 din ho gaye — ab sharma ji ka beta tu hai.', 'saat din! consistency ka tadka.'],
  missedGym: ['pet kam hoga toh selfie acchi aayegi. kal pakka?', 'gym chhuti? koi na, kal double.'],
  foodLost: ['samosa ne dhoka diya? koi baat nahi, kal salad.', 'cheat day bhi zaroori hai, raja.'],
  scrollSlip: [
    'reels nahi, abs. phone neeche rakh, raja.',
    'doom-scroll detected. thoda saans le, phir kaam.',
  ],
  survivalUsed: [
    'aaj bas survive kiya? bilkul chalega. zero nahi hai na — bas chalte raho.',
    'survive mode on. aaj itna kaafi hai. kal phir milte hain.',
  ],
  lowMorale: ['slow din hai? saans le. kal naya din.', 'thoda slow chal raha hai? theek hai. aaj sirf saans le.'],
  month90: ['aaj toh tu full sigma nikla. biryani banta hai.', '90% paar! inaam toh banta hai boss.'],
  onTrack: ['on track. aise hi chalte raho.', 'sab badhiya — steady jaa rahe ho.'],
  warn: ['kuch gadbad hai. koi na, chhoti shuruaat karo.', 'thoda dhyaan de — par tension mat le.'],
  lockedIn: ['lock ho gaya. shabaash.', 'aaj ka kaam done. chai pi lo.'],
};

/** Pick a copy line for a key. Deterministic-ish rotation by day to avoid jitter. */
export function pick(key: string | null | undefined, seed = 0): string | null {
  if (!key || !(key in MESSAGES)) return null;
  const arr = MESSAGES[key as MsgKey];
  return arr[Math.abs(seed) % arr.length];
}

export type { MsgKey };
