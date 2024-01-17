import { EQ, EQ_0 } from '../utils/utils'
import { Circle } from './circle'
import { Line } from './line'
import { Point } from './point'
import { Vector } from './vector'

/**
 * Class Inversion represent operator of inversion in circle
 * Inversion is a transformation of the Euclidean plane that maps generalized circles
 * (where line is considered as a circle with infinite radius) into generalized circles
 * See also https://en.wikipedia.org/wiki/Inversive_geometry and
 * http://mathworld.wolfram.com/Inversion.html <br/>
 * @type {Inversion}
 */
export class Inversion {
  /**
   *
   */
  circle: Circle
  /**
   * Inversion constructor
   * @param circle inversion circle
   */
  constructor(circle: Circle) {
    this.circle = circle
  }

  /**
   *
   * @param inversionCircle
   * @param point
   * @returns
   */
  static inversePoint(inversionCircle: Circle, point: Point) {
    const v = new Vector(inversionCircle.pc, point)
    const k2 = inversionCircle.r * inversionCircle.r
    const len2 = v.dot(v)
    const reflectedPoint = EQ_0(len2)
      ? new Point(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY)
      : inversionCircle.pc.translate(v.multiply(k2 / len2))
    return reflectedPoint
  }

  static inverseCircle(inversionCircle: Circle, circle: Circle) {
    const dist = inversionCircle.pc.distanceTo(circle.pc)[0]
    if (EQ(dist, circle.r)) {
      // Circle passing through inversion center mapped into line
      const d = inversionCircle.r ** 2 / (2 * circle.r)
      let v = new Vector(inversionCircle.pc, circle.pc)
      v = v.normalize()
      const pt = inversionCircle.pc.translate(v.multiply(d))

      return new Line(pt, v)
    } else {
      // Circle not passing through inversion center - map into another circle */
      /* Taken from http://mathworld.wolfram.com */
      const v = new Vector(inversionCircle.pc, circle.pc)
      const s = inversionCircle.r ** 2 / (v.dot(v) - circle.r ** 2)
      const pc = inversionCircle.pc.translate(v.multiply(s))
      const r = Math.abs(s) * circle.r

      return new Circle(pc, r)
    }
  }

  static inverseLine(inversionCircle: Circle, line: Line) {
    const [dist, shortestSegment] = inversionCircle.pc.distanceTo(line)
    if (EQ_0(dist)) {
      // Line passing through inversion center, is mapping to itself
      return line.clone()
    } else {
      // Line not passing through inversion center is mapping into circle
      const r = inversionCircle.r ** 2 / (2 * dist)
      let v = new Vector(inversionCircle.pc, shortestSegment.end)
      v = v.multiply(r / dist)
      return new Circle(inversionCircle.pc.translate(v), r)
    }
  }

  inverse(shape: Point | Circle | Line) {
    if (shape instanceof Point) {
      return Inversion.inversePoint(this.circle, shape)
    } else if (shape instanceof Circle) {
      return Inversion.inverseCircle(this.circle, shape)
    } else if (shape instanceof Line) {
      return Inversion.inverseLine(this.circle, shape)
    }
  }
}
