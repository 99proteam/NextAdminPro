/**
 * Deterministic pseudo-random helpers. Mock data is generated from a fixed
 * seed so server and client renders always match and screenshots stay stable.
 */
export function createRng(seed: number) {
  let s = seed >>> 0;
  const next = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (min: number, max: number) => Math.floor(next() * (max - min + 1)) + min,
    float: (min: number, max: number, digits = 2) => Number((next() * (max - min) + min).toFixed(digits)),
    pick: <T,>(arr: readonly T[]): T => arr[Math.floor(next() * arr.length)],
    weighted: <T,>(entries: readonly (readonly [T, number])[]): T => {
      const total = entries.reduce((a, [, w]) => a + w, 0);
      let r = next() * total;
      for (const [v, w] of entries) {
        if ((r -= w) <= 0) return v;
      }
      return entries[entries.length - 1][0];
    },
    sample: <T,>(arr: readonly T[], n: number): T[] => {
      const copy = [...arr];
      const out: T[] = [];
      while (out.length < n && copy.length) out.push(copy.splice(Math.floor(next() * copy.length), 1)[0]);
      return out;
    },
  };
}

/** Fixed "today" for the demo dataset. Replace with `new Date()` once wired to a real API. */
export const NOW = Date.UTC(2026, 9, 15, 12, 0, 0);
export const DAY = 86_400_000;

export const daysAgo = (d: number, rng?: { next: () => number }) =>
  new Date(NOW - d * DAY - Math.floor((rng?.next() ?? 0) * DAY)).toISOString();

export const firstNames = ["Olivia", "Liam", "Emma", "Noah", "Ava", "Elijah", "Sophia", "Mateo", "Isabella", "Lucas", "Mia", "Ethan", "Amelia", "James", "Harper", "Aarav", "Priya", "Kenji", "Yuki", "Fatima", "Omar", "Chloe", "Diego", "Sofia", "Hana", "Leo", "Zara", "Ravi", "Ana", "Jonas", "Nora", "Felix", "Maya", "Ibrahim", "Elena", "Kai", "Lina", "Arjun", "Grace", "Tomás"];
export const lastNames = ["Smith", "Johnson", "Garcia", "Martinez", "Brown", "Lee", "Patel", "Kim", "Nguyen", "Silva", "Müller", "Rossi", "Tanaka", "Khan", "Cohen", "Dubois", "Novak", "Hansen", "Okafor", "Ahmed", "Larsen", "Costa", "Ivanova", "Sato", "Mehta", "Walker", "Young", "Reyes", "Fischer", "Moreau"];
export const companies = ["Acme Inc.", "Globex", "Initech", "Umbrella Co.", "Hooli", "Stark Industries", "Wayne Enterprises", "Soylent", "Vandelay", "Pied Piper", "Cyberdyne", "Wonka Labs", "Aperture", "Tyrell Corp", "Massive Dynamic", "Northwind", "Contoso", "Fabrikam", "Bluth Co.", "Dunder Mifflin"];
export const locations: [string, string][] = [["United States", "New York"], ["United States", "Austin"], ["United Kingdom", "London"], ["Germany", "Berlin"], ["India", "Bengaluru"], ["India", "Mumbai"], ["Japan", "Tokyo"], ["Brazil", "São Paulo"], ["Canada", "Toronto"], ["France", "Paris"], ["Australia", "Sydney"], ["Spain", "Madrid"], ["Netherlands", "Amsterdam"], ["UAE", "Dubai"], ["Singapore", "Singapore"]];
