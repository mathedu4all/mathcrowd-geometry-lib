import { point, segment } from '../index'
import { Edge } from './edge'
import { Multiline } from './multiline'

describe('Multiline', function () {
  it('May create new instance of Multiline', function () {
    const ml = new Multiline()
    expect(ml).toBeInstanceOf(Multiline)
  })
  it('Default constructor creates new empty multiline', function () {
    const ml = new Multiline()
    expect(ml.size).toBe(0)
  })
  it('May construct multiline from sequence of segments', function () {
    const shapes = [
      segment(point(0, 0), point(50, 100)),
      segment(point(50, 100), point(100, 75))
    ]
    const ml = new Multiline(shapes)
    expect(ml.size).toBe(2)
  })
  it('May get array of edges of multiline', function () {
    const shapes = [
      segment(point(0, 0), point(50, 100)),
      segment(point(50, 100), point(100, 75))
    ]
    const ml = new Multiline(shapes)
    const otherShapes = ml.edges.map((edge) => edge.shape)
    expect(otherShapes[0]).toEqual(shapes[0])
    expect(otherShapes[1]).toEqual(shapes[1])
  })
  it('May get array of vertices of multiline', function () {
    const shapes = [
      segment(point(0, 0), point(50, 100)),
      segment(point(50, 100), point(100, 75))
    ]
    const ml = new Multiline(shapes)
    const points = ml.vertices
    expect(points[0]).toEqual(point(0, 0))
    expect(points[1]).toEqual(point(50, 100))
    expect(points[2]).toEqual(point(100, 75))
  })
  it('May get box of multiline', function () {
    const shapes = [
      segment(point(0, 0), point(50, 100)),
      segment(point(50, 100), point(100, 75))
    ]
    const ml = new Multiline(shapes)
    expect(ml.box).toEqual({ xmin: 0, ymin: 0, xmax: 100, ymax: 100 })
  })
  it('May transform multiline to an array of shapes', function () {
    const shapes = [
      segment(point(0, 0), point(50, 100)),
      segment(point(50, 100), point(100, 75))
    ]
    const ml = new Multiline(shapes)
    const otherShapes = ml.toShapes()
    expect(otherShapes[0]).toEqual(shapes[0])
    expect(otherShapes[1]).toEqual(shapes[1])
  })
  it('May delete first edge from multiline', function () {
    const shapes = [
      segment(point(0, 0), point(50, 100)),
      segment(point(50, 100), point(100, 75)),
      segment(point(100, 75), point(150, 50))
    ]
    const ml = new Multiline(shapes)
    const edge = ml.first as Edge

    expect(ml.size).toBe(3)

    ml.remove(edge)
    expect(ml.size).toBe(2)

    expect((ml.first as Edge).shape).toEqual(shapes[1])
    expect((ml.last as Edge).shape).toEqual(shapes[2])
  })
  it('May delete middle edge from multiline', function () {
    const shapes = [
      segment(point(0, 0), point(50, 100)),
      segment(point(50, 100), point(100, 75)),
      segment(point(100, 75), point(150, 50))
    ]
    const ml = new Multiline(shapes)
    const edge = (ml.first as Edge).next as Edge

    expect(ml.size).toBe(3)

    ml.remove(edge)
    expect(ml.size).toBe(2)

    expect((ml.first as Edge).shape).toEqual(shapes[0])
    expect((ml.last as Edge).shape).toEqual(shapes[2])
  })
  it('May delete last edge from multiline', function () {
    const shapes = [
      segment(point(0, 0), point(50, 100)),
      segment(point(50, 100), point(100, 75)),
      segment(point(100, 75), point(150, 50))
    ]
    const ml = new Multiline(shapes)
    const edge = ml.last as Edge

    expect(ml.size).toBe(3)

    ml.remove(edge)
    expect(ml.size).toBe(2)

    expect((ml.first as Edge).shape).toEqual(shapes[0])
    expect((ml.last as Edge).shape).toEqual(shapes[1])
  })
  it('May delete all edges from multiline', function () {
    const shapes = [
      segment(point(0, 0), point(50, 100)),
      segment(point(50, 100), point(100, 75)),
      segment(point(100, 75), point(150, 50))
    ]
    const ml = new Multiline(shapes)

    expect(ml.size).toBe(3)

    ml.remove(ml.first as Edge)
    ml.remove(ml.first as Edge)
    ml.remove(ml.first as Edge)

    expect(ml.size).toBe(0)
    expect(ml.isEmpty()).toBe(true)
  })
  it('May add vertex to polyline', function () {
    const shapes = [
      segment(point(0, 0), point(50, 100)),
      segment(point(50, 100), point(100, 75))
    ]
    const ml = new Multiline(shapes)
    const pt = point(25, 50)
    const edge = ml.findEdgeByPoint(pt) as Edge
    ml.addVertex(pt, edge)
    expect(ml.size).toBe(3)
  })
  it('May split polyline with intersections', function () {
    const shapes = [
      segment(point(0, 0), point(50, 100)),
      segment(point(50, 100), point(100, 75))
    ]
    const ml = new Multiline(shapes)
    const pt = point(25, 50)
    const edge = ml.findEdgeByPoint(pt) as Edge
    ml.addVertex(pt, edge)
    expect(ml.size).toBe(3)
  })
  it('May split polyline with array of points', function () {
    const shapes = [
      segment(point(0, 0), point(50, 100)),
      segment(point(50, 100), point(100, 0))
    ]
    let ml = new Multiline(shapes)
    const pts = [point(25, 50), point(75, 50)]
    ml = ml.split(pts)

    expect(ml.size).toBe(4)
  })
})
