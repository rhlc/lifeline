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

const MESSAGES: Record<MsgKey, string[]> = {
  morning: ['Uth ja beta, duniya jeetni hai.', 'Naya din, naya jugaad. Chalo shuru karein.'],
  streak7: ['7 din ho gaye — ab Sharma ji ka beta tu hai.', 'Saat din! Consistency ka tadka.'],
  missedGym: ['Pet kam hoga toh selfie acchi aayegi. Kal pakka?', 'Gym chhuti? Koi na, kal double.'],
  foodLost: ['Samosa ne dhoka diya? Koi baat nahi, kal salad.', 'Cheat day bhi zaroori hai, raja.'],
  scrollSlip: [
    'Reels dekh ke abs nahi bante. Phone neeche rakh, raja.',
    'Doom-scroll detected. Thoda saans le, phir kaam.',
  ],
  survivalUsed: [
    'Aaj bas survive kiya? Bilkul chalega. Zero nahi hai na — bas chalte raho.',
    'Survive mode on. Aaj itna kaafi hai. Kal phir milte hain.',
  ],
  lowMorale: ['Slow din hai? Saans le. Kal naya din.', 'Thoda slow chal raha hai? Theek hai. Aaj sirf saans le.'],
  month90: ['Aaj toh tu full sigma nikla. Biryani banta hai.', '90% paar! Inaam toh banta hai boss.'],
  onTrack: ['On track ho. Aise hi chalte raho.', 'Sab badhiya — steady jaa rahe ho.'],
  warn: ['Kuch gadbad hai. Koi na, chhoti shuruaat karo.', 'Thoda dhyaan de — par tension mat le.'],
  lockedIn: ['Lock ho gaya. Shabaash.', 'Aaj ka kaam done. Chai pi lo.'],
};

/** Pick a copy line for a key. Deterministic-ish rotation by day to avoid jitter. */
export function pick(key: string | null | undefined, seed = 0): string | null {
  if (!key || !(key in MESSAGES)) return null;
  const arr = MESSAGES[key as MsgKey];
  return arr[Math.abs(seed) % arr.length];
}

export type { MsgKey };
