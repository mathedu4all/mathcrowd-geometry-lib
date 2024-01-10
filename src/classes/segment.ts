import * as Intersection from '../algorithms/intersection'
import { Distance } from '../algorithms/distance'
import { Shape } from './shape'
import { Point } from './point'
import { Vector } from './vector'
import { Box } from './box'
import { Matrix } from './matrix'
import { Line } from './line'
import { EQ_0 } from '../utils/utils'
import { Errors } from '../utils/errors'

/**
 * Class representing a segment
 * @type {Segment}
 */
export class Segment extends Shape<Segment> {
  /**
   * Start point
   */
  ps = new Point()
  /**
   * End Point
   */
  pe = new Point()
  /**
   *
   * @param args Segment may be constructed by two points, or by array of four numbers, or by four numbers
   */
  constructor(
    ...args:
      | [Point, Point]
      | [number, number, number, number]
      | [[number, number, number, number]]
      | []
  ) {
    super()

    this.ps = new Point()

    this.pe = new Point()

    if (args.length === 0) {
      return
    }

    if (args.length === 1 && args[0] instanceof Array && args[0].length === 4) {
      const coords = args[0]
      this.ps = new Point(coords[0], coords[1])
      this.pe = new Point(coords[2], coords[3])
      return
    }

    if (
      args.length === 2 &&
      args[0] instanceof Point &&
      args[1] instanceof Point
    ) {
      this.ps = args[0]
      this.pe = args[1]
      return
    }

    if (args.length === 4) {
      this.ps = new Point(args[0], args[1])
      this.pe = new Point(args[2], args[3])
      return
    }

    throw Errors.ILLEGAL_PARAMETERS
  }

  /**
   * Return new cloned instance of segment
   * @returns {Segment}
   */
  clone(): Segment {
    return new Segment(this.start, this.end)
  }

  /**
   * Start point
   * @returns start point
   */
  get start(): Point {
    return this.ps
  }

  /**
   * End point
   * @returns end point
   */
  get end(): Point {
    return this.pe
  }

  /**
   * Start and end point of the segment
   * @returns array of start and end point
   */
  get vertices(): [Point, Point] {
    return [this.ps.clone(), this.pe.clone()]
  }

  /**
   * Length of a segment
   * @returns length of a segment
   */
  get length(): number {
    const [dist] = this.start.distanceTo(this.end) as [number, Segment]
    return dist
  }

  /**
   * Slope of the line - angle to axe x in radians from 0 to 2PI
   * @returns slope in radians from 0 to 2PI
   */
  get slope(): number {
    const vec = new Vector(this.start, this.end)
    return vec.slope
  }

  /**
   * Bounding box
   * @returns bounding box of a segment
   */
  get box(): Box {
    return new Box(
      Math.min(this.start.x, this.end.x),
      Math.min(this.start.y, this.end.y),
      Math.max(this.start.x, this.end.x),
      Math.max(this.start.y, this.end.y)
    )
  }

  /**
   * Check if segment is equal to other segment
   * @param seg query segment
   * @returns  true if equals to query segment, false otherwise
   */
  equalTo(seg: Segment): boolean {
    return this.ps.equalTo(seg.ps) && this.pe.equalTo(seg.pe)
  }

  /**
   * Check if segment contains point
   * @param pt Query point
   * @returns true if segment contains point
   */
  contains(pt: Point): boolean {
    const [dist] = this.distanceTo(pt)
    return EQ_0(dist)
  }

