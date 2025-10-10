import { getUserIds, isLeapYear } from "./common.mjs";
import { calculateRevisionDates, formatDateWithSuffix } from "./script.mjs";

import assert from "node:assert";
import test from "node:test";

test("User count is correct", () => {
  assert.equal(getUserIds().length, 5);
});

test("getUserIds returns exactly 5 users", () => {
  const ids = getUserIds();
  assert.ok(Array.isArray(ids));
  assert.strictEqual(ids.length, 5);
  assert.deepStrictEqual(ids, ["1", "2", "3", "4", "5"]);
});

test("calculateRevisionDates returns correct intervals", () => {
  const startDate = new Date("2024-01-01");
  const revisions = calculateRevisionDates(
    startDate.toISOString().split("T")[0]
  );

  assert.strictEqual(revisions.length, 5, "Should return 5 revision dates");

  // Test  +1 week
  const oneWeekLater = new Date(startDate);
  oneWeekLater.setDate(oneWeekLater.getDate() + 7);
  assert.strictEqual(revisions[0].toDateString(), oneWeekLater.toDateString());
});

test("isLeapYear: core Gregorian cases", () => {
  assert.strictEqual(
    isLeapYear(2000),
    true,
    "2000 is divisible by 400 → leap year"
  );
  assert.strictEqual(
    isLeapYear(1900),
    false,
    "1900 is divisible by 100 but not 400 → not a leap year"
  );
  assert.strictEqual(
    isLeapYear(2024),
    true,
    "2024 is divisible by 4 → leap year"
  );
  assert.strictEqual(
    isLeapYear(2023),
    false,
    "2023 is not divisible by 4 → not a leap year"
  );
  assert.strictEqual(
    isLeapYear(2100),
    false,
    "2100 is divisible by 100 but not 400 → not a leap year"
  );
  assert.strictEqual(
    isLeapYear(2400),
    true,
    "2400 is divisible by 400 → leap year"
  );
});

test("Date behaviour for 29 February", () => {
  // In a leap year 29 Feb exists
  const d1 = new Date(2024, 1, 29); // 29 Feb 2024
  assert.strictEqual(d1.getMonth(), 1);
  assert.strictEqual(d1.getDate(), 29);

  // In a non-leap year 29 Feb overflows into March
  const d2 = new Date(2025, 1, 29); // → 1 Mar 2025
  assert.strictEqual(d2.getMonth(), 2);
  assert.strictEqual(d2.getDate(), 1);
});

test("formatDateWithSuffix returns correct ordinal suffixes", () => {
  // 1st, 2nd, 3rd, 4th, 11th, 12th, 13th, 21st, 22nd, 23rd
  const testCases = [
    { date: new Date("2024-01-01"), expected: "1st January 2024" },
    { date: new Date("2024-01-02"), expected: "2nd January 2024" },
    { date: new Date("2024-01-03"), expected: "3rd January 2024" },
    { date: new Date("2024-01-04"), expected: "4th January 2024" },
    { date: new Date("2024-01-11"), expected: "11th January 2024" },
    { date: new Date("2024-01-12"), expected: "12th January 2024" },
    { date: new Date("2024-01-13"), expected: "13th January 2024" },
    { date: new Date("2024-01-21"), expected: "21st January 2024" },
    { date: new Date("2024-01-22"), expected: "22nd January 2024" },
    { date: new Date("2024-01-23"), expected: "23rd January 2024" },
  ];

  testCases.forEach(({ date, expected }) => {
    assert.strictEqual(formatDateWithSuffix(date), expected);
  });
});

test("calculateRevisionDates handles 31 January 2026 correctly", () => {
  const startDate = new Date("2026-01-31");
  const revisions = calculateRevisionDates(
    startDate.toISOString().split("T")[0]
  );

  // Test +1 month (should be 28 February 2026)
  const oneMonthLater = revisions[1];
  assert.strictEqual(oneMonthLater.getFullYear(), 2026);
  assert.strictEqual(oneMonthLater.getMonth(), 1); // February (month 1) ✓
  assert.strictEqual(oneMonthLater.getDate(), 28); // 28 February

  // test +3 month (should be  30 april 2026)
  const threeMonthsLater = revisions[2];
  assert.strictEqual(threeMonthsLater.getFullYear(), 2026);
  assert.strictEqual(threeMonthsLater.getMonth(), 3); // april (month 3) ✓
  assert.strictEqual(threeMonthsLater.getDate(), 30); // 30 april
});
