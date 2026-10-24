import { test } from "node:test";
import assert from "node:assert/strict";
import {
  transitionProgress,
  damp,
  createTimeline,
  frameAt,
  particlePosition,
} from "../web/story-motion.mjs";

test("the first and last fifth are exact resting plateaus", () => {
  for (const p of [0, 0.05, 0.1, 0.2]) assert.equal(transitionProgress(p), 0);
  for (const p of [0.8, 0.9, 1]) assert.equal(transitionProgress(p), 1);
  assert.ok(Math.abs(transitionProgress(0.5) - 0.5) < 1e-12);
  let previous = 0;
  for (let n = 0; n <= 100; n++) {
    const value = transitionProgress(n / 100);
    assert.ok(value >= previous);
    previous = value;
  }
});
test("damping has the same response across refresh rates without overshooting", () => {
  let at60 = 0,
    at120 = 0;
  for (let i = 0; i < 60; i++) at60 = damp(at60, 1, 1 / 60);
  for (let i = 0; i < 120; i++) at120 = damp(at120, 1, 1 / 120);
  assert.ok(Math.abs(at60 - at120) < 1e-12);
  assert.ok(at60 > 0 && at60 < 1);
  assert.equal(damp(0.5, 1, 0), 0.5);
});
test("long screens get reading distance before their handover", () => {
  const timeline = createTimeline([300, 0, 450, 0, 100], 800);
  assert.equal(frameAt(150, timeline).offset, 150);
  assert.equal(frameAt(299, timeline).from, 0);
  assert.equal(frameAt(300, timeline).morph, 0);
  assert.equal(frameAt(300 + timeline.distance * 0.9, timeline).morph, 1);
  const third = timeline.scenes[2];
  assert.equal(frameAt(third.start + 200, timeline).offset, 200);
  assert.equal(frameAt(timeline.total + 100, timeline).active, 4);
  assert.equal(frameAt(timeline.total + 100, timeline).offset, 100);
});
test("every scene has one unambiguous incoming and outgoing boundary", () => {
  const timeline = createTimeline([0, 0, 0, 0, 0], 960);
  timeline.scenes.forEach((scene, index) => {
    assert.equal(frameAt(scene.start, timeline).active, index);
    if (index < 4) {
      assert.equal(
        frameAt(scene.start + timeline.distance * 0.1, timeline).active,
        index,
      );
      assert.equal(
        frameAt(scene.start + timeline.distance * 0.9, timeline).active,
        index + 1,
      );
    }
  });
});
test("particle endpoints and reverse frames are deterministic", () => {
  const a = { x: 700, y: 300 },
    b = { x: 180, y: 470 };
  const first = particlePosition(a, b, 0, 0.7),
    last = particlePosition(a, b, 1, 0.7);
  assert.deepEqual(first, { ...a, travel: 0 });
  assert.ok(Math.abs(last.x - b.x) < 1e-10 && Math.abs(last.y - b.y) < 1e-10);
  const mid = particlePosition(a, b, 0.5, 0.7);
  particlePosition(a, b, 0.9, 0.7);
  assert.deepEqual(particlePosition(a, b, 0.5, 0.7), mid);
});

test("ambient glints stay local while scroll resting plateaus remain exact", async () => {
  const { ambientParticle } = await import("../web/story-motion.mjs");
  for (const seed of [0.1, 0.6, 0.95])
    for (const time of [0, 500, 5000, 60000]) {
      const glint = ambientParticle(seed, time);
      assert.ok(Math.abs(glint.x) <= 7 && Math.abs(glint.y) <= 4.9);
      assert.ok(glint.alpha >= 0.25 && glint.alpha <= 0.9);
      assert.equal(transitionProgress(0.1), 0);
      assert.equal(transitionProgress(0.9), 1);
    }
  assert.notDeepEqual(ambientParticle(0.6, 0), ambientParticle(0.6, 1000));
});
