/** A parsed LRC line: time in milliseconds + text. */
export type LrcLine = { timeMs: number; text: string };

const TIME_TAG = /\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]/g;

/** Parse an LRC string into sorted timed lines. Skips metadata tags. */
export function parseLRC(input: string): LrcLine[] {
  const lines: LrcLine[] = [];
  for (const raw of input.split(/\r?\n/)) {
    const text = raw.replace(TIME_TAG, "").trim();
    // skip empty lines and metadata tags like [ti:...], [ar:...]
    if (!text) continue;
    if (/^\[[a-z]{2}:/i.test(raw.trim()) && !/\[\d/.test(raw)) continue;

    let match: RegExpExecArray | null;
    TIME_TAG.lastIndex = 0;
    const times: number[] = [];
    while ((match = TIME_TAG.exec(raw)) !== null) {
      const minutes = Number(match[1]);
      const seconds = Number(match[2]);
      const fraction = match[3] ? Number(match[3].padEnd(3, "0")) : 0;
      times.push(minutes * 60 * 1000 + seconds * 1000 + fraction);
    }
    for (const timeMs of times) {
      lines.push({ timeMs, text });
    }
  }
  lines.sort((a, b) => a.timeMs - b.timeMs);
  return lines;
}
