// @ts-nocheck
export type LabelOverride = {
  mode: 'rel' | 'abs'; // rel: نسبت به نقطه (dx,dy) — abs: مختصات مطلق (x,y)
  dx?: number;
  dy?: number;
  x?: number;
  y?: number;
};

// نکته: می‌تونی کلید رو id یا name بذاری (ترجیحاً id که یکتاست)
export const labelOverrides: Record<string, LabelOverride> = {
  // نمونه‌ها (بعداً خودت پرش کن):
  // "digital-twin-id": { mode: 'rel', dx: 18, dy: -10 },
  // "Digital twin":    { mode: 'rel', dx: 18, dy: -10 },

  
  "1": {
    "mode": "rel",
    "dx": -4,
    "dy": 17
  },
  "2": {
    "mode": "rel",
    "dx": -117,
    "dy": 1
  },
  "3": {
    "mode": "rel",
    "dx": 24,
    "dy": 18
  },
  "4": {
    "mode": "rel",
    "dx": -50,
    "dy": 17
  },
  "5": {
    "mode": "rel",
    "dx": 9,
    "dy": 15
  },
  "6": {
    "mode": "rel",
    "dx": -11,
    "dy": 15
  },
  "7": {
    "mode": "rel",
    "dx": 30,
    "dy": 11
  },
  "8": {
    "mode": "rel",
    "dx": 52,
    "dy": 19
  },
  "9": {
    "mode": "rel",
    "dx": -57,
    "dy": 10
  },
  "10": {
    "mode": "rel",
    "dx": 24,
    "dy": -16
  },
  "11": {
    "mode": "rel",
    "dx": -1,
    "dy": -17
  },
  "12": {
    "mode": "rel",
    "dx": 36,
    "dy": 17
  },
  "13": {
    "mode": "rel",
    "dx": 72,
    "dy": 14
  },
  "14": {
    "mode": "rel",
    "dx": 67,
    "dy": 3
  },
  "15": {
    "mode": "rel",
    "dx": -59,
    "dy": -12
  },
  "16": {
    "mode": "rel",
    "dx": -59,
    "dy": -2
  },
  "17": {
    "mode": "rel",
    "dx": 47,
    "dy": 1
  },
  "18": {
    "mode": "rel",
    "dx": -72,
    "dy": 9
  },
  "19": {
    "mode": "rel",
    "dx": -71,
    "dy": 1
  },
  "20": {
    "mode": "rel",
    "dx": 49,
    "dy": -17
  },
  "21": {
    "mode": "rel",
    "dx": 122,
    "dy": -2
  },
  "22": {
    "mode": "rel",
    "dx": 5,
    "dy": -17
  },
  "23": {
    "mode": "rel",
    "dx": -62,
    "dy": 10
  },
  "24": {
    "mode": "rel",
    "dx": 45,
    "dy": 13
  },
  "25": {
    "mode": "rel",
    "dx": -28,
    "dy": 13
  },
  "26": {
    "mode": "rel",
    "dx": -50,
    "dy": 1
  },
  "27": {
    "mode": "rel",
    "dx": 71,
    "dy": 10
  }

};
