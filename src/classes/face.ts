import { CircularLinkedList } from '../algorithms/structures/circularLinkedList'
import { PlanarSet } from '../algorithms/structures/planarSet'
import { CCW, ORIENTATION } from '../utils/constants'
import { EQ_0, LT } from '../utils/utils'
import { Arc } from './arc'
import { Box } from './box'
import { Circle } from './circle'
import { Edge } from './edge'
import { Point } from './point'
import { Polygon } from './polygon'
import { Segment } from './segment'

/**
 * Class representing a face (closed loop) in a [polygon]{@link Polygon} object.
 * Face is a circular bidirectional linked list of [edges]{@link Edge}.
 * *Face object cannot be instantiated with a constructor.*
 * Instead, use [polygon.addFace()]{@link Polygon#addFace} method.
 * <br/>
 * Note, that face only set entry point to the linked list of edges but does not contain edges by itself.
 * Container of edges is a property of the polygon object. <br/>
 *
 * @example
 * // Face implements "next" iterator which enables to iterate edges in for loop:
 * for (let edge of face) {
 *      console.log(edge.shape.length)     // do something
 * }
 *
 * // Instead, it is possible to iterate edges as linked list, starting from face.first:
 * let edge = face.first;
 * do {
 *   console.log(edge.shape.length);   // do something
 *   edge = edge.next;
 * } while (edge != face.first)
 */
export class Face extends CircularLinkedList {
  private _box: Box | undefined = undefined
  private _orientation: number | undefined = undefined

  constructor(
    polygon: Polygon,
    ...args:
      | []
      | [Point[]]
      | [[number, number][]]
      | [(Segment | Arc)[]]
      | [Box | Circle]
  ) {
    super()

    if (args.length === 0) {
      return
    }

    // array of points
    if (
      args.length === 1 &&
      args[0] instanceof Array &&
      args[0].every((shape) => {
        return shape instanceof Point
      })
    ) {
      const points = args[0] as Point[]
      const segments = Face.points2segments(points)
      this.shapes2face(polygon.edges, segments)
    }

    // array of pairs of numbers
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
      const pairs = args[0] as [number, number][]
      const points = pairs.map((pt) => new Point(pt[0], pt[1]))
      const segments = Face.points2segments(points)
      this.shapes2face(polygon.edges, segments)
    }

    // array of segments or ars
    if (
      args.length === 1 &&
      args[0] instanceof Array &&
      args[0].every((shape) => {
        return shape instanceof Segment || shape instanceof Arc
      })
    ) {
      const shapes = args[0] as (Segment | Arc)[]
      this.shapes2face(polygon.edges, shapes)
    }

    // box
    if (args.length === 1 && args[0] instanceof Box) {
      const box = args[0]
      this.shapes2face(polygon.edges, box.toSegments())
    }