  /**
   * Returns array of intersection points between segment and other shape
   * @param shape Shape of the one of supported types <br/>
   * @returns {Point[]}
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  intersect(shape: Shape<any>): Point[] {
    if (shape instanceof Point) {
      return this.contains(shape) ? [shape] : []
    }

    if (shape instanceof Line) {
      return Intersection.intersectSegment2Line(this, shape)
    }

    // if (shape instanceof Ray) {
    //   return Intersection.intersectRay2Segment(shape, this)
    // }

    if (shape instanceof Segment) {
      return Intersection.intersectSegment2Segment(this, shape)
    }

    // if (shape instanceof Circle) {
    //   return Intersection.intersectSegment2Circle(this, shape)
    // }

    // if (shape instanceof Box) {
    //   return Intersection.intersectSegment2Box(this, shape)
    // }

    // if (shape instanceof Arc) {
    //   return Intersection.intersectSegment2Arc(this, shape)
    // }

    // if (shape instanceof Polygon) {
    //   return Intersection.intersectSegment2Polygon(this, shape)
    // }

    return []
  }

  /**
   * Calculate distance and shortest segment from segment to shape and return as array [distance, shortest segment]
   * @param  shape Shape of the one of supported types Point, Line, Circle, Segment, Arc, Polygon or Planar Set
   * @returns distance from segment to shape and shortest segment between segment and shape (started at segment, ended at shape)
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  distanceTo(shape: Shape<any>): [number, Segment] {
    if (shape instanceof Point) {
      const [dist, shortestSegment] = Distance.point2segment(shape, this)
      return [dist, shortestSegment.reverse()]
    }
    // if (shape instanceof Circle) {
    //   const [dist, shortest_segment] = Distance.segment2circle(this, shape)
    //   return [dist, shortest_segment]
    // }
    if (shape instanceof Line) {
      const [dist, shortestSegment] = Distance.segment2line(this, shape)
      return [dist, shortestSegment]
    }
    if (shape instanceof Segment) {
      const [dist, shortestSegment] = Distance.segment2segment(this, shape)
      return [dist, shortestSegment]
    }
    // if (shape instanceof Arc) {
    //   const [dist, shortest_segment] = Distance.segment2arc(this, shape)
    //   return [dist, shortest_segment]
    // }
    // if (shape instanceof Polygon) {
    //   const [dist, shortest_segment] = Distance.shape2polygon(this, shape)
    //   return [dist, shortest_segment]
    // }
    // if (shape instanceof PlanarSet) {
    //   const [dist, shortest_segment] = Distance.shape2planarSet(this, shape)
    //   return [dist, shortest_segment]
    // }
    throw Errors.OPERATION_IS_NOT_SUPPORTED
  }

  /**
   * Get normalized vector of tagent line on start point
   * @returns unit vector in the direction from start to end
   */
  tangentInStart(): Vector {
    const vec = new Vector(this.start, this.end)
    return vec.normalize()
  }

  /**
   * Get normalized vector of tagent line on end point
   * @returns unit vector in the direction from end to start
   */
  tangentInEnd(): Vector {
    const vec = new Vector(this.end, this.start)
    return vec.normalize()
  }

  /**
   * Reverse segment
   * @returns {Segment} new segment with swapped start and end points
   */
  reverse(): Segment {
    return new Segment(this.end, this.start)
  }

  // /**
  //  * When point belongs to segment, return array of two segments split by given point,
  //  * if point is inside segment. Returns clone of this segment if query point is incident
  //  * to start or end point of the segment. Returns empty array if point does not belong to segment
  //  * @param {Point} pt Query point
  //  * @returns {Segment[]}
  //  */
  // split(pt) {
  //   if (this.start.equalTo(pt)) return [null, this.clone()]

  //   if (this.end.equalTo(pt)) return [this.clone(), null]

  //   return [new Segment(this.start, pt), new Segment(pt, this.end)]
  // }

  /**
   * Get middle point
   * @returns middle point of the segment
   */
  middle(): Point {
    return new Point(
      (this.start.x + this.end.x) / 2,
      (this.start.y + this.end.y) / 2
    )
  }

  /**
   * Get point at given length
   * @param length The length along the segment
   * @returns point at given length
   */
  pointAtLength(length: number): Point {
    if (length > this.length || length < 0) throw Errors.ILLEGAL_PARAMETERS
    if (length == 0) return this.start
    if (length == this.length) return this.end
    const factor = length / this.length
    return new Point(
      (this.end.x - this.start.x) * factor + this.start.x,
      (this.end.y - this.start.y) * factor + this.start.y
    )
  }

  /**
   * Calculate definite integral of the segment over y=ymin.
   * @param ymin
   * @returns definite integral
   */
  definiteIntegral(ymin = 0.0): number {
    const dx = this.end.x - this.start.x
    const dy1 = this.start.y - ymin
    const dy2 = this.end.y - ymin
    return (dx * (dy1 + dy2)) / 2
  }

  /**
   * Return new segment transformed using affine transformation matrix
   * @param matrix affine transformation matrix
   * @returns transformed segment
   */
  transform(matrix: Matrix = new Matrix()): Segment {
    return new Segment(this.ps.transform(matrix), this.pe.transform(matrix))
  }

  /**
   * Check if the segment's length is zero.
   * @returns true if segment start is equal to segment end up to DP_TOL
   */
  isZeroLength() {
    return this.ps.equalTo(this.pe)
  }

  /**
   * Sort given array of points from segment start to end, assuming all points lay on the segment
   * @param array of points
   * @returns  new array sorted
   */
  sortPoints(pts: Point[]): Point[] {
    const line = new Line(this.start, this.end)
    return line.sortPoints(pts)
  }

  get name() {
    return 'segment'
  }
}

/**
 * Shortcut method to create new segment
 */
export const segment = (
  ...args:
    | [Point, Point]
    | [number, number, number, number]
    | [[number, number, number, number]]
    | []
) => new Segment(...args)
