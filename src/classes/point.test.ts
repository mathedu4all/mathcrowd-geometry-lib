import { Line } from './line'
import { matrix } from './matrix'
import { point, Point } from './point'
import { Segment } from './segment'
import { Vector } from './vector'

describe('Point', function () {
  it('May create new Point', function () {
    const point = new Point()
    expect(point).toBeInstanceOf(Point)
  })
  it('Default constructor creates new (0,0) point', function () {
    const point = new Point()
    expect(point).toEqual({ x: 0, y: 0 })
  })
  it('New point may be constructed by function call', function () {
    expect(point(1, 3)).toEqual({ x: 1, y: 3 })
  })
  it('New point may be constructed with array of two numbers', function () {
    expect(point([1, 3])).toEqual({ x: 1, y: 3 })
  })
  it('Method clone creates new instance of Point', function () {
    const point1 = new Point(2, 1)
    const point2 = point1.clone()
    expect(point2).toBeInstanceOf(Point)
    expect(point2).not.toBe(point1)
    expect(point2).toEqual(point1)
  })
  it('Method equalTo return true if points are equal', function () {
    const point = new Point()
    const zero = new Point(0, 0)
    const equals = point.equalTo(zero)
    expect(equals).toBe(true)
  })
  it('Method equalTo return true if points are equal up to DP_TOL tolerance', function () {
    const point1 = new Point(1, 1)
    const point2 = new Point(1, 1.000000999)
    const equals = point1.equalTo(point2)
    expect(equals).toBe(true)
  })
  it('Method translate returns new point translated by (dx, dy)', function () {
    const point = new Point(1, 1)
    const tpoint = point.translate(2, 0)
    expect(tpoint).toEqual({ x: 3, y: 1 })
  })
  it('Method rotates returns new point rotated by default around (0.0), counterclockwise', function () {
    const point = new Point(1, 1)
    const rotatedPoint = point.rotate(Math.PI / 2)
    const expectedPoint = new Point(-1, 1)
    const equals = rotatedPoint.equalTo(expectedPoint)
    expect(equals).toBe(true)
  })
  it('Method rotate returns new point rotated around center, counterclockwise', function () {
    const point = new Point(2, 1)
    const center = new Point(1, 1)
    const rotatedPoint = point.rotate(Math.PI / 2, center)
    const expectedPoint = new Point(1, 2)
    const equals = rotatedPoint.equalTo(expectedPoint)
    expect(equals).toBe(true)
  })
  it('Method translate returns new point translated by vector', function () {
    const point = new Point(1, 1)
    const v = new Vector(2, 0)
    const tpoint = point.translate(v)
    expect(tpoint).toEqual({ x: 3, y: 1 })
  })
  it('Can scale point with scale factor', function () {
    const point = new Point(2, 3)
    const scaledPoint = point.scale(2, 2)
    expect(scaledPoint).toEqual({ x: 4, y: 6 })
  })
  it('Method returns projection point on given line', function () {
    const anchor = new Point(1, 1)
    const norm = new Vector(0, 1)
    const line = new Line(anchor, norm)
    const pt = new Point(2, 2)
    const projectedPoint = pt.projectionOn(line)
    expect(projectedPoint).toEqual({ x: 2, y: 1 })
  })
  it('Method transform returns new point transformed by affine transformation matrix', function () {
    const pt = point(4, 1)
    const pc = point(1, 1)
    // Transform coordinate origin into point x,y, then rotate, then transform origin back
    const m = matrix()
      .translate(pc.x, pc.y)
      .rotate((3 * Math.PI) / 2)
      .translate(-pc.x, -pc.y)
    const transformedPoint = pt.transform(m)
    const expectedPoint = point(1, -2)
    expect(transformedPoint.equalTo(expectedPoint)).toBe(true)
  })
})

