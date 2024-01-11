import { Utils } from '..'

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
