import { Distance } from '../algorithms'
import { PlanarSet } from '../algorithms/structures'
import {
  matrix,
  Point,
  Circle,
  Line,
  Segment,
  Arc,
  Box,
  Polygon,
  point,
  vector,
  circle,
  segment,
  box
} from '../index'
import { CCW, ORIENTATION } from '../utils/constants'

describe('Polygon constructor.', function () {
  it('May create new instance of Polygon', function () {
    const polygon = new Polygon()
    expect(polygon).toBeInstanceOf(Polygon)
  })
  it('Default construct creates instance of Polygon faces edges as instances of PlanarSet', function () {
    const polygon = new Polygon()
    expect(polygon.edges).toBeInstanceOf(PlanarSet)
    expect(polygon.faces).toBeInstanceOf(PlanarSet)
  })
  it('Default construct creates instance of Polygon with 0 faces and 0 edges', function () {
    const polygon = new Polygon()
    expect(polygon.edges.size).toBe(0)
    expect(polygon.faces.size).toBe(0)
  })
  it('Can construct Polygon from array of 3 points', function () {
    const polygon = new Polygon()
    const points = [new Point(1, 1), new Point(5, 1), new Point(3, 5)]
    polygon.addFace(points)
    expect(polygon.edges.size).toBe(3)
    expect(polygon.faces.size).toBe(1)
  })
  it('Can construct Polygon from array of 3 segments', function () {
    const polygon = new Polygon()
    const points = [new Point(1, 1), new Point(5, 1), new Point(3, 5)]
    const segments = [
      new Segment(points[0], points[1]),
      new Segment(points[1], points[2]),
      new Segment(points[2], points[0])
    ]
    polygon.addFace(segments)
    expect(polygon.edges.size).toBe(3)
    expect(polygon.faces.size).toBe(1)
  })
  it('Can construct Polygon with multiple faces', function () {
    const polygon = new Polygon()
    const points = [
      new Point(1, 1),
      new Point(5, 1),
      new Point(3, 5),
      new Point(-1, -1),
      new Point(-5, -1),
      new Point(-3, -5)
    ]
    const segments1 = [
      new Segment(points[0], points[1]),
      new Segment(points[1], points[2]),
      new Segment(points[2], points[0])
    ]
    const segments2 = [
      new Segment(points[3], points[4]),
      new Segment(points[4], points[5]),
      new Segment(points[5], points[3])
    ]
    polygon.addFace(segments1)
    polygon.addFace(segments2)
    expect(polygon.edges.size).toBe(6)
    expect(polygon.faces.size).toBe(2)
  })
  it('Can construct polygon from Circle in CCW orientation', function () {
    const polygon = new Polygon(circle(point(3, 3), 50))
    expect(polygon.faces.size).toBe(1)
    expect(polygon.edges.size).toBe(1)
    expect([...polygon.faces][0].orientation()).toBe(ORIENTATION.CCW)
  })
  it('Can construct polygon from a box in CCW orientation', function () {
    const polygon = new Polygon(box(30, 40, 100, 200))
    expect(polygon.faces.size).toBe(1)
    expect(polygon.edges.size).toBe(4)
    expect([...polygon.faces][0].orientation()).toBe(ORIENTATION.CCW)
  })
  it('Can construct polygon from a box and circle as a hole', function () {
    const polygon = new Polygon()
    polygon.addFace(box(0, 0, 100, 100))
    polygon.addFace(circle(point(40, 40), 20)).reverse() // change orientation to CW
    expect(polygon.faces.size).toBe(2)
    expect(polygon.edges.size).toBe(5)
    expect([...polygon.faces][0].size).toBe(4)
    expect([...polygon.faces][0].orientation()).toBe(ORIENTATION.CCW)
    expect([...polygon.faces][1].size).toBe(1)
    expect([...polygon.faces][1].orientation()).toBe(ORIENTATION.CW)
  })
  it('Can construct polygon using class constructor', function () {
    const poly = new Polygon([
      point(100, 20),
      point(250, 75),
      point(350, 75),
      point(300, 270),
      point(170, 200),
      point(120, 350),
      point(70, 120)
    ])
    expect(poly.faces.size).toBe(1)
    expect(poly.edges.size).toBe(7)
  })
  it('Can construct polygon using array of pairs of numbers', function () {
    const poly = new Polygon([
      [1, 1],
      [1, 2],
      [2, 2],
      [2, 1]
    ])
    expect(poly.faces.size).toBe(1)
    expect(poly.edges.size).toBe(4)
  })
  it('Can construct multi polygon by multi points using constructor', function () {
    const points = [
      [point(1, 1), point(5, 1), point(3, 5)],
      [point(-1, -1), point(-5, -1), point(-3, -5)]
    ]

    const polygon = new Polygon(points)
    expect(polygon.faces.size).toBe(2)
    expect(polygon.edges.size).toBe(6)
    expect([...polygon.faces][0].size).toBe(3)
    expect([...polygon.faces][1].size).toBe(3)
  })

  it('Can construct multi polygon by multi shapes using constructor', function () {
    const points = [
      point(1, 1),
      point(5, 1),
      point(3, 5),
      point(-1, -1),
      point(-5, -1),
      point(-3, -5)
    ]
    const segments1 = [
      segment(points[0], points[1]),
      segment(points[1], points[2]),
      segment(points[2], points[0])
    ]
    const segments2 = [
      segment(points[3], points[4]),
      segment(points[4], points[5]),
      segment(points[5], points[3])
    ]
    const polygon = new Polygon([segments1, segments2])
    expect(polygon.faces.size).toBe(2)
    expect(polygon.edges.size).toBe(6)
    expect([...polygon.faces][0].size).toBe(3)
    expect([...polygon.faces][1].size).toBe(3)
  })
})