describe('Point.Distance methods', function () {
  it('Method distanceTo return distance to other point', function () {
    const point1 = new Point(1, 1)
    const point2 = new Point(2, 2)
    const [dist] = point1.distanceTo(point2)
    expect(dist).toEqual(Math.sqrt(2))
  })
  it('Method distanceTo calculates distance to given line', function () {
    const anchor = new Point(1, 1)
    const norm = new Vector(0, 1)
    const line = new Line(anchor, norm)
    const pt = new Point(2, 2)
    expect(pt.distanceTo(line)[0]).toEqual(1)
  })
  it('Method distanceTo returns distance to segment', function () {
    const ps = new Point(-2, 2)
    const pe = new Point(2, 2)
    const segment = new Segment(ps, pe)
    const pt1 = new Point(2, 4) /* point in segment scope */
    const pt2 = new Point(-5, 2) /* point is out of segment scope */
    const pt3 = new Point(6, 2) /* point is out of segment scope */
    expect(pt1.distanceTo(segment)[0]).toEqual(2)
    expect(pt2.distanceTo(segment)[0]).toEqual(3)
    expect(pt3.distanceTo(segment)[0]).toEqual(4)
  })
  //   it('Method distanceTo returns distance to circle', function () {
  //     const circle = new Circle(new Point(), 3)
  //     const pt1 = new Point(5, 0)
  //     const pt2 = new Point(0, 2)
  //     expect(pt1.distanceTo(circle)[0]).to.equal(2)
  //     expect(pt2.distanceTo(circle)[0]).to.equal(1)
  //   })
  //   it('Method distanceTo returns distance to arc', function () {
  //     const circle = new Circle(new Point(), 3)
  //     const arc = circle.toArc()
  //     const pt1 = new Point(5, 0)
  //     const pt2 = new Point(0, 2)
  //     expect(pt1.distanceTo(arc)[0]).to.equal(2)
  //     expect(pt2.distanceTo(arc)[0]).to.equal(1)
  //   })
  //   it('Method distanceTo returns distance to polygon', function () {
  //     const points = [
  //       point(100, 20),
  //       point(250, 75),
  //       point(350, 75),
  //       point(300, 270),
  //       point(170, 200),
  //       point(120, 350),
  //       point(70, 120)
  //     ]
  //     const poly = new Polygon()
  //     poly.addFace(points)
  //     const pt = point(300, 50)
  //     expect(pt.distanceTo(poly)[0]).to.equal(25)
  //   })
})
describe('Point.On inclusion queries', function () {
  it('Method "on" returns true if point checked with same points', function () {
    const pt = new Point(0, 1)
    expect(pt.on(pt.clone())).toEqual(true)
  })
  it('Method "on" returns true if point belongs to line', function () {
    const pt1 = new Point(1, 1)
    const pt2 = new Point(2, 2)
    const pt3 = new Point(3, 3)
    const line = new Line(pt1, pt2)
    expect(pt3.on(line)).toEqual(true)
  })
  //   it('Method "on" returns true if point belongs to circle', function () {
  //     const pt = new Point(0, 1)
  //     const circle = new Circle(new Point(0, 0), 2)
  //     expect(pt.on(circle)).to.equal(true)
  //   })
  it('Method "on" returns true if point belongs to segment', function () {
    const pt1 = new Point(1, 1)
    const pt2 = new Point(2, 2)
    const pt3 = new Point(3, 3)
    const segment = new Line(pt1, pt3)
    expect(pt2.on(segment)).toEqual(true)
  })
  //   it('Method "on" returns true if point belongs to arc', function () {
  //     const arc = new Arc(new Point(), 1, -Math.PI / 4, Math.PI / 4, false)
  //     const pt = new Point(-1, 0)
  //     expect(pt.on(arc)).to.equal(true)
  //   })
  //   it('Method "on" returns true if point belong to polygon', function () {
  //     const points = [
  //       point(100, 20),
  //       point(250, 75),
  //       point(350, 75),
  //       point(300, 270),
  //       point(170, 200),
  //       point(120, 350),
  //       point(70, 120)
  //     ]
  //     const poly = new Polygon()
  //     poly.addFace(points)
  //     poly.addFace([circle(point(175, 150), 30).toArc()])
  //     const pt1 = point(300, 50)
  //     const pt2 = point(50, 75)
  //     const pt3 = point(180, 160)
  //     const pt4 = point(140, 250)
  //     expect(pt1.on(poly)).to.equal(false)
  //     expect(pt2.on(poly)).to.equal(false)
  //     expect(pt3.on(poly)).to.equal(false)
  //     expect(pt4.on(poly)).to.equal(true)
  //   })
  // })
  it('Method leftTo returns true if point is on the "left" semi plane, which is the side of the normal vector', function () {
    const line = new Line(new Point(-1, -1), new Point(1, 1))
    const pt1 = new Point(-2, 2)
    const pt2 = new Point(3, 1)
    expect(pt1.leftTo(line)).toEqual(true)
    expect(pt2.leftTo(line)).toEqual(false)
  })
})
