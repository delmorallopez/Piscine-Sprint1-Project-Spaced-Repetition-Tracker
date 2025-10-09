export function getUserIds() {
  return ["1", "2", "3", "4", "5"];
}

export function isLeapYear(year) {
  if (typeof year !== "number" || !Number.isInteger(year)) {
    throw new TypeError("year must be an integer");
  }
  // Gregorian rule:
  // divisible by 400 -> leap year
  // divisible by 100 -> not a leap year
  // divisible by 4   -> leap year
  return year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0);
}
