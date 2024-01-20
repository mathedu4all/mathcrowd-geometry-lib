import { Polygon, Edge, point, arc, Point } from '../index'
import { ORIENTATION } from '../utils/constants'
import { EQ } from '../utils/utils'

describe('Face', function () {
  it('Can iterate edges as iterable', function () {
    const polygon = new Polygon()
    const points = [point(1, 1), point(3, 1), point(3, 2), point(1, 2)]
    const face = polygon.addFace(points)
    expect([...face]).toBeInstanceOf(Array)
    for (const edge of face) {
      expect(edge).toBeInstanceOf(Edge)
    }
    expect(face.size).toBe(4)
  })

  it('Can create iterator of edges and iterate them one by one', function () {
    const polygon = new Polygon()
    const points = [point(1, 1), point(3, 1), point(3, 2), point(1, 2)]
    const face = polygon.addFace(points)
    expect(face.size).toBe(4)
    const edges = [...face.edges]
    const iterator = face[Symbol.iterator]()
    expect(iterator.next().value).toBe(edges[0])
    expect(iterator.next().value).toBe(edges[1])
    expect(iterator.next().value).toBe(edges[2])
    expect(iterator.next().value).toBe(edges[3])
    expect(iterator.next().done).toBe(true)
  })

  it('Can get array of edges for the given face', function () {
    const polygon = new Polygon()
    const points = [point(1, 1), point(3, 1), point(3, 2), point(1, 2)]
    const face = polygon.addFace(points)
    const edges = face.edges
    const vertices = edges.map((edge) => edge.start)
    expect(edges.length).toBe(4)
    expect(vertices.length).toBe(4)
    expect(vertices).toEqual(points)
  })
  it('Can count edges in face', function () {
    const polygon = new Polygon()
    const points = [point(1, 1), point(3, 1), point(3, 2), point(1, 2)]
    const face = polygon.addFace(points)
    expect(face.size).toBe(4)
  })
  it('Can set orientation of face to CCW', function () {
    const polygon = new Polygon()
    const face = polygon.addFace([
      point(1, 1),
      point(3, 1),
      point(3, 2),
      point(1, 2)
    ])
    expect(face.signedArea()).toBe(-2)
    expect(face.orientation()).toBe(ORIENTATION.CCW)
  })
  it('Can set orientation of face to CW', function () {
    const polygon = new Polygon()
    const face = polygon.addFace([arc(point(1, 1), 1, 0, 2 * Math.PI, false)])
    expect(EQ(face.signedArea(), Math.PI)).toBe(true)
    expect(face.orientation()).toBe(ORIENTATION.CW)
  })
  it('Can set orientation of degenerated face to not-orientable', function () {
    const polygon = new Polygon()
    const face = polygon.addFace([point(1, 1), point(3, 1), point(1, 1)])
    expect(face.area()).toBe(0)
    expect(face.orientation()).toBe(ORIENTATION.NOT_ORIENTABLE)
  })
  it('Can remove edge from face', function () {
    'use strict'
    const points = [
      point(100, 20),
      point(200, 20),
      point(200, 40),
      point(100, 40)
    ]

    const poly = new Polygon()
    const face = poly.addFace(points)

    expect(face.size).toBe(4)
    const edge = face.first as Edge
    const edgeNext = edge.next as Edge
    face.remove(edge)
    poly.edges.delete(edge)
    expect(face.size).toBe(3)
    expect(face.first).toBe(edgeNext)
    expect((face.last as Edge).next).toBe(face.first)
    expect((face.first as Edge).prev).toBe(face.last)
  })
  it('Can remove all edges from face', function () {
    const points = [
      point(100, 20),
      point(200, 20),
      point(200, 40),
      point(100, 40)
    ]

    const poly = new Polygon()
    const face = poly.addFace(points)
    expect(face.size).toBe(4)

    // remove all edges except the last
    for (
      let edge = face.first as Edge;
      edge !== face.last;
      edge = edge.next as Edge
    ) {
      face.remove(edge)
      poly.edges.delete(edge)
    }
    expect(face.size).toBe(1)
    expect(face.first).toBe(face.last)

    // remove the last edge
    const edge = face.first as Edge
    face.remove(edge)
    poly.edges.delete(edge)

    expect(face.isEmpty()).toBe(true)
    expect(face.size).toBe(0)
  })
  it('Can reverse face', function () {
    const points = [
      point(100, 20),
      point(200, 20),
      point(200, 40),
      point(100, 40)
    ]

    const poly = new Polygon()
    const face = poly.addFace(points)
    expect(face.size).toBe(4)
    expect(face.orientation()).toBe(ORIENTATION.CCW)
    face.reverse()
    expect(face.orientation()).toBe(ORIENTATION.CW)
    const reversedPoly = poly.reverse()
    expect(reversedPoly.faces.size).toBe(1)
    expect(reversedPoly.edges.size).toBe(4)
    expect([...reversedPoly.faces][0].size).toBe(4)
    const orientation = [...reversedPoly.faces][0].orientation()
    expect(orientation).toBe(ORIENTATION.CCW)
  })

  it('Can find points at specific lengths', function () {
    const points = [
      point(100, 20),
      point(200, 20),
      point(200, 40),
      point(100, 40)
    ]

    const poly = new Polygon()
    const face = poly.addFace(points)
    const length = face.perimeter
    expect(length).toBe(240)
    for (let i = 0; i < 33; i++) {
      const point = face.pointAtLength((i / 33) * length)
      expect(point).toBeInstanceOf(Point)
    }
  })
})
