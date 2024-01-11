import * as Intersection from '../algorithms/intersection'
import { Shape } from './shape'
import { Point } from './point'
import { CCW, PIx2 } from '../utils/constants'
import { Errors } from '../utils/errors'
import { EQ, EQ_0, GT, LE, LT } from '../utils/utils'
import { Box } from './box'
import { Vector, vector } from './vector'
import { Line } from './line'
import { Segment } from './segment'
import { Distance } from '../algorithms/distance'
import { Matrix } from './matrix'
import { Circle } from './circle'

/**
 * Class representing a circular arc
 * @type {Arc}
 */
export class Arc extends Shape<Arc> {
  /**
   * Arc center
   */
  pc: Point = new Point()
  /**
   * Arc radius
   */
  r: number = 1
  /**
   * Arc start angle in radians
   */
  startAngle: number = 0
  /**
   * Arc end angle in radians
   */
  endAngle: number = 2 * Math.PI
  /**
   * Arc orientation
   */
  counterClockwise: boolean = CCW

  /**
   *
   * @param args Arc may be constructed [pc, r, startAngle, endAngle, counterClockWise].
   * @param {Point} pc - arc center
   * @param {number} r - arc radius
   * @param {number} startAngle - start angle in radians from 0 to 2*PI
   * @param {number} endAngle - end angle in radians from 0 to 2*PI
   * @param {boolean} counterClockwise - arc direction, true - clockwise, false - counterclockwise
   */
  constructor(
    ...args:
      | []
      | [Point, number, number, number, boolean]
      | [Point, number, number, number]
  ) {
    super()

    if (args.length <= 5) {
      const [pc, r, startAngle, endAngle, counterClockwise] = [...args]
      if (pc && pc instanceof Point) this.pc = pc.clone()
      if (r !== undefined) this.r = r
      if (startAngle !== undefined) this.startAngle = startAngle
      if (endAngle !== undefined) this.endAngle = endAngle
      if (counterClockwise !== undefined)
        this.counterClockwise = counterClockwise
      return
    }

    throw Errors.ILLEGAL_PARAMETERS
  }

  /**
   * Return new cloned instance of arc
   * @returns {Arc} cloned arc
   */
  clone(): Arc {
    return new Arc(
      this.pc.clone(),
      this.r,
      this.startAngle,
      this.endAngle,
      this.counterClockwise
    )
  }

  /**
   * Get sweep angle in radians. Sweep angle is non-negative number from 0 to 2*PI
   * @returns sweep angle in radians
   */
  get sweep(): number {
    if (EQ(this.startAngle, this.endAngle)) return 0.0
    if (EQ(Math.abs(this.startAngle - this.endAngle), PIx2)) {
      return PIx2
    }
    let sweep
    if (this.counterClockwise) {
      sweep = GT(this.endAngle, this.startAngle)
        ? this.endAngle - this.startAngle
        : this.endAngle - this.startAngle + PIx2
    } else {
      sweep = GT(this.startAngle, this.endAngle)
        ? this.startAngle - this.endAngle
        : this.startAngle - this.endAngle + PIx2
    }

    if (GT(sweep, PIx2)) {
      sweep -= PIx2
    }
    if (LT(sweep, 0)) {
      sweep += PIx2
    }
    return sweep
  }

  /**
   * Get start point of arc
   * @returns start point of arc
   */
  get start(): Point {
    const p0 = new Point(this.pc.x + this.r, this.pc.y)
    return p0.rotate(this.startAngle, this.pc)
  }

  /**
   * Get end point of arc
   * @returns end point of arc
   */
  get end(): Point {
    const p0 = new Point(this.pc.x + this.r, this.pc.y)
    return p0.rotate(this.endAngle, this.pc)
  }

  /**
   * Get center of arc
   * @returns center of arc
   */
  get center(): Point {
    return this.pc.clone()
  }

  get vertices(): [Point, Point] {
    return [this.start.clone(), this.end.clone()]
  }

  /**
   * Get arc length
   * @returns arc length
   */
  get length(): number {
    return Math.abs(this.sweep * this.r)
  }