describe('Polygon methods', () => {
  it('Can remove faces from polygon', function () {
    const polygon = new Polygon()
    const points = [
      new Point(1, 1),
      new Point(5, 1),
      new Point(3, 5),
      new Point(-1, -1),
      new Point(-5, -1),
      new Point(-3, -5)
    ]
    const segments1 = [
      new Segment(points[0], points[1]),
      new Segment(points[1], points[2]),
      new Segment(points[2], points[0])
    ]
    const segments2 = [
      new Segment(points[3], points[4]),
      new Segment(points[4], points[5]),
      new Segment(points[5], points[3])
    ]
    const face1 = polygon.addFace(segments1)
    const face2 = polygon.addFace(segments2)
    polygon.deleteFace(face1)
    expect(polygon.faces.has(face1)).toBe(false)
    expect(polygon.edges.size).toBe(3)
    expect(polygon.faces.size).toBe(1)
    polygon.deleteFace(face2)
    expect(polygon.faces.has(face2)).toBe(false)
    expect(polygon.edges.size).toBe(0)
    expect(polygon.faces.size).toBe(0)
  })

  it('Can add faces to polygon', function () {
    const polygon = new Polygon()
    polygon.addFace([point(1, 1), point(3, 1), point(3, 2), point(1, 2)])
    polygon.addFace([point(-1, 1), point(-3, 1), point(-3, 2), point(-1, 2)])
    expect(polygon.edges.size).toBe(8)
    expect(polygon.faces.size).toBe(2)
  })
  it('Can return bounding box of the polygon', function () {
    const polygon = new Polygon()
    polygon.addFace([point(1, 1), point(3, 1), point(3, 2), point(1, 2)])
    polygon.addFace([point(-1, 1), point(-3, 1), point(-3, 2), point(-1, 2)])
    const box = polygon.box
    expect(box.xmin).toBe(-3)
    expect(box.ymin).toBe(1)
    expect(box.xmax).toBe(3)
    expect(box.ymax).toBe(2)
  })
  it('Can return array of vertices', function () {
    const polygon = new Polygon()
    const points = [point(1, 1), point(3, 1), point(3, 2), point(1, 2)]
    polygon.addFace(points)
    expect(polygon.vertices).toEqual(points)
  })
  it('Can calculate area of the one-face polygon', function () {
    const polygon = new Polygon()
    polygon.addFace([point(1, 1), point(3, 1), point(3, 2), point(1, 2)])
    expect(polygon.area()).toBe(2)
  })
})

