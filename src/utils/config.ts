import { Utils } from '..'

/**
 * Config Object supporting read and write.
 * @link Config
 * @example
 * ```js
 * // Get the current tolerance
 * const tol = Config.DP_TOL
 * // Set the tolerance to 0.00001
 * Config.DP_TOL = 0.00001
 * ```
 */
const Config: {
  DP_TOL: number
} = {
  DP_TOL: 0.000001
}

Object.defineProperty(Config, 'DP_TOL', {
  get: function () {
    return Utils.getTolerance()
  },
  set: function (tol) {
    Utils.setTolerance(tol)
  }
})

export { Config }
