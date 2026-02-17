const MAX_SEGMENTS = 10;

export type ParsedSegments = {
  items: string[];
  truncated: boolean;
};

export function parseSegmentLabels(raw: string): ParsedSegments {
  const tokens = raw
    .split(/[\n,]/g)
    .map((item) => item.trim())
    .filter(Boolean);

  const unique: string[] = [];
  const seen = new Set<string>();

  for (const token of tokens) {
    const key = token.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    unique.push(token);
  }

  return {
    items: unique.slice(0, MAX_SEGMENTS),
    truncated: unique.length > MAX_SEGMENTS,
  };
}

export function segmentLimit(): number {
  return MAX_SEGMENTS;
}
