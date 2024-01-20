import * as Intersection from '../algorithms/intersection'

import { Multiline } from './multiline'
import { intersectEdge2Line } from '../algorithms/intersection'
import { INSIDE, BOUNDARY } from '../utils/constants'
import { Matrix } from './matrix'
import { Face } from './face'
import { Point } from './point'
import { Segment } from './segment'
import { Errors } from '../utils/errors'
import { PlanarSet } from '../algorithms/structures/planarSet'
import { Box } from './box'
import { Circle } from './circle'
import { Arc } from './arc'
import { Edge } from './edge'
import { Shape } from './shape'
import { Distance } from '../algorithms/distance'
import { Line } from './line'
import { LT } from '../utils/utils'
import { Vector } from './vector'
import { Ray } from './ray'

/**
 * Class representing a polygon.<br/>
 * Polygon is a multipolygon comprised from a set of [faces]{@link Face}. <br/>
 * Face, in turn, is a closed loop of [edges]{@link Edge}, where edge may be segment or circular arc<br/>
 * @type {Polygon}
 */
export class Polygon extends Shape<Polygon> {
  /**
   * Container of faces (closed loops), may be empty
   */
  faces: PlanarSet = new PlanarSet()
  /**
   * Container of edges
   */
  edges: PlanarSet = new PlanarSet()

  /**
   * Constructor creates new instance of polygon. With no arguments new polygon is empty.<br/>
   * Constructor accepts as argument array that define loop of shapes
   * or array of arrays in case of multi polygon <br/>
   * Loop may be defined in different ways: <br/>
   * - array of shapes of type Segment or Arc <br/>
   * - array of points (Point) <br/>
   * - array of numeric pairs which represent points <br/>
   * - box or circle object <br/>
   * Alternatively, it is possible to use polygon.addFace method
   * @param {args} - array of shapes or array of arrays
   */
  constructor(
    ...args:
      | []
      | [(Segment | Arc)[]]
      | [(Segment | Arc)[][]]
      | [Point[]]
      | [Point[][]]
      | [[number, number][]]
      | [Circle | Box]
  ) {
    super()

    if (args.length === 0) {
      return
    }

    // Box or Circle
    if (
      args.length === 1 &&
      (args[0] instanceof Box || args[0] instanceof Circle)
    ) {
      const obj = args[0] as Box | Circle
      this.faces.add(new Face(this, obj))
    }

    // Array of points
    if (
      args.length === 1 &&
      args[0] instanceof Array &&
      args[0].every((shape) => {
        return shape instanceof Point
      })
    ) {
      const points = args[0] as Point[]
      this.faces.add(new Face(this, points))
    }

    // Multiple array of points
    if (
      args.length === 1 &&
      args[0] instanceof Array &&
      args[0].every((g) => {
        return g instanceof Array && g.every((s) => s instanceof Point)
      })
    ) {
      const groups = args[0] as Point[][]
      for (const points of groups) {
        this.faces.add(new Face(this, points))
      }
    }

    // Array of numeric pairs
    if (
      args.length === 1 &&
      args[0] instanceof Array &&
      args[0].every((shape) => {
        return (
          shape instanceof Array &&
          shape.length === 2 &&
          typeof shape[0] === 'number' &&
          typeof shape[1] === 'number'
        )
      })
    ) {
      const points = args[0] as [number, number][]
      this.faces.add(new Face(this, points))
    }

    // Array of segments or arcs
    if (
      args.length === 1 &&
      args[0] instanceof Array &&
      args[0].every((shape) => {
        return shape instanceof Segment || shape instanceof Arc
      })
    ) {
      const shapes = args[0] as (Segment | Arc)[]
      this.faces.add(new Face(this, shapes))
    }

    // Multiple array of segments or arcs
    if (
      args.length === 1 &&
      args[0] instanceof Array &&
      args[0].every((g) => {
        return (
          g instanceof Array &&
          g.every((s) => s instanceof Segment || s instanceof Arc)
        )
      })
    ) {
      const groups = args[0] as (Segment | Arc)[][]
      for (const shapes of groups) {
        this.faces.add(new Face(this, shapes))
      }
    }
  }

  /**
   * (Getter) Returns bounding box of the polygon
   * @returns
   */
  get box(): Box {
    return [...this.faces].reduce((acc, face) => acc.merge(face.box), new Box())
  }

