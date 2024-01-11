import * as Intersection from '../algorithms/intersection'
import { Shape } from './shape'
import { Matrix } from './matrix'
import { vector, Vector } from './vector'
import { Point } from './point'
import { Box } from './box'
import { EQ_0 } from '../utils/utils'
import { Errors } from '../utils/errors'
import { Distance } from '../algorithms/distance'
import { Segment } from './segment'
import { Circle } from './circle'
/**
 * Class representing a line
 * @type {Line}
 */
export class Line extends Shape<Line> {
  /**
   * Point a line passes through
   */
  pt: Point = new Point()
  /**
   * Normal vector to a line <br/>
   * Vector is normalized (length == 1)<br/>
   * Direction of the vector is chosen to satisfy inequality norm * p >= 0
   */
  norm: Vector = new Vector(0, 1)

  /**
   * @param args Line may be constructed by point and normal vector or by two points that a line passes through
   */
  constructor(
    ...args: [Point, Vector] | [Point, Point] | [Vector, Point] | []
  ) {
    super()

    if (args.length === 0) {
      return
    }

    if (args.length === 2) {
      const a1 = args[0]
      const a2 = args[1]

      if (a1 instanceof Point && a2 instanceof Point) {
        this.pt = a1
        this.norm = Line.points2norm(a1, a2)
        if (this.norm.dot(vector(this.pt.x, this.pt.y)) >= 0) {
          this.norm.invert()
        }
        return
      }

      if (a1 instanceof Point && a2 instanceof Vector) {
        if (EQ_0(a2.x) && EQ_0(a2.y)) {
          throw Errors.ILLEGAL_PARAMETERS
        }
        this.pt = a1.clone()
        this.norm = a2.clone()
        this.norm = this.norm.normalize()
        if (this.norm.dot(vector(this.pt.x, this.pt.y)) >= 0) {
          this.norm.invert()
        }
        return
      }

      if (a1 instanceof Vector && a2 instanceof Point) {
        if (EQ_0(a1.x) && EQ_0(a1.y)) {
          throw Errors.ILLEGAL_PARAMETERS
        }
        this.pt = a2.clone()
        this.norm = a1.clone()
        this.norm = this.norm.normalize()
        if (this.norm.dot(vector(this.pt.x, this.pt.y)) >= 0) {
          this.norm.invert()
        }
        return
      }
    }

    throw Errors.ILLEGAL_PARAMETERS
  }

  /**
   * Return new cloned instance of line
   * @returns cloned line
   */
  clone(): Line {
    return new Line(this.pt, this.norm)
  }

  /**
   * Line has no start point
   * @returns undefined
   */
  get start(): undefined {
    return undefined
  }

  /**
   * Line has no end point
   * @returns undefined
   */
  get end(): undefined {
    return undefined
  }

  /**
   * Line has infinite length
   * @returns positive infinity number
   */
  get length(): number {
    return Number.POSITIVE_INFINITY
  }

  /**
   * Line has infinite box
   * @returns infinite box
   */
  get box(): Box {
    return new Box(
      Number.NEGATIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
      Number.POSITIVE_INFINITY,
      Number.POSITIVE_INFINITY
    )
  }

  /**
   * Line has no middle point
   * @returns undefined
   */
  get middle(): undefined {
    return undefined
  }

  /**
   * Slope of the line - angle in radians between line and axe x from 0 to 2PI
   * @returns slope of the line
   */
  get slope(): number {
    const vec = new Vector(this.norm.y, -this.norm.x)
    return vec.slope
  }

  /**
   * Get coefficients [A,B,C] of a standard line equation in the form Ax + By = C
   * @code [A, B, C] = line.standard
   * @returns coefficients [A,B,C]
   */
  get standard(): [number, number, number] {
    const A = this.norm.x
    const B = this.norm.y
    const C = this.norm.dot(vector(this.pt.x, this.pt.y))
    return [A, B, C]
  }

  /**
   * Check if line is parallel to other line
   * @param l - line to check
   * @returns true if parallel or incident to other line
   */
  parallelTo(l: Line): boolean {
    return EQ_0(this.norm.cross(l.norm))
  }

  /**
   * Check if line is incident to other line
   * @param l - line to check
   * @returns Returns true if incident to other line
   */
  incidentTo(l: Line): boolean {
    return this.parallelTo(l) && this.pt.on(l)
  }

  /**
   * Check if point belongs to line
   * @param pt Query point
   * @returns true if point belongs to line
   */
  contains(pt: Point): boolean {
    if (this.pt.equalTo(pt)) {
      return true
    }
    /* Line contains point if vector to point is orthogonal to the line normal vector */
    const vec = new Vector(this.pt, pt)
    return EQ_0(this.norm.dot(vec))
  }