describe('Polygon distance', () => {
  it('Can measure distance between circle and polygon', function () {
    const points = [
      point(100, 20),
      point(250, 75),
      point(350, 75),
      point(300, 270),
      point(170, 200),
      point(120, 350),
      point(70, 120)
    ]
    const poly = new Polygon()
    poly.addFace(points)
    poly.addFace([circle(point(175, 150), 30).toArc()])
    const c = circle(point(300, 25), 25)
    const [dist, shortestSegment] = poly.distanceTo(c)
    expect(dist).toBe(25)
    expect(shortestSegment.pe).toEqual({ x: 300, y: 50 })
    expect(shortestSegment.ps).toEqual({ x: 300, y: 75 })
  })
  it('Can measure distance between two polygons', function () {
    const points = [
      point(100, 20),
      point(250, 75),
      point(350, 75),
      point(300, 200),
      point(170, 200),
      point(120, 350),
      point(70, 120)
    ]
    const poly1 = new Polygon()
    poly1.addFace(points)
    poly1.addFace([circle(point(175, 150), 30).toArc()])
    const poly2 = new Polygon()
    poly2.addFace([circle(point(250, 300), 50).toArc()])
    const [dist, shortestSegment] = Distance.distance(poly1, poly2)
    expect(dist).toBe(50)
    expect(shortestSegment.pe).toEqual({ x: 250, y: 250 })
    expect(shortestSegment.ps).toEqual({ x: 250, y: 200 })
  })
  it('distanceTo between Polygons: First point of segment is not always on the this polygon #57', function () {
    const rec1 = new Box(0, 0, 200, 50)
    const rec2 = new Box(0, 500, 200, 550)
    const p1 = new Polygon(rec1)
    const p2 = new Polygon(rec2)
    const [dist, shortestSegment] = p1.distanceTo(p2)
    expect(dist).toBe(450)
    expect(shortestSegment.ps).toEqual({ x: 200, y: 50 })
    expect(shortestSegment.pe).toEqual({ x: 200, y: 500 })
  })
})
describe('Polygon intersection', () => {
  it('Intersect arc with polygon', function () {
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
    const arc = new Arc(point(150, 50), 50, Math.PI / 3, (5 * Math.PI) / 3, CCW)
    expect(polygon.intersect(arc).length).toBe(1)
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
  it('Line to polygon intersection', function () {
    'use strict'
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
    expect(polygon.intersect(line).length).toBe(2)
  })
  it('Intersection with Polygon', function () {
    const segment = new Segment(150, -20, 150, 60)
    const points = [
      point(100, 20),
      point(200, 20),
      point(200, 40),
      point(100, 40)
    ]
    const poly = new Polygon()
    poly.addFace(points)
    const ip = poly.intersect(segment)
    expect(ip.length).toBe(2)
    expect(ip[0]).toEqual(point(150, 20))
    expect(ip[1]).toEqual(point(150, 40))
  })
})

describe('Polygon transform', () => {
  it('Can translate polygon', function () {
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
    const newPolygon = polygon.translate(vector(100, 50))
    expect(newPolygon.faces.size).toBe(1)
    expect(newPolygon.edges.size).toBe(7)
  })
  it('Can rotate polygon', function () {
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
    const newPolygon = polygon.rotate(Math.PI / 2, polygon.box.center)
    expect(newPolygon.faces.size).toBe(1)
    expect(newPolygon.edges.size).toBe(7)
  })
  it('Can transform polygon', function () {
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
    const pc = polygon.box.center
    const m = matrix()
      .translate(pc.x, pc.y)
      .rotate(Math.PI / 2)
      .translate(-pc.x, -pc.y)
    const newPolygon = polygon.transform(m)
    expect(newPolygon.faces.size).toBe(1)
    expect(newPolygon.edges.size).toBe(7)
  })
  it('Issue #18 Division by zero error when checking if polygon contains a point', function () {
    const points = [
      new Point(-0.0774582, 51.4791865),
      new Point(-0.0784252, 51.4792941),
      new Point(-0.0774582, 51.4791865)
    ]
    const poly = new Polygon()
    poly.addFace(points)
    const pp = new Point(-0.07776044568759738, 51.47918678917519)
    const contains = poly.contains(pp)
    expect(contains).toBe(false)
  })
})