    // circle
    if (args.length === 1 && args[0] instanceof Circle) {
      const arc = args[0].toArc(CCW)
      this.shapes2face(polygon.edges, [arc])
    }
  }

  /**
   * Get segments from array of points. Zero length segments are skipped.
   * @param points
   * @returns
   */
  static points2segments(points: Point[]): Segment[] {
    const segments = []
    for (let i = 0; i < points.length; i++) {
      // skip zero length segment
      if (points[i].equalTo(points[(i + 1) % points.length])) continue
      segments.push(new Segment(points[i], points[(i + 1) % points.length]))
    }
    return segments
  }

  /**
   * Append array of shapes to the face, add edges to the polygon edges container.
   * @param edges
   * @param shapes
   */
  shapes2face(edges: PlanarSet, shapes: (Arc | Segment)[]) {
    for (const shape of shapes) {
      const edge = new Edge(shape)
      this.append(edge)
      edges.add(edge)
    }
  }

  /**
   * Set arcLength property for each of the edges in the face.
   * ArcLength of the edge it the arc length from the first edge of the face
   */
  setArcLength() {
    for (const ele of this) {
      const edge = ele as Edge
      this.setOneEdgeArcLength(edge)
      edge.face = this
    }
  }

  /**
   * Set arcLength property for the given edge in the face.
   * ArcLength of the edge it the arc length from the first edge of the face
   * @param edge
   */
  setOneEdgeArcLength(edge: Edge) {
    if (edge === this.first) {
      edge.arcLength = 0.0
    } else {
      edge.arcLength = edge.prev!.arcLength + edge.prev!.length
    }
  }

  /**
   * Return array of edges from first to last
   * @returns {Array}
   */
  get edges(): Edge[] {
    return this.toArray() as Edge[]
  }

  /**
   * Return array of shapes which comprise face
   * @returns {Array}
   */
  get shapes(): (Segment | Arc)[] {
    return this.edges.map((edge) => edge.shape.clone())
  }

  /**
   * Return bounding box of the face.
   * @returns
   */
  get box(): Box {
    if (this._box === undefined) {
      let box = new Box()
      for (const edge of this) {
        box = box.merge((edge as Edge).box)
      }
      this._box = box
    }
    return this._box
  }

  /**
   * Get all edges length.
   * @returns
   */
  get perimeter(): number {
    return (this.last as Edge).arcLength + (this.last as Edge).length
  }

  /**
   * Get point on face boundary at given length, null if length is out of range.
   * @param length - The length along the face boundary
   * @returns
   */
  pointAtLength(length: number): Point | null {
    if (length > this.perimeter || length < 0) return null

    const point = null
    for (const ele of this) {
      const edge = ele as Edge
      if (length >= edge.arcLength && length < edge.arcLength + edge.length) {
        return edge.pointAtLength(length - edge.arcLength)
      }
    }
    return point
  }

  /**
   * Append edge after the last edge of the face (and before the first edge). <br/>
   * @param edge - Edge to be appended to the linked list
   * @returns
   */
  append(edge: Edge): Face {
    super.append(edge)
    this.setOneEdgeArcLength(edge)
    edge.face = this
    return this
  }

  /**
   * Insert edge newEdge into the linked list after the edge edgeBefore <br/>
   * @param newEdge - Edge to be inserted into linked list
   * @param edgeBefore - Edge to insert newEdge after it
   * @returns
   */
  insert(newEdge: Edge, edgeBefore: Edge): Face {
    super.insert(newEdge, edgeBefore)
    this.setOneEdgeArcLength(newEdge)
    newEdge.face = this
    return this
  }

  /**
   * Remove the given edge from the linked list of the face <br/>
   * @param edge - Edge to be removed
   * @returns
   */
  remove(edge: Edge): Face {
    super.remove(edge)
    this.setArcLength()
    return this
  }

  /**
   * Reverse orientation of the face: first edge become last and vice a verse,
   * all edges starts and ends swapped, direction of arcs inverted. If face was oriented
   * clockwise, it becomes counterclockwise and vice versa
   */
  reverse(): Face {
    // Reverse edges
    super.reverse()

    this.edges.forEach((edge) => {
      edge.reverse()
    })

    // Recalculate arcLength
    this.setArcLength()

    // Recalculate orientation, if set
    if (this._orientation !== undefined) {
      this._orientation = undefined
      this._orientation = this.orientation()
    }

    return this
  }

  /**
   * Returns the absolute value of the area of the face
   * @returns {number}
   */
  area(): number {
    return Math.abs(this.signedArea())
  }

  /**
   * Returns signed area of the simple face.
   * Face is simple if it has no self intersections that change its orientation.
   * Then the area will be positive if the orientation of the face is clockwise,
   * and negative if orientation is counterclockwise.
   * It may be zero if polygon is degenerated.
   * @returns {number}
   */
  signedArea(): number {
    let sArea = 0
    const ymin = this.box.ymin
    for (const ele of this) {
      const edge = ele as Edge
      sArea += edge.shape.definiteIntegral(ymin)
    }
    return sArea
  }

  /**
   * Return face orientation: one of ORIENTATION.CCW, ORIENTATION.CW, ORIENTATION.NOT_ORIENTABLE <br/>
   * According to Green theorem the area of a closed curve may be calculated as double integral,
   * and the sign of the integral will be defined by the direction of the curve.
   * When the integral ("signed area") will be negative, direction is counterclockwise,
   * when positive - clockwise and when it is zero, polygon is not orientable.
   * See {@link https://mathinsight.org/greens_theorem_find_area}
   * @returns
   */
  orientation(): number {
    if (this._orientation === undefined) {
      const area = this.signedArea()
      if (EQ_0(area)) {
        this._orientation = ORIENTATION.NOT_ORIENTABLE
      } else if (LT(area, 0)) {
        this._orientation = ORIENTATION.CCW
      } else {
        this._orientation = ORIENTATION.CW
      }
    }
    return this._orientation
  }

  /**
   * Returns edge which contains given point
   * @param  pt - test point
   * @returns
   */
  findEdgeByPoint(pt: Point): Edge | undefined {
    let edgeFound
    for (const ele of this) {
      const edge = ele as Edge
      if (pt.equalTo(edge.shape.start)) continue
      if (pt.equalTo(edge.shape.end) || edge.shape.contains(pt)) {
        edgeFound = edge
        break
      }
    }
    return edgeFound
  }

  /**
   * Returns new polygon created from one face
   * @returns {Polygon}
   */
  toPolygon(): Polygon {
    return new Polygon(this.shapes)
  }
}
