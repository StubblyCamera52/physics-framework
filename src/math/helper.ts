/**
 * Returns a number whose value is limited to the given range.
 *
 * @param {Number} value The initial value.
 * @param {Number} min The lower boundary.
 * @param {Number} max The upper boundary.
 * @returns {Number} A number in the range [min, max].
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};