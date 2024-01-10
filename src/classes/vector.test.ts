import {
  Point,
  Vector,
  // Circle,
  // Line,
  // Segment,
  // Arc,
  // Box,
  // Polygon,
  // Edge,
  // Face,
  // Ray,
  point,
  vector
  // circle,
  // line,
  // segment,
  // arc,
  // ray
} from '../index'
import { Errors } from '../utils/errors'
import { EQ } from '../utils/utils'

describe('Vector', function () {
  it('May create new instance of Vector', function () {
    const vector = new Vector(1, 1)
    expect(vector).toBeInstanceOf(Vector)
  })
  it('Default constructor creates new Vector(0, 0)', function () {
    const vector = new Vector()
    expect(vector).toEqual({ x: 0, y: 0 })
  })
  it('Constructor Vector(x, y) creates vector [x, y]', function () {
    const vector = new Vector(1, 1)
    expect(vector).toEqual({ x: 1, y: 1 })
  })
  it('Constructor Vector(ps, pe) creates vector [ps, pe]', function () {
    const ps = new Point(1, 1)
    const pe = new Point(3, 2)
    const vector = new Vector(ps, pe)
    expect(vector).toEqual({ x: 2, y: 1 })
  })
  it('Constructor Vector([x, y]) creates vector [x, y]', function () {
    const vector = new Vector([1, 1])
    expect(vector).toEqual({ x: 1, y: 1 })
  })

  it('New vector may be constructed by function call', function () {
    expect(vector(point(1, 1), point(3, 3))).toEqual({ x: 2, y: 2 })
  })
  it('Method clone creates new instance of Vector', function () {
    const v1 = new Vector(2, 1)
    const v2 = v1.clone()
    expect(v2).toBeInstanceOf(Vector)
    expect(v2).not.toBe(v1)
    expect(v2).toEqual(v1)
  })
  it('Method mutliply vector by scalar', function () {
    const v1 = new Vector(2, 1)
    const v2 = v1.multiply(2)
    expect(v2).toEqual({ x: 4, y: 2 })
  })
  it('Method dot calculates dot product', function () {
    const v1 = new Vector(2, 0)
    const v2 = new Vector(0, 2)
    expect(v1.dot(v2)).toBe(0)
  })
  it('Method cross calculates cross product', function () {
    const v1 = new Vector(2, 0)
    const v2 = new Vector(0, 2)
    expect(v1.cross(v2)).toBe(4)
  })
  it('Method length calculates vector length', function () {
    const v = new Vector(1, 1)
    expect(v.length).toBe(Math.sqrt(2))
  })
  it('Get slope - angle in radians between vector and axe x', function () {
    const v1 = new Vector(1, 1)
    const v2 = new Vector(-1, 1)
    const v3 = new Vector(-1, -1)
    const v4 = new Vector(1, -1)
    expect(v1.slope).toBe(Math.PI / 4)
    expect(v2.slope).toBe((3 * Math.PI) / 4)
    expect(v3.slope).toBe((5 * Math.PI) / 4)
    expect(v4.slope).toBe((7 * Math.PI) / 4)
  })
  it('Method normalize returns unit vector', function () {
    const v = new Vector(1, 1)
    const equals = EQ(v.normalize().length, 1.0)
    expect(equals).toBe(true)
  })
  it('Method normalize throw error on zero length vector', function () {
    const v = new Vector(0, 0)
    const fn = function () {
      v.normalize()
    }
    expect(fn).toThrow(Errors.ZERO_DIVISION.message)
  })
  it('Method rotate returns new vector rotated by given angle, positive angle defines rotation in counterclockwise direction', function () {
    const vector = new Vector(1, 1)
    const angle = Math.PI / 2
    const rotatedVector = vector.rotate(angle)
    const expectedVector = new Vector(-1, 1)
    const equals = rotatedVector.equalTo(expectedVector)
    expect(equals).toBe(true)
  })
  it('Method rotate rotates clockwise when angle is negative', function () {
    const vector = new Vector(1, 1)
    const angle = -Math.PI / 2
    const rotatedVector = vector.rotate(angle)
    const expectedVector = new Vector(1, -1)
    const equals = rotatedVector.equalTo(expectedVector)
    expect(equals).toBe(true)
  })
  it('Method add return sum of two vectors', function () {
    const v1 = vector(2, 1)
    const v2 = vector(1, 2)
    expect(v1.add(v2)).toEqual({ x: 3, y: 3 })
  })
  it('Method subtract returns difference between two vectors', function () {
    const v1 = vector(2, 1)
    const v2 = vector(1, 2)
    expect(v1.subtract(v2)).toEqual({ x: 1, y: -1 })
  })
  it('Method invert returns inverted vector', function () {
    const v = new Vector(2, 1)
    expect(v.invert()).toEqual({ x: -2, y: -1 })
  })

  it('Method angle returns angle between two vectors', function () {
    const v = vector(3, 0)
    const v1 = vector(3, 3)
    const v2 = vector(0, 3)
    const v3 = vector(-3, 0)
    const v4 = vector(-3, -3)
    const v5 = vector(0, -3)
    const v6 = vector(3, -3)

    expect(EQ(v.angleTo(v), 0)).toBe(true)
    expect(EQ(v.angleTo(v1), Math.PI / 4)).toBe(true)
    expect(EQ(v.angleTo(v2), Math.PI / 2)).toBe(true)
    expect(EQ(v.angleTo(v3), Math.PI)).toBe(true)
    expect(EQ(v.angleTo(v4), (5 * Math.PI) / 4)).toBe(true)
    expect(EQ(v.angleTo(v5), (3 * Math.PI) / 2)).toBe(true)
    expect(EQ(v.angleTo(v6), (7 * Math.PI) / 4)).toBe(true)
  })
  it('Method projection returns new vector case 1', function () {
    const v1 = vector(3, 3)
    const v2 = vector(10, 0)
    expect(v1.projectionOn(v2)).toEqual({ x: 3, y: 0 })
  })
  it('Method projection returns new vector case 2', function () {
    const v1 = vector(-3, 3)
    const v2 = vector(10, 0)
    const vp = vector(-3, 0)
    expect(v1.projectionOn(v2).equalTo(vp)).toBe(true)
  })
  it('Method projection returns new vector case 3', function () {
    const v1 = vector(3, 3)
    const v2 = vector(-3, 3)
    const vp = vector(0, 0)
    expect(v1.projectionOn(v2).equalTo(vp)).toBe(true)
  })
})
