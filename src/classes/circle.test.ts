import {
  Point,
  Circle,
  Line,
  Segment,
  Polygon,
  point,
  vector,
  circle,
  line,
  segment
} from '../index'
import { PIx2 } from '../utils/constants'

describe('Circle', function () {
  it('May create new instance of Circle', function () {
    const circle = new Circle(new Point(0, 0), 1)
    expect(circle).toBeInstanceOf(Circle)
  })
  it('Constructor Circle(pt, r) creates new circle', function () {
    const circle = new Circle(new Point(1, 1), 2)
    expect(circle.pc).toEqual({ x: 1, y: 1 })
    expect(circle.r).toBe(2)
  })
  it('New circle may be constructed by function call', function () {
    expect(circle(point(1, 1), 3)).toEqual(new Circle(new Point(1, 1), 3))
  })
  it('May create new instance by clone', function () {
    const circle = new Circle(new Point(1, 1), 2)
    const circle1 = circle.clone()
    expect(circle1).toEqual(circle)
    expect(circle1 === circle).toBe(false)
  })
  it('Method contains returns true if point belongs to the circle', function () {
    const pt = new Point(0, 1)
    const circle = new Circle(new Point(0, 0), 2)
    expect(circle.contains(pt)).toBe(true)
  })
  it('Can return circle bounding box', function () {
    const circle = new Circle(new Point(0, 0), 2)
    expect(circle.box).toEqual({ xmin: -2, ymin: -2, xmax: 2, ymax: 2 })
  })
  it('Can transform circle into closed CCW arc', function () {
    const circle = new Circle(new Point(0, 0), 2)
    const arc = circle.toArc(true)
    expect(arc.sweep).toBe(PIx2)
    expect(arc.start.equalTo(point(-2, 0))).toBe(true)
    expect(arc.end.equalTo(point(-2, 0))).toBe(true)
  })
  it('Can transform circle into closed CW arc', function () {
    const circle = new Circle(new Point(0, 0), 2)
    const arc = circle.toArc(false)
    expect(arc.sweep).toBe(PIx2)
    expect(arc.start.equalTo(point(-2, 0))).toBe(true)
    expect(arc.end.equalTo(point(-2, 0))).toBe(true)
  })
})
describe('Circle intersection with others.', function () {
  it('Can intersect circle with line. Case 1 no intersection', function () {
    const circle = new Circle(new Point(0, 0), 2)
    const line = new Line(point(3, 3), vector(0, 1))
    const ip = circle.intersect(line)
    expect(ip.length).toBe(0)
  })
  it('Can intersect circle with line. Case 2 Touching', function () {
    const circle = new Circle(new Point(0, 0), 2)
    const line = new Line(point(3, 2), vector(0, 1))
    const ip = circle.intersect(line)
    expect(ip.length).toBe(1)
    expect(ip[0]).toEqual({ x: 0, y: 2 })
  })
  it('Can intersect circle with line. Case 3 Two points', function () {
    const circle = new Circle(new Point(0, 0), 2)
    const line = new Line(point(1, 1), vector(0, 1))
    const ip = circle.intersect(line)
    expect(ip.length).toBe(2)
  })
  it('Can intersect circle with segment. One point', function () {
    const circle = new Circle(new Point(0, 0), 2)
    const segment = new Segment(point(1, 1), point(3, 3))
    const ip = circle.intersect(segment)
    expect(ip.length).toBe(1)
  })
  it('Can intersect circle with segment.2 points', function () {
    const circle = new Circle(new Point(0, 0), 2)
    const segment = new Segment(point(-3, -3), point(3, 3))
    const ip = circle.intersect(segment)
    expect(ip.length).toBe(2)
  })
  it('Can intersect circle with arc', function () {
    const circle = new Circle(new Point(0, 0), 2)
    const circle1 = new Circle(new Point(0, 1), 2)
    const arc = circle1.toArc()
    const ip = circle.intersect(arc)
    expect(ip.length).toBe(2)
  })
  it('Can intersect circle with circle - quick reject', function () {
    const circle1 = new Circle(new Point(0, 0), 2)
    const circle2 = new Circle(new Point(5, 4), 2)
    const ip = circle1.intersect(circle2)
    expect(ip.length).toBe(0)
  })
  it('Can intersect circle with circle - no intersection r1 + r2 < dist', function () {
    const circle1 = new Circle(new Point(0, 0), 2)
    const circle2 = new Circle(new Point(2, 2), 0.5)
    const ip = circle1.intersect(circle2)
    expect(ip.length).toBe(0)
  })
  it('Can intersect circle with circle - no intersection: one inside another', function () {
    const circle1 = new Circle(new Point(0, 0), 4)
    const circle2 = new Circle(new Point(0, 0), 3)
    const ip = circle1.intersect(circle2)
    expect(ip.length).toBe(0)
  })
  it('Can intersect circle with circle - same circle, one intersection, leftmost point', function () {
    const circle = new Circle(new Point(0, 0), 4)
    const ip = circle.intersect(circle.clone())
    expect(ip.length).toBe(1)
    expect(ip[0]).toEqual({ x: -4, y: 0 })
  })
  it('Can intersect circle with circle - degenerated circle', function () {
    const circle1 = new Circle(new Point(0, 0), 2)
    const circle2 = new Circle(new Point(2, 0), 0)
    const ip = circle1.intersect(circle2)
    expect(ip.length).toBe(0)
  })
  it('Intersect circle with polygon', function () {
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
    const circle = new Circle(point(150, 50), 50)
    expect(circle.intersect(polygon).length).toBe(2)
  })
  it('Intersect circle with box', function () {
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
    const circle = new Circle(point(150, 50), 50)
    expect(circle.intersect(polygon.box).length).toBe(2)
  })
})
describe('Circle.DistanceTo', function () {
  it('Can measure distance between circle and point', function () {
    const c = circle(point(200, 200), 50)
    const pt = point(200, 100)
    const [dist, shortestSegment] = c.distanceTo(pt)
    expect(dist).toBe(50)
    expect(shortestSegment.ps).toEqual({ x: 200, y: 150 })
    expect(shortestSegment.pe).toEqual(pt)
  })
  it('Can measure distance between circle and circle', function () {
    const c1 = circle(point(200, 200), 50)
    const c2 = circle(point(200, 230), 100)
    const [dist, shortestSegment] = c1.distanceTo(c2)
    expect(dist).toBe(20)
    expect(shortestSegment.ps).toEqual({ x: 200, y: 150 })
    expect(shortestSegment.pe).toEqual({ x: 200, y: 130 })
  })
  it('Can measure distance between circle and line', function () {
    const c = circle(point(200, 200), 50)
    const l = line(point(200, 130), vector(0, 1))
    const [dist, shortestSegment] = c.distanceTo(l)
    expect(dist).toBe(20)
    expect(shortestSegment.ps).toEqual({ x: 200, y: 150 })
    expect(shortestSegment.pe).toEqual({ x: 200, y: 130 })
  })
  it('Can measure distance between circle and segment', function () {
    const c = circle(point(200, 200), 50)
    const seg = segment(point(200, 130), point(220, 130))
    const [dist, shortestSegment] = c.distanceTo(seg)
    expect(dist).toBe(20)
    expect(shortestSegment.ps).toEqual({ x: 200, y: 150 })
    expect(shortestSegment.pe).toEqual({ x: 200, y: 130 })
  })
  it('Can measure distance between circle and arc', function () {
    const c = circle(point(200, 200), 50)
    const a = circle(point(200, 100), 20).toArc()
    const [dist, shortestSegment] = c.distanceTo(a)
    expect(dist).toBe(30)
    expect(shortestSegment.ps).toEqual({ x: 200, y: 150 })
    expect(shortestSegment.pe).toEqual({ x: 200, y: 120 })
  })
  //   // it('Can measure distance between circle and polygon', function () {
  //   //   const points = [
  //   //     point(100, 20),
  //   //     point(250, 75),
  //   //     point(350, 75),
  //   //     point(300, 270),
  //   //     point(170, 200),
  //   //     point(120, 350),
  //   //     point(70, 120)
  //   //   ]
  //   //   const poly = new Polygon()
  //   //   poly.addFace(points)
  //   //   poly.addFace([circle(point(175, 150), 30).toArc()])
  //   //   const c = circle(point(300, 25), 25)
  //   //   const [dist, shortestSegment] = c.distanceTo(poly)
  //   //   expect(dist).toBe(25)
  //   //   expect(shortestSegment.ps).toEqual({ x: 300, y: 50 })
  //   //   expect(shortestSegment.pe).toEqual({ x: 300, y: 75 })
  //   // })
  // })
})
