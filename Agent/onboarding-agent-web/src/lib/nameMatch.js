const normalizeName = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')

/** @returns {number} 0–1 similarity score */
export function nameSimilarity(a, b) {
  const left = normalizeName(a)
  const right = normalizeName(b)
  if (!left || !right) return 0
  if (left === right) return 1
  const leftParts = new Set(left.split(' '))
  const rightParts = new Set(right.split(' '))
  let overlap = 0
  for (const part of leftParts) {
    if (rightParts.has(part)) overlap += 1
  }
  return overlap / Math.max(leftParts.size, rightParts.size)
}

export function holderMatchesExpected(holder, expected) {
  if (!holder?.trim() || !expected?.trim()) return null
  return nameSimilarity(holder, expected) >= 0.6
}
