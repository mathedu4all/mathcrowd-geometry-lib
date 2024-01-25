import {
  Box,
  Point,
  Vector,
  Line,
  // Circle,
  // Arc,
  // Polygon,
  line,
  point,
  vector,
  Circle,
  Arc,
  ray,
  Ray,
  Polygon
} from '../index'
import { CCW } from '../utils/constants'

describe('Line', function () {
  it('May create new instance of Line', function () {
    const line = new Line()
    expect(line).toBeInstanceOf(Line)
  })
  it('Default constructor creates new line that is equal to axe x', function () {
    const line = new Line()
    expect(line.pt).toEqual({ x: 0, y: 0 })
    expect(line.norm).toEqual({ x: 0, y: 1 })
  })
  it('Constructor Line(pt1, pt2) creates line that passes through two points', function () {
    const pt1 = new Point(1, 1)
    const pt2 = new Point(2, 2)
    const line = new Line(pt1, pt2)
    expect(pt1.on(line)).toBe(true)
    expect(pt2.on(line)).toBe(true)
  })
  it('Constructor Line(pt, norm) creates same line as Line(norm,pt)', function () {
    const pt = new Point(1, 1)
    const norm = new Vector(-1, 1)
    const line1 = new Line(pt, norm)
    const line2 = new Line(norm, pt)
    expect(line1.pt).toEqual(line2.pt)
    expect(line1.norm).toEqual(line2.norm)
  })

  it('New line may be constructed by function call', function () {
    const l = line(point(1, 3), point(3, 3))
    expect(l.pt).toEqual({ x: 1, y: 3 })
    expect(l.norm.equalTo(vector(0, 1))).toBe(true)
  })
  it('May create new instance by clone', function () {
    const l = line(point(1, 3), point(3, 3))
    const l1 = l.clone()
    expect(l1).toEqual(l)
    expect(l1 === l).toBe(false)
  })
  it('Get slope - angle in radians between line and axe x', function () {
    const pt1 = new Point(1, 1)
    const pt2 = new Point(2, 2)
    const line = new Line(pt1, pt2)
    expect(line.slope).toBe(Math.PI / 4)
  })
  it('Method contains returns true if point belongs to the line', function () {
    const pt1 = new Point(1, 1)
    const pt2 = new Point(2, 2)
    const pt3 = new Point(3, 3)
    const line = new Line(pt1, pt2)
    expect(line.contains(pt3)).toBe(true)
  })
  it('May split line by point into array of two rays', function () {
    const pt = point(100, 200)
    const norm = vector(0, 1)
    const l = line(pt, norm)
    const splitPt = point(300, 200)
    const res = l.split(splitPt) as [Ray, Ray]
    expect(res[0]).toEqual(ray(splitPt, norm.invert()))
    expect(res[1]).toEqual(ray(splitPt, norm))
  })
  it('May return 1-dim coordinate of point on line', function () {
    const pt = point(100, 200)
    const norm = vector(0, 1)
    const l = line(pt, norm)

    expect(l.coord(point(300, 200))).toBe(300)
    expect(l.coord(point(0, 200))).toBe(0)
  })
})
describe('Line.intersect methods return array of intersection points if intersection exist', function () {
  it('Line to line intersection', function () {
    const line1 = new Line(new Point(0, 1), new Point(2, 1))
    const line2 = new Line(new Point(1, 0), new Point(1, 2))
    const ip = line1.intersect(line2)
    const expectedIp = new Point(1, 1)
    const equals = ip[0].equalTo(expectedIp)
    expect(ip.length).toBe(1)
    expect(equals).toBe(true)
  })
  it('Method intersect returns zero length array if intersection does not exist', function () {
    const line1 = new Line(new Point(0, 1), new Point(2, 1))
    const line2 = new Line(new Point(0, 2), new Point(2, 2))
    const ip = line1.intersect(line2)
    expect(ip.length).toBe(0)
  })
  it('Line to circle intersection - horizontal line, line constricted with 2 points', function () {
    const line = new Line(new Point(-1, 1), new Point(1, 1))
    const circle = new Circle(new Point(0, 0), 3)
    const ip = line.intersect(circle)
    expect(ip.length).toBe(2)
    expect(ip[0].y).toBe(1)
    expect(ip[1].y).toBe(1)
  })
  it('Line to circle intersection - horizontal line, line constructed with point and vector', function () {
    const line = new Line(new Point(-1, 1), new Vector(0, 3))
    const circle = new Circle(new Point(0, 0), 3)
    const ip = line.intersect(circle)
    expect(ip.length).toBe(2)
    expect(ip[0].y).toBe(1)
    expect(ip[1].y).toBe(1)
  })
  it('Line to circle intersection - diagonal line, line constructed with point and vector', function () {
    const line = new Line(new Point(-3, -3), new Vector(-1, 1))
    const circle = new Circle(new Point(0, 0), 1)
    const ip = line.intersect(circle)
    expect(ip.length).toBe(2)
    expect(ip[0].equalTo(point(-Math.sqrt(2) / 2, -Math.sqrt(2) / 2))).toBe(
      true
    )
    expect(ip[1].equalTo(point(Math.sqrt(2) / 2, Math.sqrt(2) / 2))).toBe(true)
  })
  it('Line to arc intersection - quick reject', function () {
    const line = new Line(point(1, 0), vector(1, 0))
    const arc = new Arc(point(1, 0), 3, -Math.PI / 3, Math.PI / 3, CCW)
    const ip = line.intersect(arc)
    expect(ip.length).toBe(0)
  })
  it('Line to polygon intersection', function () {
    const points = [
      point(100, 20),
      point(250, 75),
      point(350, 75),
      point(300, 200),
      point(170, 200),
      point(120, 350),
      point(70, 120)
    ]
    const polygon = new Polygon()
    polygon.addFace(points)

    const line = new Line(point(100, 20), point(300, 200))

    const ip = line.intersect(polygon)
    expect(ip.length).toBe(2)
  })
  it('Line to box intersection', function () {
    const points = [
      point(100, 20),
      point(250, 75),
      point(350, 75),
      point(300, 200),
      point(170, 200),
      point(120, 350),
      point(70, 120)
    ]
    const polygon = new Polygon()
    polygon.addFace(points)

    const line = new Line(point(100, 20), point(300, 200))

    const ip = line.intersect(polygon.box)
    expect(ip.length).toBe(2)
  })

  it('Line to square box intersection', function () {
    const point = new Point(300, 300)
    const norm = new Vector(0, 1)
    const line = new Line(point, norm)
    const box = new Box(0, 0, 600, 600)
    const ip = line.intersect(box)
    expect(ip.length).toBe(2)
  })

  it('May check if two lines are parallel', function () {
    const line1 = new Line(new Point(0, 2), new Point(2, 0))
    const line2 = new Line(new Point(4, 0), new Point(0, 4))
    expect(line1.parallelTo(line2)).toBe(true)
  })
  it('May check if two lines are not parallel', function () {
    const line1 = new Line(new Point(0, 2), new Point(2, 0))
    const line2 = new Line(new Point(4.001, 0), new Point(0, 4))
    expect(line1.parallelTo(line2)).toBe(false)
  })
})
