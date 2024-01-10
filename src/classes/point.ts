import { Shape } from './shape'
import { Errors } from '../utils/errors'
import { Box } from './box'
import { Matrix } from './matrix'
import { LT, EQ, EQ_0 } from '../utils/utils'
import { SimplePoint } from './types'
// import { Vector } from './vector'

/**
 *
 * Class representing a point
 * @type {Point}
 */
export class Point extends Shape<Point> implements SimplePoint {
  /**
   * x-coordinate of a point (float number)
   * @type {number}
   */
  x: number = 0

  /**
   * y-coordinate of a point (float number)
   * @type {number}
   */
  y: number = 0

  /**
   * Point may be constructed by two numbers, or by array of two numbers
   * @param args - array of two numbers or two numbers
   */
  constructor(...args: [[number, number]] | [number, number] | []) {
    super()

    this.x = 0
    this.y = 0

    // return zero point
    if (args.length === 0) {
      return
    }

    // return point from a number array
    if (args.length === 1 && args[0] instanceof Array && args[0].length === 2) {
      const arr = args[0]
      if (typeof arr[0] == 'number' && typeof arr[1] == 'number') {
        this.x = arr[0]
        this.y = arr[1]
        return
      }
    }

    // return point from two numbers
    if (args.length === 2) {
      if (typeof args[0] == 'number' && typeof args[1] == 'number') {
        this.x = args[0]
        this.y = args[1]
        return
      }
    }
    throw Errors.ILLEGAL_PARAMETERS
  }

  /**
   * Returns
   * @returns bounding box of a point
   */
  get box(): Box {
    return new Box(this.x, this.y, this.x, this.y)
  }

  /**
   * Return new cloned instance of point
   * @returns {Point}
   */
  clone(): Point {
    return new Point(this.x, this.y)
  }

  get vertices(): Point[] {
    return [this.clone()]
  }

  /**
   * Returns true if points are equal up to [DP_TOL]{@link DP_TOL} tolerance
   * @param pt Query point
   * @returns
   */
  equalTo(pt: Point): boolean {
    return EQ(this.x, pt.x) && EQ(this.y, pt.y)
  }

  /**
   * Defines predicate "less than" between points. Returns true if the point is less than query points, false otherwise <br/>
   * By definition point1 < point2 if {point1.y < point2.y || point1.y == point2.y && point1.x < point2.x <br/>
   * Numeric values compared with [DP_TOL]{@link DP_TOL} tolerance
   * @param pt Query point
   * @returns
   */
  lessThan(pt: Point): boolean {
    if (LT(this.y, pt.y)) return true
    if (EQ(this.y, pt.y) && LT(this.x, pt.x)) return true
    return false
  }

  /**
   * Return new point transformed by affine transformation matrix
   * @param m - affine transformation matrix (a,b,c,d,tx,ty)
   * @returns Transformed point
   */
  transform(m: Matrix): Point {
    return new Point(m.transform([this.x, this.y]))
  }

  //   /**
  //    * Returns projection point on given line
  //    * @param {Line} line Line this point be projected on
  //    * @returns {Point}
  //    */
  //   projectionOn(line) {
  //     if (this.equalTo(line.pt))
  //       // this point equal to line anchor point
  //       return this.clone()

  //     const vec = new Vector(this, line.pt)
  //     if (EQ_0(vec.cross(line.norm)))
  //       // vector to point from anchor point collinear to normal vector
  //       return line.pt.clone()

  //     const dist = vec.dot(line.norm) // signed distance
  //     const proj_vec = line.norm.multiply(dist)
  //     return this.translate(proj_vec)
  //   }

  //   /**
  //    * Returns true if point belongs to the "left" semi-plane, which means, point belongs to the same semi plane where line normal vector points to
  //    * Return false if point belongs to the "right" semi-plane or to the line itself
  //    * @param {Line} line Query line
  //    * @returns {boolean}
  //    */
  //   leftTo(line) {
  //     const vec = new Vector(line.pt, this)
  //     const onLeftSemiPlane = GT(vec.dot(line.norm), 0)
  //     return onLeftSemiPlane
  //   }

  /**
   * Calculate distance and shortest segment from point to shape and return as array [distance, shortest segment]
   * @param {Shape} shape Shape of the one of supported types Point, Line, Circle, Segment, Arc, Polygon or Planar Set
   * @returns {number} distance from point to shape
   * @returns {Segment} shortest segment between point and shape (started at point, ended at shape)
   */
  //   distanceTo(shape) {
  //     if (shape instanceof Point) {
  //       const dx = shape.x - this.x
  //       const dy = shape.y - this.y
  //       return [Math.sqrt(dx * dx + dy * dy), new Flatten.Segment(this, shape)]
  //     }

  //     if (shape instanceof Flatten.Line) {
  //       return Flatten.Distance.point2line(this, shape)
  //     }

  //     if (shape instanceof Flatten.Circle) {
  //       return Flatten.Distance.point2circle(this, shape)
  //     }

  //     if (shape instanceof Flatten.Segment) {
  //       return Flatten.Distance.point2segment(this, shape)
  //     }

  //     if (shape instanceof Flatten.Arc) {
  //       return Flatten.Distance.point2arc(this, shape)
  //     }

  //     if (shape instanceof Flatten.Polygon) {
  //       return Flatten.Distance.point2polygon(this, shape)
  //     }

  //     if (shape instanceof Flatten.PlanarSet) {
  //       return Flatten.Distance.shape2planarSet(this, shape)
  //     }
  //   }

  /**
   * Returns true if point is on a shape, false otherwise
   * @param {Shape} shape
   * @returns {boolean}
   */
  //   on(shape) {
  //     if (shape instanceof Flatten.Point) {
  //       return this.equalTo(shape)
  //     }

  //     if (shape instanceof Flatten.Box) {
  //       return shape.contains(this)
  //     }

  //     if (shape instanceof Flatten.Line) {
  //       return shape.contains(this)
  //     }

  //     if (shape instanceof Flatten.Ray) {
  //       return shape.contains(this)
  //     }

  //     if (shape instanceof Flatten.Circle) {
  //       return shape.contains(this)
  //     }

  //     if (shape instanceof Flatten.Segment) {
  //       return shape.contains(this)
  //     }

  //     if (shape instanceof Flatten.Arc) {
  //       return shape.contains(this)
  //     }

  //     if (shape instanceof Flatten.Polygon) {
  //       return shape.contains(this)
  //     }
  //   }

  get name() {
    return 'point'
  }
}

/**
 * Function to create point equivalent to "new" constructor
 * @param args
 */
export const point = (...args: [[number, number]] | [number, number] | []) =>
  new Point(...args)