  /**
   * Get bounding box of the arc
   * @returns bounding box of the arc
   */
  get box(): Box {
    const funcArcs = this.breakToFunctional()
    const box = funcArcs.reduce(
      (acc, fArc) => acc.merge(fArc.start.box),
      new Box()
    )
    return box.merge(funcArcs[funcArcs.length - 1].end.box)
  }

  /**
   * Returns true if arc contains point, false otherwise
   * @param pt - point to test
   * @returns true if arc contains point, false otherwise
   */
  contains(pt: Point): boolean {
    // first check if  point on circle (pc,r)
    if (!EQ(this.pc.distanceTo(pt)[0], this.r)) return false

    // point on circle

    if (pt.equalTo(this.start)) return true

    const angle = new Vector(this.pc, pt).slope
    const testArc = new Arc(
      this.pc,
      this.r,
      this.startAngle,
      angle,
      this.counterClockwise
    )
    return LE(testArc.length, this.length)
  }

  // /**
  //  * When given point belongs to arc, return array of two arcs split by this point. If points is incident
  //  * to start or end point of the arc, return clone of the arc. If point does not belong to the arcs, return
  //  * empty array.
  //  * @param {Point} pt Query point
  //  * @returns {Arc[]}
  //  */
  // split(pt) {
  //   if (this.start.equalTo(pt)) return [null, this.clone()]

  //   if (this.end.equalTo(pt)) return [this.clone(), null]

  //   const angle = new Vector(this.pc, pt).slope

  //   return [
  //     new Arc(this.pc, this.r, this.startAngle, angle, this.counterClockwise),
  //     new Arc(this.pc, this.r, angle, this.endAngle, this.counterClockwise)
  //   ]
  // }

  /**
   * Get middle point of the arc
   * @returns middle point of the arc
   */
  middle(): Point {
    const endAngle = this.counterClockwise
      ? this.startAngle + this.sweep / 2
      : this.startAngle - this.sweep / 2
    const arc = new Arc(
      this.pc,
      this.r,
      this.startAngle,
      endAngle,
      this.counterClockwise
    )
    return arc.end
  }

  /**
   * Get point at given length
   * @param length - The length along the arc
   * @returns point at given length
   */
  pointAtLength(length: number): Point {
    if (length > this.length || length < 0) throw Errors.ILLEGAL_PARAMETERS
    if (length === 0) return this.start
    if (length === this.length) return this.end
    const factor = length / this.length
    const endAngle = this.counterClockwise
      ? this.startAngle + this.sweep * factor
      : this.startAngle - this.sweep * factor
    const arc = new Arc(
      this.pc,
      this.r,
      this.startAngle,
      endAngle,
      this.counterClockwise
    )
    return arc.end
  }

  /**
   * Returns chord height ("sagitta") of the arc
   * @returns
   */
  chordHeight(): number {
    return (1.0 - Math.cos(Math.abs(this.sweep / 2.0))) * this.r
  }

