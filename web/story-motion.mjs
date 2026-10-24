export const clamp = (value, low = 0, high = 1) =>
  Math.min(high, Math.max(low, value));
export const smooth = (value) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};
export const between = (a, b, value) => smooth((value - a) / (b - a));

// Each handover holds the old scene for 20%, morphs for 60%, then holds the new one.
export const transitionProgress = (raw) => between(0.2, 0.8, raw);
export const damp = (current, target, seconds, response = 12) =>
  current + (target - current) * -Math.expm1(-response * Math.max(0, seconds));

export function createTimeline(readRanges, height) {
  let cursor = 0;
  const distance = Math.max(600, height * 1.45);
  const scenes = readRanges.map((range, index) => {
    const start = cursor;
    const read = Math.max(0, range);
    const transitionStart = start + read;
    const end =
      transitionStart + (index < readRanges.length - 1 ? distance : 0);
    cursor = end;
    return { start, read, transitionStart, end };
  });
  return { scenes, distance, total: cursor + height * 0.24 };
}
export function frameAt(position, timeline) {
  const y = Math.max(0, position);
  const last = timeline.scenes.length - 1;
  for (let i = 0; i <= last; i++) {
    const scene = timeline.scenes[i];
    if (y < scene.transitionStart || i === last) {
      return {
        from: i,
        to: i,
        raw: 0,
        morph: 0,
        offset: clamp(y - scene.start, 0, scene.read),
        active: i,
      };
    }
    if (y < scene.end) {
      const raw = clamp((y - scene.transitionStart) / timeline.distance);
      const morph = transitionProgress(raw);
      return {
        from: i,
        to: i + 1,
        raw,
        morph,
        offset: scene.read,
        active: morph >= 0.5 ? i + 1 : i,
      };
    }
  }
}

// Spatial identity depends on the scroll frame, never elapsed time: reversing retraces exactly.
export function particlePosition(source, destination, progress, seed) {
  const travel = between(0.06 + seed * 0.08, 0.87 + seed * 0.07, progress);
  const arc = Math.sin(travel * Math.PI);
  return {
    x:
      source.x + (destination.x - source.x) * travel + arc * (seed - 0.5) * 150,
    y:
      source.y +
      (destination.y - source.y) * travel -
      arc * (30 + Math.sin(seed * 17) * 70),
    travel,
  };
}

// Local glints keep a resting graphic alive; the chapter's geometry never moves.
export function ambientParticle(seed, milliseconds) {
  const time = milliseconds / 1000;
  const radius = seed > 0.91 ? 7 : 2.5;
  return {
    x: Math.sin(time * 0.48 + seed * 37) * radius,
    y: Math.cos(time * 0.37 + seed * 23) * radius * 0.7,
    alpha: 0.25 + 0.65 * (0.5 + 0.5 * Math.sin(time * 1.1 + seed * 29)),
  };
}
