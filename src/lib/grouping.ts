export interface Student {
  id: string;
  name: string;
  personality: 'E' | 'I';
}

/**
 * Balance groups by E/I personality type.
 * Tries to keep E/I ratio as equal as possible in each group.
 */
export function balanceGrouping(students: Student[], groupSize: number): Student[][] {
  const extroverts = students.filter((s) => s.personality === 'E');
  const introverts = students.filter((s) => s.personality === 'I');

  const groups: Student[][] = [];
  let eIdx = 0;
  let iIdx = 0;

  while (eIdx < extroverts.length || iIdx < introverts.length) {
    const group: Student[] = [];
    const eTarget = Math.ceil(groupSize / 2);

    // Fill E slots first (up to eTarget), then I slots
    while (group.length < groupSize && (eIdx < extroverts.length || iIdx < introverts.length)) {
      const eInGroup = group.filter((s) => s.personality === 'E').length;
      if (eIdx < extroverts.length && eInGroup < eTarget) {
        group.push(extroverts[eIdx++]);
      } else if (iIdx < introverts.length) {
        group.push(introverts[iIdx++]);
      } else if (eIdx < extroverts.length) {
        group.push(extroverts[eIdx++]);
      }
    }

    if (group.length > 0) {
      groups.push(group);
    }
  }

  return groups;
}

/**
 * Shuffle an array in place (Fisher-Yates algorithm).
 */
export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
