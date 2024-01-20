import * as Intersection from '../algorithms/intersection'
import { Shape } from './shape'
import { Matrix } from './matrix'
import { Point } from './point'
import { Box } from './box'
import { Distance } from '../algorithms/distance'
import { Arc } from './arc'
import { Segment } from './segment'
import { Line } from './line'
import { LE } from '../utils/utils'
import { Errors } from '../utils/errors'
import { Polygon } from './polygon'
import { PlanarSet } from '../algorithms/structures/planarSet'

/**
 * Class representing a circle
 * @type {Circle}
 */
export class Circle extends Shape<Circle> {
  /**
   * Circle center
   */
  pc: Point = new Point()
  /**
   * Circle radius
   */
  r: number = 1

  /**
   * @param args Arc may be constructed [pc, r].
   * @param {Point} pc - circle center point
   * @param {number} r - circle radius
   */
  constructor(...args: [Point, number] | [Point] | [number]) {
    super()

    if (args.length <= 2) {
      const [pc, r] = [...args]
      if (pc && pc instanceof Point) this.pc = pc.clone()
      if (r !== undefined) this.r = r
      return
    }
    throw Errors.ILLEGAL_PARAMETERS
  }

  /**
   * Return new cloned instance of circle
   * @returns cloned circle
   */
  clone(): Circle {
    return new Circle(this.pc.clone(), this.r)
  }

  /**
   * Circle center
   * @returns center point
   */
  get center(): Point {
    return this.pc
  }

  /**
   * Circle bounding box
   * @returns bounding box
   */
  get box(): Box {
    return new Box(
      this.pc.x - this.r,
      this.pc.y - this.r,
      this.pc.x + this.r,
      this.pc.y + this.r
    )
  }

  /**
   * Return true if circle contains shape: no point of shape lies outside of the circle
   * @param {Shape} shape - test shape
   * @returns {boolean}
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contains(shape: Shape<any>): boolean {
    if (shape instanceof Point) {
      return LE(shape.distanceTo(this.center)[0], this.r)
    }

    if (shape instanceof Segment) {
      return (
        LE(shape.start.distanceTo(this.center)[0], this.r) &&
        LE(shape.end.distanceTo(this.center)[0], this.r)
      )
    }

    if (shape instanceof Arc) {
      return (
        this.intersect(shape).length === 0 &&
        LE(shape.start.distanceTo(this.center)[0], this.r) &&
        LE(shape.end.distanceTo(this.center)[0], this.r)
      )
    }

    if (shape instanceof Circle) {
      return (
        this.intersect(shape).length === 0 &&
        LE(shape.r, this.r) &&
        LE(shape.center.distanceTo(this.center)[0], this.r)
      )
    }
    throw Errors.OPERATION_IS_NOT_SUPPORTED

    /* TODO: box, polygon */
  }

  /**
   * Transform circle to closed arc
   * @param counterclockwise
   * @returns transformed arc
   */
  toArc(counterclockwise: boolean = true): Arc {
    return new Arc(this.center, this.r, Math.PI, -Math.PI, counterclockwise)
  }

  /**
   * Method scale is supported only for uniform scaling of the circle with (0,0) center
   * @param sx
   * @param sy
   * @returns scaled Circle
   */
  scale(sx: number, sy: number): Circle {
    if (sx !== sy) throw Errors.OPERATION_IS_NOT_SUPPORTED
    if (!(this.pc.x === 0.0 && this.pc.y === 0.0))
      throw Errors.OPERATION_IS_NOT_SUPPORTED
    return new Circle(this.pc, this.r * sx)
  }

  /**
   * Get transformed circle using affine transformation matrix
   * @param matrix - affine transformation matrix
   * @returns transformed circle
   */
  transform(matrix: Matrix = new Matrix()): Circle {
    return new Circle(this.pc.transform(matrix), this.r)
  }

  /**
   * Returns array of intersection points between circle and other shape
   * @param {Shape} shape Shape of the one of supported types
   * @returns {Point[]}
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  intersect(shape: Shape<any>): Point[] {
    if (shape instanceof Point) {
      return this.contains(shape) ? [shape] : []
    }
    if (shape instanceof Line) {
      return Intersection.intersectLine2Circle(shape, this)
    }
    // if (shape instanceof Ray) {
    //   return Intersection.intersectRay2Circle(shape, this)
    // }
    if (shape instanceof Segment) {
      return Intersection.intersectSegment2Circle(shape, this)
    }

    if (shape instanceof Circle) {
      return Intersection.intersectCircle2Circle(shape, this)
    }

    if (shape instanceof Box) {
      return Intersection.intersectCircle2Box(this, shape)
    }

    if (shape instanceof Arc) {
      return Intersection.intersectArc2Circle(shape, this)
    }
    if (shape instanceof Polygon) {
      return Intersection.intersectCircle2Polygon(this, shape)
    }
    throw Errors.OPERATION_IS_NOT_SUPPORTED
  }

  /**
   * Calculate distance and shortest segment from circle to shape and return array [distance, shortest segment]
   * @param shape Shape of the one of supported types Point, Line, Circle, Segment, Arc, Polygon or Planar Set
   * @returns distance from circle to shape and shortest segment between circle and shape (started at circle, ended at shape)
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  distanceTo(shape: Shape<any> | Polygon): [number, Segment] {
    if (shape instanceof Point) {
      const [distance, shortestSegment] = Distance.point2circle(shape, this)
      return [distance, shortestSegment.reverse()]
    }

    if (shape instanceof Circle) {
      const [distance, shortestSegment] = Distance.circle2circle(this, shape)
      return [distance, shortestSegment]
    }

    if (shape instanceof Line) {
      const [distance, shortestSegment] = Distance.circle2line(this, shape)
      return [distance, shortestSegment]
    }

    if (shape instanceof Segment) {
      const [distance, shortestSegment] = Distance.segment2circle(shape, this)
      return [distance, shortestSegment.reverse()]
    }

    if (shape instanceof Arc) {
      const [distance, shortestSegment] = Distance.arc2circle(shape, this)
      return [distance, shortestSegment.reverse()]
    }

    if (shape instanceof Polygon) {
      const [distance, shortestSegment] = Distance.shape2polygon(this, shape)
      return [distance, shortestSegment]
    }

    if (shape instanceof PlanarSet) {
      const [dist, shortestSegment] = Distance.shape2planarSet(this, shape)
      return [dist, shortestSegment]
    }
    throw Errors.OPERATION_IS_NOT_SUPPORTED
  }

  get name() {
    return 'circle'
  }
}

/**
 * Shortcut to create new circle
 * @param args
 */
export const circle = (...args: [Point, number] | [Point] | [number]) =>
  new Circle(...args)
