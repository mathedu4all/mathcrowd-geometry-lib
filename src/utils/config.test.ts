import { Point, Vector, Line, Utils, Config } from '../index'

describe('#DP_TOL', function () {
  it('Default tolerace of 0.000001', function () {
    expect(Config.DP_TOL).toBe(0.000001)
  })
  it('Change tolerance with Config.DP_TOL', function () {
    const tolerance = 1e-3
    Config.DP_TOL = tolerance
    expect(Config.DP_TOL).toBe(tolerance)
    expect(Utils.getTolerance()).toBe(tolerance)
  })
  it('Check point equal after change tolerance with DP_TOL', function () {
    const tolerance = 1e-3
    Config.DP_TOL = tolerance
    expect(Config.DP_TOL).toBe(tolerance)

    const a = new Point(0, 0)
    const b = new Point(1e-4, 1e-4)
    expect(a.equalTo(b)).toBe(true)
  })
  it('Line.incidentTo with default tolerance value', function () {
    const norm = new Vector(0, 1)
    const lineA = new Line(new Point(0, 0), norm)
    const lineB = new Line(new Point(1e-8, 1e-8), norm)
    const lineC = new Line(new Point(1e-3, 1e-3), norm)
    expect(lineA.incidentTo(lineB)).toBe(true)
    expect(lineA.incidentTo(lineC)).toBe(false)
  })
  it('Line.incidentTo with new tolerance value', function () {
    Config.DP_TOL = 0.001
    const norm = new Vector(0, 1)
    const lineA = new Line(new Point(0, 0), norm)
    const lineB = new Line(new Point(0.00001, 0.00001), norm)
    const lineC = new Line(new Point(0, 0.002), norm)
    expect(lineA.incidentTo(lineB)).toBe(true)
    expect(lineA.incidentTo(lineC)).toBe(false)
  })
})
