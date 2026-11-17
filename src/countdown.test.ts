import assert from "node:assert/strict";
import test from "node:test";
import { getCountdownParts } from "./countdown.ts";
import { invitationConfig } from "./invitationConfig.ts";

const wedding = invitationConfig.celebrations.find(event => event.id === "wedding")!;
const target = Date.parse(invitationConfig.countdownTarget);

test("Nikah is 5 December 2026, 1 p.m. IST", () => {
  assert.equal(new Date(Date.parse(wedding.start)).toISOString(), "2026-12-05T07:30:00.000Z");
});

test("countdown targets the Nikah time in India", () => {
  assert.equal(new Date(target).toISOString(), "2026-12-05T07:30:00.000Z");
});

test("counts down across November and December in IST", () => {
  assert.deepEqual(getCountdownParts(target, Date.parse("2026-11-13T14:26:50+05:30")), {
    days: 21, hours: 22, minutes: 33, seconds: 10, complete: false,
  });
});

test("equivalent international clock readings give the same countdown", () => {
  const ist = Date.parse("2026-12-04T13:00:00+05:30");
  const utc = Date.parse("2026-12-04T07:30:00Z");
  const newYork = Date.parse("2026-12-04T02:30:00-05:00");
  const expected = { days: 1, hours: 0, minutes: 0, seconds: 0, complete: false };
  for (const now of [ist, utc, newYork]) assert.deepEqual(getCountdownParts(target, now), expected);
});

test("midnight on the Nikah date leaves thirteen hours", () => {
  assert.deepEqual(getCountdownParts(target, Date.parse("2026-12-05T00:00:00+05:30")), {
    days: 0, hours: 13, minutes: 0, seconds: 0, complete: false,
  });
});

test("does not finish a fraction of a second before Nikah", () => {
  assert.deepEqual(getCountdownParts(target, target - 1), {
    days: 0, hours: 0, minutes: 0, seconds: 1, complete: false,
  });
});

test("finishes on the wedding date and never shows negative values", () => {
  for (const now of [target, target + 86400000]) {
    assert.deepEqual(getCountdownParts(target, now), {
      days: 0, hours: 0, minutes: 0, seconds: 0, complete: true,
    });
  }
});

test("updates days, hours, minutes and seconds as the current time advances", () => {
  assert.deepEqual(getCountdownParts(target, target - 86401000), {
    days: 1, hours: 0, minutes: 0, seconds: 1, complete: false,
  });
  assert.deepEqual(getCountdownParts(target, target - 86400000), {
    days: 1, hours: 0, minutes: 0, seconds: 0, complete: false,
  });
  assert.deepEqual(getCountdownParts(target, target - 86399000), {
    days: 0, hours: 23, minutes: 59, seconds: 59, complete: false,
  });
});
