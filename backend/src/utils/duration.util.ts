const UNIT_TO_SECONDS: Record<string, number> = {
  s: 1,
  m: 60,
  h: 3600,
  d: 86400,
};

/**
 * Converts a duration string such as "15m", "7d", "30s", "1h", or a plain
 * number of seconds ("3600") into a number of seconds. Used to keep JWT
 * `expiresIn` and cookie `maxAge` derived from the same env-configured
 * value instead of maintaining separate hardcoded durations.
 */
export function parseDurationToSeconds(duration: string): number {
  const trimmed = duration.trim();
  const match = /^(\d+)\s*(s|m|h|d)$/i.exec(trimmed);

  if (match) {
    const amountStr = match[1];
    const unitStr = match[2];

    if (amountStr !== undefined && unitStr !== undefined) {
      const unitSeconds = UNIT_TO_SECONDS[unitStr.toLowerCase()];
      if (unitSeconds !== undefined) {
        return Number(amountStr) * unitSeconds;
      }
    }
  }

  const asNumber = Number(trimmed);
  if (trimmed.length > 0 && !Number.isNaN(asNumber)) {
    return asNumber;
  }

  throw new Error(
    `Invalid duration format: "${duration}". Expected formats like "15m", "7d", or a plain number of seconds.`,
  );
}