  /**
   * (Getter) Returns array of vertices
   * @returns {Array}
   */
  get vertices(): Point[] {
    return [...this.edges].map((edge) => edge.start)
  }

  /**
   * Create new cloned instance of the polygon
   * @returns {Polygon}
   */
  clone(): Polygon {
    const polygon = new Polygon()
    for (const face of this.faces) {
      polygon.addFace(face.shapes)
    }
    return polygon
  }

  /**
   * Return true is polygon has no edges
   * @returns {boolean}
   */
  isEmpty(): boolean {
    return this.edges.size === 0
  }

  /**
   * Returns area of the polygon. Area of an island will be added, area of a hole will be subtracted
   * @returns {number}
   */
  area(): number {
    const signedArea = [...this.faces].reduce(
      (acc, face) => acc + face.signedArea(),
      0
    )
    return Math.abs(signedArea)
  }

  /**
   * Add new face to polygon. Returns added face
   * @param {Point[]|Segment[]|Arc[]|Circle|Box} args -  new face may be create with one of the following ways: <br/>
   * 1) array of points that describe closed path (edges are segments) <br/>
   * 2) array of shapes (segments and arcs) which describe closed path <br/>
   * 3) circle - will be added as counterclockwise arc <br/>
   * 4) box - will be added as counterclockwise rectangle <br/>
   * You can chain method face.reverse() is you need to change direction of the creates face
   * @returns {Face}
   */
  addFace(...args: [Point[]] | [(Segment | Arc)[]] | [Circle | Box]): Face {
    const face = new Face(this, ...args)
    this.faces.add(face)
    return face
  }

  /**
   * Delete existing face from polygon
   * @param face Face to be deleted
   * @returns
   */
  deleteFace(face: Face): boolean {
    for (const ele of face) {
      const edge = ele as Edge
      this.edges.delete(edge)
    }
    return this.faces.delete(face)
  }

  /**
   * Clear all faces and create new faces from edges
   */
  recreateFaces() {
    // Remove all faces
    this.faces.clear()
    for (const edge of this.edges) {
      edge.face = null
    }

    let unassignedEdgeFound = true
    let face: Face | undefined = undefined
    while (unassignedEdgeFound) {
      unassignedEdgeFound = false

      // Find first unassigned edge
      for (const edge of this.edges) {
        if (edge.face === null) {
          if (face) {
            this.faces.add(face)
          }
          face = new Face(this)
          face.append(edge)
          unassignedEdgeFound = true
          break
        }
      }

      if (unassignedEdgeFound) {
        // Add all connected edges to the face
        let edge = face!.first as Edge
        while (edge.next !== face!.first) {
          edge = edge.next as Edge
          face!.append(edge)
        }
      }
    }
    if (face) {
      this.faces.add(face)
    }
  }

  /**
   * Cut polygon with multiline and return array of new polygons
   * Multiline should be constructed from a line with intersection point, see notebook:
   * https://next.observablehq.com/@alexbol99/cut-polygon-with-line
   * @param multiline
   * @returns
   */
  cut(multiline: Multiline): Polygon[] {
    // TODO
    return []
  }

  /**
   * Returns the first found edge of polygon that contains given point
   * If point is a vertex, return the edge where the point is an end vertex, not a start one
   * @param  pt
   * @returns
   */
  findEdgeByPoint(pt: Point): Edge | undefined {
    let edge
    for (const face of this.faces) {
      edge = face.findEdgeByPoint(pt)
      if (edge !== undefined) break
    }
    return edge
  }

  /**
   * Reverse orientation of all faces to opposite
   * @returns {Polygon}
   */
  reverse(): Polygon {
    for (const face of this.faces) {
      face.reverse()
    }
    return this
  }