  /**
   * Get array of intersection points between arc and other shape
   * @param Shape of the one of supported types <br/>
   * @returns array of intersection points between arc and other shape
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  intersect(shape: Shape<any>): Point[] {
    if (shape instanceof Point) {
      return this.contains(shape) ? [shape] : []
    }
    if (shape instanceof Line) {
      return Intersection.intersectLine2Arc(shape, this)
    }
    // if (shape instanceof Ray) {
    //   return Intersection.intersectRay2Arc(shape, this)
    // }
    if (shape instanceof Circle) {
      return Intersection.intersectArc2Circle(this, shape)
    }
    if (shape instanceof Segment) {
      return Intersection.intersectSegment2Arc(shape, this)
    }
    // if (shape instanceof Box) {
    //   return Intersection.intersectArc2Box(this, shape)
    // }
    if (shape instanceof Arc) {
      return Intersection.intersectArc2Arc(this, shape)
    }
    // if (shape instanceof Polygon) {
    //   return Intersection.intersectArc2Polygon(this, shape)
    // }
    return []
  }

  /**
   * Calculate distance and shortest segment from arc to shape and return array [distance, shortest segment]
   * @param shape Shape of the one of supported types Point, Line, Circle, Segment, Arc, Polygon or Planar Set
   * @returns distance from arc to shape abd shortest segment between arc and shape (started at arc, ended at shape)
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  distanceTo(shape: Shape<any>): [number, Segment] {
    if (shape instanceof Point) {
      const [dist, shortestSegment] = Distance.point2arc(shape, this)
      return [dist, shortestSegment.reverse()]
    }

    if (shape instanceof Circle) {
      const [dist, shortestSegment] = Distance.arc2circle(this, shape)
      return [dist, shortestSegment]
    }

    if (shape instanceof Line) {
      const [dist, shortestSegment] = Distance.arc2line(this, shape)
      return [dist, shortestSegment]
    }

    if (shape instanceof Segment) {
      const [dist, shortestSegment] = Distance.segment2arc(shape, this)
      return [dist, shortestSegment.reverse()]
    }

    if (shape instanceof Arc) {
      const [dist, shortestSegment] = Distance.arc2arc(this, shape)
      return [dist, shortestSegment]
    }

    // if (shape instanceof Polygon) {
    //   const [dist, shortestSegment] = Distance.shape2polygon(this, shape)
    //   return [dist, shortestSegment]
    // }

    // if (shape instanceof PlanarSet) {
    //   const [dist, shortestSegment] = Distance.shape2planarSet(this, shape)
    //   return [dist, shortestSegment]
    // }
    throw Errors.OPERATION_IS_NOT_SUPPORTED
  }

  /**
   * Breaks arc in extreme point 0, pi/2, pi, 3*pi/2 and returns array of sub-arcs
   * @returns {Arc[]}
   */
  breakToFunctional(): Arc[] {
    const functionalArcs: Arc[] = []
    const angles = [0, Math.PI / 2, (2 * Math.PI) / 2, (3 * Math.PI) / 2]
    const pts = [
      this.pc.translate(this.r, 0),
      this.pc.translate(0, this.r),
      this.pc.translate(-this.r, 0),
      this.pc.translate(0, -this.r)
    ]

    // If arc contains extreme point,
    // create test arc started at start point and ended at this extreme point
    const testArcs = []
    for (let i = 0; i < 4; i++) {
      if (pts[i].on(this)) {
        testArcs.push(
          new Arc(
            this.pc,
            this.r,
            this.startAngle,
            angles[i],
            this.counterClockwise
          )
        )
      }
    }

    if (testArcs.length === 0) {
      // arc does contain any extreme point
      functionalArcs.push(this.clone())
    } else {
      // arc passes extreme point
      // sort these arcs by length
      testArcs.sort((arc1, arc2) => arc1.length - arc2.length)

      for (let i = 0; i < testArcs.length; i++) {
        const prevArc =
          functionalArcs.length > 0
            ? functionalArcs[functionalArcs.length - 1]
            : undefined
        let newArc
        if (prevArc) {
          newArc = new Arc(
            this.pc,
            this.r,
            prevArc.endAngle,
            testArcs[i].endAngle,
            this.counterClockwise
          )
        } else {
          newArc = new Arc(
            this.pc,
            this.r,
            this.startAngle,
            testArcs[i].endAngle,
            this.counterClockwise
          )
        }
        if (!EQ_0(newArc.length)) {
          functionalArcs.push(newArc.clone())
        }
      }

      // add last sub arc
      const prevArc =
        functionalArcs.length > 0
          ? functionalArcs[functionalArcs.length - 1]
          : undefined
      let newArc
      if (prevArc) {
        newArc = new Arc(
          this.pc,
          this.r,
          prevArc.endAngle,
          this.endAngle,
          this.counterClockwise
        )
      } else {
        newArc = new Arc(
          this.pc,
          this.r,
          this.startAngle,
          this.endAngle,
          this.counterClockwise
        )
      }
      // It could be 2*PI when occasionally start = 0 and end = 2*PI but this is not valid for breakToFunctional
      if (!EQ_0(newArc.length) && !EQ(newArc.sweep, 2 * Math.PI)) {
        functionalArcs.push(newArc.clone())
      }
    }
    return functionalArcs
  }

