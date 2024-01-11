import { Shape } from './shape'
import { Errors } from '../utils/errors'
import { Matrix } from './matrix'
import { Point } from './point'
import { Segment } from './segment'

/**
 * Class Box represents bounding box of the shape.
 * It may also represent axis-aligned rectangle
 * @type {Box}
 */
export class Box extends Shape<Box> {
  /**
   * Minimal x coordinate
   */
  xmin: number
  /**
   * Minimal y coordinate
   */
  ymin: number
  /**
   * Maximal x coordinate
   */
  xmax: number
  /**
   * Maximal y coordinate
   */
  ymax: number

  /**
   *
   * @param xmin - minimal x coordinate
   * @param ymin - minimal y coordinate
   * @param xmax - maximal x coordinate
   * @param ymax - maximal y coordinate
   */
  constructor(
    xmin: number = Number.POSITIVE_INFINITY,
    ymin: number = Number.POSITIVE_INFINITY,
    xmax: number = Number.NEGATIVE_INFINITY,
    ymax: number = Number.NEGATIVE_INFINITY
  ) {
    super()

    this.xmin = xmin
    this.ymin = ymin
    this.xmax = xmax
    this.ymax = ymax
  }

  /**
   * Return new cloned instance of box
   * @returns {Box}
   */
  clone(): Box {
    return new Box(this.xmin, this.ymin, this.xmax, this.ymax)
  }

  /**
   * Property low need for interval tree interface
   * @returns left low corner of the box
   */
  get low(): Point {
    return new Point(this.xmin, this.ymin)
  }

  /**
   * Property high need for interval tree interface
   * @returns right high corner of the box
   */
  get high(): Point {
    return new Point(this.xmax, this.ymax)
  }

  /**
   * Property max returns the box itself !
   * @returns {Box}
   */
  get max(): Box {
    return this.clone()
  }

  /**
   * Return center of the box
   * @returns center point
   */
  get center(): Point {
    return new Point((this.xmin + this.xmax) / 2, (this.ymin + this.ymax) / 2)
  }

  /**
   * Return the width of the box
   * @returns width
   */
  get width(): number {
    return Math.abs(this.xmax - this.xmin)
  }

  /**
   * Return the height of the box
   * @returns height
   */
  get height(): number {
    return Math.abs(this.ymax - this.ymin)
  }

  /**
   * Return property box like all other shapes
   * @returns box itself
   */
  get box(): Box {
    return this.clone()
  }

  /**
   * Check whether the box is intersected with other box
   * @param otherBox other box to test
   * @returns true if not intersected with other box
   */
  notIntersect(otherBox: Box): boolean {
    return (
      this.xmax < otherBox.xmin ||
      this.xmin > otherBox.xmax ||
      this.ymax < otherBox.ymin ||
      this.ymin > otherBox.ymax
    )
  }

  /**
   * Check whether the box is intersected with other box
   * @param otherBox - Query box
   * @returns true if intersected with other box
   */
  intersect(otherBox: Box): boolean {
    return !this.notIntersect(otherBox)
  }

  /**
   * Returns new box merged with other box
   * @param otherBox - Other box to merge with
   * @returns merged box
   */
  merge(otherBox: Box): Box {
    return new Box(
      Math.min(this.xmin, otherBox.xmin),
      Math.min(this.ymin, otherBox.ymin),
      Math.max(this.xmax, otherBox.xmax),
      Math.max(this.ymax, otherBox.ymax)
    )
  }

  /**
   * Defines predicate "less than" between two boxes. Need for interval index
   * @param otherBox other box
   * @returns true if this box less than other box, false otherwise
   */
  lessThan(otherBox: Box): boolean {
    if (this.low.lessThan(otherBox.low)) return true
    if (this.low.equalTo(otherBox.low) && this.high.lessThan(otherBox.high))
      return true
    return false
  }

  /**
   * Returns true if this box is equal to other box, false otherwise
   * @param otherBox - query box
   * @returns true if equal, false otherwise
   */
  equalTo(otherBox: Box): boolean {
    return this.low.equalTo(otherBox.low) && this.high.equalTo(otherBox.high)
  }

