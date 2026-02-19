export function getSetDifference<T>(set1: Set<T>, set2: Set<T>): Set<T> {
  const difference = new Set<T>();

  for (const item of set2) {
    if (!set1.has(item)) {
      difference.add(item);
    }
  }

  return difference;
}