  /**
   * Get tangent unit vector on the start point
   * @returns tangent unit vector in the start point in the direction from start to end
   */
  tangentInStart(): Vector {
    const vec = new Vector(this.pc, this.start)
    const angle = this.counterClockwise ? Math.PI / 2 : -Math.PI / 2
    return vec.rotate(angle).normalize()
  }

  /**
   * Get tangent unit vector on the end point
   * @returns  tangent unit vector in the end point in the direction from end to start
   */
  tangentInEnd(): Vector {
    const vec = new Vector(this.pc, this.end)
    const angle = this.counterClockwise ? -Math.PI / 2 : Math.PI / 2
    return vec.rotate(angle).normalize()
  }

  /**
   * Get reversed arc, arc with swapped start and end angles and reversed direction
   * @returns {Arc} reversed arc
   */
  reverse(): Arc {
    return new Arc(
      this.pc,
      this.r,
      this.endAngle,
      this.startAngle,
      !this.counterClockwise
    )
  }

  /**
   * Get new arc transformed using affine transformation matrix <br/>
   * @param matrix - affine transformation matrix
   * @returns transformed arc
   */
  transform(matrix = new Matrix()): Arc {
    const newStart = this.start.transform(matrix)
    const newEnd = this.end.transform(matrix)
    const newCenter = this.pc.transform(matrix)
    let newDirection = this.counterClockwise
    if (matrix.a * matrix.d < 0) {
      newDirection = !newDirection
    }
    return Arc.arcSE(newCenter, newStart, newEnd, newDirection)
  }

  /**
   * Get new arc with center, start, end points and direction
   * @param center center point
   * @param start start point
   * @param end end point
   * @param counterClockwise direction
   * @returns new arc
   */
  static arcSE(
    center: Point,
    start: Point,
    end: Point,
    counterClockwise: boolean
  ) {
    const startAngle = vector(center, start).slope
    let endAngle = vector(center, end).slope
    if (EQ(startAngle, endAngle)) {
      endAngle += 2 * Math.PI
      counterClockwise = true
    }
    const r = vector(center, start).length

    return new Arc(center, r, startAngle, endAngle, counterClockwise)
  }

  definiteIntegral(ymin = 0): number {
    const functionalArcs = this.breakToFunctional()
    const area = functionalArcs.reduce(
      (acc, arc) => acc + arc.circularSegmentDefiniteIntegral(ymin),
      0.0
    )
    return area
  }

  circularSegmentDefiniteIntegral(ymin: number): number {
    const line = new Line(this.start, this.end)
    const onLeftSide = this.pc.leftTo(line)
    const segment = new Segment(this.start, this.end)
    const areaTrapez = segment.definiteIntegral(ymin)
    const areaCircularSegment = this.circularSegmentArea()
    const area = onLeftSide
      ? areaTrapez - areaCircularSegment
      : areaTrapez + areaCircularSegment
    return area
  }

  circularSegmentArea(): number {
    return 0.5 * this.r * this.r * (this.sweep - Math.sin(this.sweep))
  }

  /**
   * Sort given array of points from arc start to end, assuming all points lay on the arc
   * @param pts array of points
   * @returns new array sorted
   */
  sortPoints(pts: Point[]) {
    return pts.slice().sort((pt1, pt2) => {
      const slope1 = vector(this.pc, pt1).slope
      const slope2 = vector(this.pc, pt2).slope
      if (slope1 < slope2) {
        return -1
      }
      if (slope1 > slope2) {
        return 1
      }
      return 0
    })
  }

  get name() {
    return 'arc'
  }
}

/**
 * Function to create arc equivalent to "new" constructor
 * @param args
 */
export const arc = (...args: [] | [Point, number, number, number, boolean]) =>
  new Arc(...args)
