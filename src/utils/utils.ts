/**
 * Floating point comparison tolerance.
 * Default value is 0.000001 (10e-6)
 */
let DP_TOL: number = 0.000001

/**
 * Set new floating point comparison tolerance
 * @param tolerance
 */
export function setTolerance(tolerance: number): void {
  DP_TOL = tolerance
}

/**
 * Get floating point comparison tolerance
 * @returns
 */
export function getTolerance(): number {
  return DP_TOL
}

export const DECIMALS: number = 3

/**
 * Returns *true* if value comparable to zero
 * @param x
 * @returns
 */
export function EQ_0(x: number): boolean {
  return x < DP_TOL && x > -DP_TOL
}

/**
 * Returns *true* if two values are equal up to DP_TOL
 * @param x
 * @param y
 * @returns
 */
export function EQ(x: number, y: number): boolean {
  return x - y < DP_TOL && x - y > -DP_TOL
}

/**
 * Returns *true* if first argument greater than second argument up to DP_TOL
 * @param x
 * @param y
 * @returns
 */
export function GT(x: number, y: number): boolean {
  return x - y > DP_TOL
}

/**
 * Returns *true* if first argument greater than or equal to second argument up to DP_TOL
 * @param x
 * @param y
 * @returns
 */
export function GE(x: number, y: number): boolean {
  return x - y > -DP_TOL
}

/**
 * Returns *true* if first argument less than second argument up to DP_TOL
 * @param x
 * @param y
 * @returns
 */
export function LT(x: number, y: number): boolean {
  return x - y < -DP_TOL
}

/**
 * Returns *true* if first argument less than or equal to second argument up to DP_TOL
 * @param x
 * @param y
 * @returns
 */
export function LE(x: number, y: number): boolean {
  return x - y < DP_TOL
}