  output(): Box {
    return this.clone()
  }

  static comparableMax(box1: Box, box2: Box) {
    return box1.merge(box2)
  }

  static comparableLessThan(pt1: Box, pt2: Box): boolean {
    return pt1.lessThan(pt2)
  }

  /**
   * Set new values to the box object
   */
  set(
    xmin: number = Number.POSITIVE_INFINITY,
    ymin: number = Number.POSITIVE_INFINITY,
    xmax: number = Number.NEGATIVE_INFINITY,
    ymax: number = Number.NEGATIVE_INFINITY
  ) {
    this.xmin = xmin
    this.ymin = ymin
    this.xmax = xmax
    this.ymax = ymax
  }

  /**
   * Transform box into array of points from low left corner in counterclockwise
   * @returns {Point[]}
   */
  toPoints(): Point[] {
    return [
      new Point(this.xmin, this.ymin),
      new Point(this.xmax, this.ymin),
      new Point(this.xmax, this.ymax),
      new Point(this.xmin, this.ymax)
    ]
  }

  /**
   * Transform box into array of segments from low left corner in counterclockwise
   * @returns
   */
  toSegments(): Segment[] {
    const pts = this.toPoints()
    return [
      new Segment(pts[0], pts[1]),
      new Segment(pts[1], pts[2]),
      new Segment(pts[2], pts[3]),
      new Segment(pts[3], pts[0])
    ]
  }

  /**
   * Box rotation is not supported
   * Attempt to rotate box throws error
   * @param angle in radians
   * @param center
   */
  rotate(_angle: number, _center: Point): Box {
    throw Errors.OPERATION_IS_NOT_SUPPORTED
  }

  /**
   * Return new box transformed using affine transformation matrix
   * New box is a bounding box of transformed corner points
   * @param m affine transformation matrix
   * @returns transformed box
   */
  transform(m = new Matrix()): Box {
    const transformedPoints = this.toPoints().map((pt) => pt.transform(m))
    return transformedPoints.reduce(
      (newBox, pt) => newBox.merge(pt.box),
      new Box()
    )
  }

  /**
   * Check if box contains shape: no point of shape lies outside the box
   * @param shape - test shape
   * @returns true if shape is contained, false otherwise
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contains(shape: Shape<any>): boolean {
    if (shape instanceof Point) {
      return (
        shape.x >= this.xmin &&
        shape.x <= this.xmax &&
        shape.y >= this.ymin &&
        shape.y <= this.ymax
      )
    }

    throw Errors.OPERATION_IS_NOT_SUPPORTED

    // if (shape instanceof Flatten.Segment) {
    //   return shape.vertices.every((vertex) => this.contains(vertex))
    // }

    // if (shape instanceof Box) {
    //   return shape.toSegments().every((segment) => this.contains(segment))
    // }

    // if (shape instanceof Flatten.Circle) {
    //   return this.contains(shape.box)
    // }

    // if (shape instanceof Flatten.Arc) {
    //   return (
    //     shape.vertices.every((vertex) => this.contains(vertex)) &&
    //     shape
    //       .toSegments()
    //       .every((segment) => intersectSegment2Arc(segment, shape).length === 0)
    //   )
    // }

    // if (shape instanceof Flatten.Line || shape instanceof Flatten.Ray) {
    //   return false
    // }

    // if (shape instanceof Flatten.Multiline) {
    //   return shape.toShapes().every((shape) => this.contains(shape))
    // }

    // if (shape instanceof Flatten.Polygon) {
    //   return this.contains(shape.box)
    // }
  }

  get name() {
    return 'box'
  }
}

/**
 * Shortcut to create new box
 * @param args
 */
export const box = (
  xmin: number = Number.POSITIVE_INFINITY,
  ymin: number = Number.POSITIVE_INFINITY,
  xmax: number = Number.NEGATIVE_INFINITY,
  ymax: number = Number.NEGATIVE_INFINITY
) => new Box(xmin, ymin, xmax, ymax)