  /**
   * Return coordinate of the point that lies on the line in the transformed
   * coordinate system where center is the projection of the point(0,0) to
   * the line and axe y is collinear to the normal vector. <br/>
   * This method assumes that point lies on the line and does not check it
   * @param {Point} pt - point on a line
   * @returns {number}
   */
  coord(pt: Point): number {
    return vector(pt.x, pt.y).cross(this.norm)
  }

  /**
   * Returns array of intersection points
   * @param {Shape} shape - shape to intersect with
   * @returns {Point[]}
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  intersect(shape: Shape<any>): Point[] {
    if (shape instanceof Point) {
      return this.contains(shape) ? [shape] : []
    }

    if (shape instanceof Line) {
      return Intersection.intersectLine2Line(this, shape)
    }

    // if (shape instanceof Ray) {
    //   return Intersection.intersectRay2Line(shape, this)
    // }

    if (shape instanceof Circle) {
      return Intersection.intersectLine2Circle(this, shape)
    }

    // if (shape instanceof Box) {
    //   return Intersection.intersectLine2Box(this, shape)
    // }

    // if (shape instanceof Segment) {
    //   return Intersection.intersectSegment2Line(shape, this)
    // }

    // if (shape instanceof Arc) {
    //   return Intersection.intersectLine2Arc(this, shape)
    // }

    // if (shape instanceof Polygon) {
    //   return Intersection.intersectLine2Polygon(this, shape)
    // }
    return []
  }

  /**
   * Calculate distance and shortest segment from line to shape and returns array [distance, shortest_segment]
   * @param {Shape} shape Shape of the one of the types Point, Circle, Segment, Arc, Polygon
   * @returns {[number, Segment]}
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  distanceTo(shape: Shape<any>): [number, Segment] {
    if (shape instanceof Point) {
      const [distance, shortestSegment] = Distance.point2line(shape, this)
      return [distance, shortestSegment.reverse()]
    }

    //   if (shape instanceof Circle) {
    //     let [distance, shortest_segment] = Distance.circle2line(shape, this)
    //     shortest_segment = shortest_segment.reverse()
    //     return [distance, shortest_segment]
    //   }

    //   if (shape instanceof Segment) {
    //     const [distance, shortest_segment] = Distance.segment2line(shape, this)
    //     return [distance, shortest_segment.reverse()]
    //   }

    //   if (shape instanceof Arc) {
    //     const [distance, shortest_segment] = Distance.arc2line(shape, this)
    //     return [distance, shortest_segment.reverse()]
    //   }

    //   if (shape instanceof Polygon) {
    //     const [distance, shortest_segment] = Distance.shape2polygon(this, shape)
    //     return [distance, shortest_segment]
    //   }

    throw Errors.OPERATION_IS_NOT_SUPPORTED
  }

  // /**
  //  * Split line with a point or array of points and return array of shapes
  //  * Assumed (but not checked) that all points lay on the line
  //  * @param {Point | Point[]} pt
  //  * @returns {MultilineShapes}
  //  */
  // split(pt) {
  //   if (pt instanceof Point) {
  //     return [new Ray(pt, this.norm.invert()), new Ray(pt, this.norm)]
  //   } else {
  //     const multiline = new Multiline([this])
  //     const sorted_points = this.sortPoints(pt)
  //     multiline.split(sorted_points)
  //     return multiline.toShapes()
  //   }
  // }

  /**
   * Rotate line by angle and center point.
   * @param angle - angle in radians
   * @param center - center of rotation
   * @returns rotated line
   */
  rotate(angle: number, center = new Point()): Line {
    return new Line(this.pt.rotate(angle, center), this.norm.rotate(angle))
  }

  /**
   * Transform line with given affine transformation matrix.
   * @param {Matrix} m affine transformation matrix (a,b,c,d,tx,ty)
   * @returns {Line} transformed line
   */
  transform(m: Matrix): Line {
    return new Line(this.pt.transform(m), this.norm.clone())
  }

  /**
   * Sort given array of points that lay on a line with respect to coordinate on a line
   * The method assumes that points lay on the line and does not check this
   * @param pts array of points
   * @returns new array sorted
   */
  sortPoints(pts: Point[]): Point[] {
    return pts.slice().sort((pt1, pt2) => {
      if (this.coord(pt1) < this.coord(pt2)) {
        return -1
      }
      if (this.coord(pt1) > this.coord(pt2)) {
        return 1
      }
      return 0
    })
  }

  get name() {
    return 'line'
  }
  static points2norm(pt1: Point, pt2: Point) {
    if (pt1.equalTo(pt2)) {
      throw Errors.ILLEGAL_PARAMETERS
    }
    const vec = new Vector(pt1, pt2)
    const unit = vec.normalize()
    return unit.rotate90CCW()
  }
}

/**
 * Function to create line equivalent to "new" constructor
 * @param args
 */
export const line = (
  ...args: [Point, Vector] | [Point, Point] | [Vector, Point] | []
) => new Line(...args)
