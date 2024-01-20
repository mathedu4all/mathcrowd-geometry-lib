import * as Intersection from '../algorithms/intersection'
import { Shape } from './shape'
import { Errors } from '../utils/errors'
import { Point } from './point'
import { Vector } from './vector'
import { Box } from './box'
import { Segment } from './segment'
import { Arc } from './arc'
import { Line } from './line'
import { Circle } from './circle'
import { Matrix } from './matrix'
import { EQ_0, GE } from '../utils/utils'
import { Polygon } from './polygon'

/**
 * Class representing a ray (a half-infinite line).
 * @type {Ray}
 */
export class Ray extends Shape<Ray> {
  /**
   * Start point
   */
  pt: Point = new Point()

  /**
   * Normal vector
   */
  norm: Vector = new Vector(0, 1)

  /**
   * Ray may be constructed by setting an <b>origin</b> point and a <b>normal</b> vector, so that any point <b>x</b>
   * on a ray fit an equation: <br />
   *  (<b>x</b> - <b>origin</b>) * <b>vector</b> = 0 <br />
   * Ray defined by constructor is a right semi-infinite line with respect to the normal vector <br/>
   * If normal vector is omitted ray is considered horizontal (normal vector is (0,1)). <br/>
   * Don't be confused: direction of the normal vector is orthogonal to the ray <br/>
   * @param args
   */
  constructor(...args: [Point, Vector] | [Point] | []) {
    super()

    if (args.length === 0) {
      return
    }

    if (args.length >= 1 && args[0] instanceof Point) {
      this.pt = args[0].clone()
    }

    if (args.length === 1) {
      return
    }

    if (args.length === 2 && args[1] instanceof Vector) {
      this.norm = args[1].clone()
      return
    }

    throw Errors.ILLEGAL_PARAMETERS
  }

  /**
   * Return new cloned instance of ray
   * @returns {Ray}
   */
  clone(): Ray {
    return new Ray(this.pt, this.norm)
  }

  /**
   * Slope of the ray - angle in radians between ray and axe x from 0 to 2PI
   * @returns slope of the line
   */
  get slope(): number {
    const vec = new Vector(this.norm.y, -this.norm.x)
    return vec.slope
  }

  /**
   * Returns half-infinite bounding box of the ray
   * @returns Bounding box
   */
  get box(): Box {
    const slope = this.slope
    return new Box(
      slope > Math.PI / 2 && slope < (3 * Math.PI) / 2
        ? Number.NEGATIVE_INFINITY
        : this.pt.x,
      slope >= 0 && slope <= Math.PI ? this.pt.y : Number.NEGATIVE_INFINITY,
      slope >= Math.PI / 2 && slope <= (3 * Math.PI) / 2
        ? this.pt.x
        : Number.POSITIVE_INFINITY,
      (slope >= Math.PI && slope <= 2 * Math.PI) || slope === 0
        ? this.pt.y
        : Number.POSITIVE_INFINITY
    )
  }

  /**
   * Return ray start point
   * @returns Ray start point
   */
  get start(): Point {
    return this.pt
  }

  /**
   * Ray has no end point?
   * @returns
   */
  get end(): undefined {
    return undefined
  }

  /**
   * Return positive infinity number as length
   * @returns
   */
  get length(): number {
    return Number.POSITIVE_INFINITY
  }

  /**
   * Returns true if point belongs to ray
   * @param pt Query point
   * @returns
   */
  contains(pt: Point): boolean {
    if (this.pt.equalTo(pt)) {
      return true
    }
    /* Ray contains point if vector to point is orthogonal to the ray normal vector
            and cross product from vector to point is positive */
    const vec = new Vector(this.pt, pt)
    return EQ_0(this.norm.dot(vec)) && GE(vec.cross(this.norm), 0)
  }

  /**
   * Split ray with point and return array of segment and new ray
   * @param {Point} pt
   * @returns [Segment,Ray]
   */
  split(pt: Point): [Segment, Ray] | [] | [Ray] {
    if (!this.contains(pt)) return []

    if (this.pt.equalTo(pt)) {
      return [this]
    }

    return [new Segment(this.pt, pt), new Ray(pt, this.norm)]
  }

  /**
   * Returns array of intersection points between ray and another shape
   * @param shape - Shape to intersect with ray
   * @returns array of intersection points
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  intersect(shape: Shape<any>): Point[] {
    if (shape instanceof Point) {
      return this.contains(shape) ? [shape] : []
    }

    if (shape instanceof Segment) {
      return Intersection.intersectRay2Segment(this, shape)
    }

    if (shape instanceof Arc) {
      return Intersection.intersectRay2Arc(this, shape)
    }

    if (shape instanceof Line) {
      return Intersection.intersectRay2Line(this, shape)
    }

    if (shape instanceof Ray) {
      return Intersection.intersectRay2Ray(this, shape)
    }

    if (shape instanceof Circle) {
      return Intersection.intersectRay2Circle(this, shape)
    }

    if (shape instanceof Box) {
      return Intersection.intersectRay2Box(this, shape)
    }

    if (shape instanceof Polygon) {
      return Intersection.intersectRay2Polygon(this, shape)
    }

    throw Errors.OPERATION_IS_NOT_SUPPORTED
  }

  /**
   * Return new line rotated by angle
   * @param angle - angle in radians
   * @param center - center of rotation
   */
  rotate(angle: number, center: Point = new Point()): Ray {
    return new Ray(this.pt.rotate(angle, center), this.norm.rotate(angle))
  }

  /**
   * Return new ray transformed by affine transformation matrix
   * @param {Matrix} m - affine transformation matrix (a,b,c,d,tx,ty)
   * @returns {Ray}
   */
  transform(m: Matrix): Ray {
    return new Ray(this.pt.transform(m), this.norm.clone())
  }

  get name() {
    return 'ray'
  }
}

export const ray = (...args: [Point, Vector] | [Point] | []) => new Ray(...args)