  /**
   * Returns true if polygon contains shape: no point of shape lay outside of the polygon,
   * false otherwise
   * @param shape - test shape
   * @returns
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contains(_shape: Shape<any>): boolean {
    // TODO
    return false
  }

  /**
   * Return distance and shortest segment between polygon and other shape as array [distance, shortestSegment]
   * @param {Shape} shape Shape of one of the types Point, Circle, Line, Segment, Arc or Polygon
   * @returns
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  distanceTo(shape: Shape<any>): [number, Segment] {
    if (shape instanceof Point) {
      const [dist, shortestSegment] = Distance.point2polygon(shape, this)
      return [dist, shortestSegment.reverse()]
    }

    if (
      shape instanceof Circle ||
      shape instanceof Line ||
      shape instanceof Segment ||
      shape instanceof Arc
    ) {
      const [dist, shortestSegment] = Distance.shape2polygon(shape, this)
      return [dist, shortestSegment.reverse()]
    }

    /* this method is bit faster */
    if (shape instanceof Polygon) {
      let minDistanceAndSegment: [number, Segment] = [
        Number.POSITIVE_INFINITY,
        new Segment()
      ]
      let dist, shortestSegment

      for (const edge of this.edges) {
        const minStop = minDistanceAndSegment[0]
        ;[dist, shortestSegment] = Distance.shape2planarSet(
          edge.shape,
          shape.edges,
          minStop
        )
        if (LT(dist, minStop)) {
          minDistanceAndSegment = [dist, shortestSegment]
        }
      }
      return minDistanceAndSegment
    }

    throw Errors.OPERATION_IS_NOT_SUPPORTED
  }

  /**
   * Return array of intersection points between polygon and other shape
   * @param shape Shape of the one of supported types <br/>
   * @returns
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  intersect(shape: Shape<any>): Point[] {
    if (shape instanceof Point) {
      return this.contains(shape) ? [shape] : []
    }

    if (shape instanceof Line) {
      return Intersection.intersectLine2Polygon(shape, this)
    }

    if (shape instanceof Ray) {
      return Intersection.intersectRay2Polygon(shape, this)
    }

    if (shape instanceof Circle) {
      return Intersection.intersectCircle2Polygon(shape, this)
    }

    if (shape instanceof Segment) {
      return Intersection.intersectSegment2Polygon(shape, this)
    }

    if (shape instanceof Arc) {
      return Intersection.intersectArc2Polygon(shape, this)
    }

    if (shape instanceof Polygon) {
      return Intersection.intersectPolygon2Polygon(shape, this)
    }

    throw Errors.OPERATION_IS_NOT_SUPPORTED
  }

  /**
   * Returns new polygon translated by given vector
   * @param args - Translation vector or translation by x and y
   * @returns
   */
  translate(...args: [Vector] | [number, number]): Polygon {
    const newPolygon = new Polygon()
    for (const face of this.faces) {
      newPolygon.addFace(
        face.shapes.map((shape: Arc | Segment) => shape.translate(...args))
      )
    }
    return newPolygon
  }

  /**
   * Return new polygon rotated by given angle around given point
   * If point omitted, rotate around origin (0,0)
   * Positive value of angle defines rotation counterclockwise, negative - clockwise
   * @param angle - rotation angle in radians
   * @param center - rotation center, default is (0,0)
   * @returns new rotated polygon
   */
  rotate(angle: number = 0, center: Point = new Point()) {
    const newPolygon = new Polygon()
    for (const face of this.faces) {
      newPolygon.addFace(
        face.shapes.map((shape: Arc | Segment) => shape.rotate(angle, center))
      )
    }
    return newPolygon
  }

  /**
   * Return new polygon with coordinates multiplied by scaling factor
   * @param {number} sx - x-axis scaling factor
   * @param {number} sy - y-axis scaling factor
   * @returns {Polygon}
   */
  scale(sx: number, sy: number): Polygon {
    const newPolygon = new Polygon()
    for (const face of this.faces) {
      newPolygon.addFace(
        face.shapes.map((shape: Arc | Segment) => shape.scale(sx, sy))
      )
    }
    return newPolygon
  }

  /**
   * Return new polygon transformed using affine transformation matrix
   * @param {Matrix} matrix - affine transformation matrix
   * @returns {Polygon} - new polygon
   */
  transform(matrix: Matrix = new Matrix()): Polygon {
    const newPolygon = new Polygon()
    for (const face of this.faces) {
      newPolygon.addFace(
        face.shapes.map((shape: Arc | Segment) => shape.transform(matrix))
      )
    }
    return newPolygon
  }

  get name(): string {
    return 'polygon'
  }
}

/**
 * Shortcut method to create new polygon
 */
export const polygon = (
  ...args:
    | []
    | [(Segment | Arc)[]]
    | [Point[]]
    | [[number, number][]]
    | [Circle | Box]
) => new Polygon(...args)
