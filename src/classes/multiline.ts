import { LinkedList } from '../algorithms/structures/linkedList'
import { Segment } from './segment'
import { Arc } from './arc'
import { Edge } from './edge'
import { Box } from './box'
import { Point } from './point'
import { Vector } from './vector'
import { Matrix } from './matrix'

/**
 * Class Multiline represent connected path of [edges]{@link Edge}, where each edge may be
 * [segment]{@link Segment}, [arc]{@link Arc}
 */
export class Multiline extends LinkedList {
  /**
   * Construct new instance of multiline
   * @param args
   * @returns
   */
  constructor(...args: [] | [(Segment | Arc)[]]) {
    super()

    if (args.length === 0) {
      return
    }

    if (args.length == 1) {
      if (args[0] instanceof Array) {
        const shapes = args[0]
        if (shapes.length == 0) return

        for (const shape of shapes) {
          const edge = new Edge(shape)
          this.append(edge)
        }
      }
    }
  }

  /**
   * (Getter) Return array of edges
   * @returns array of edges
   */
  get edges(): Edge[] {
    return [...this] as Edge[]
  }

  /**
   * (Getter) Return bounding box of the multiline
   * @returns {Box}
   */
  get box(): Box {
    return this.edges.reduce(
      (acc, edge) => (acc = acc.merge(edge.box)),
      new Box()
    )
  }

  /**
   * (Getter) Returns array of vertices
   * @returns array of vertices
   */
  get vertices(): Point[] {
    if (this.isEmpty()) return []
    const v = this.edges.map((edge) => edge.start)
    const last = this.last as Edge
    v.push(last.end)
    return v
  }

  /**
   * Return new cloned instance of Multiline
   * @returns {Multiline}
   */
  clone(): Multiline {
    return new Multiline(this.toShapes())
  }

  /**
   * Split edge and add new vertex, return new edge inserted
   * @param pt - point on edge that will be added as new vertex
   * @param edge - edge to split
   * @returns {Edge}
   */
  addVertex(pt: Point, edge: Edge): Edge | undefined {
    const shapes = edge.shape.split(pt)
    if (shapes.length !== 2) return

    const newEdge = new Edge(shapes[0])
    const edgeBefore = edge.prev

    this.insert(newEdge, edgeBefore)
    edge.shape = shapes[1]

    return newEdge
  }

  /**
   * Split edges of multiline with intersection points and return mutated multiline
   * @param ip - array of points to be added as new vertices
   * @returns {Multiline}
   */
  split(ip: Point[]): Multiline {
    for (const pt of ip) {
      const edge = this.findEdgeByPoint(pt)
      if (edge === undefined) continue
      this.addVertex(pt, edge)
    }
    return this
  }

  /**
   * Returns edge which contains given point
   * @param pt
   * @returns
   */
  findEdgeByPoint(pt: Point): Edge | undefined {
    let edgeFound: Edge | undefined = undefined
    for (const edge of this) {
      const shape = (edge as Edge).shape

      if (shape.contains(pt)) {
        edgeFound = edge as Edge
        break
      }
    }
    return edgeFound
  }

  /**
   * Returns new multiline translated by vector vec
   * @param vec
   * @returns
   */
  translate(vec: Vector): Multiline {
    return new Multiline(this.edges.map((edge) => edge.shape.translate(vec)))
  }

  /**
   * Return new multiline rotated by given angle around given point
   * If point omitted, rotate around origin (0,0)
   * Positive value of angle defines rotation counterclockwise, negative - clockwise
   * @param angle - rotation angle in radians
   * @param center - rotation center, default is (0,0)
   * @returns {Multiline} - new rotated polygon
   */
  rotate(angle: number = 0, center: Point = new Point()): Multiline {
    return new Multiline(
      this.edges.map((edge) => edge.shape.rotate(angle, center))
    )
  }

  /**
   * Return new multiline transformed using affine transformation matrix
   * Method does not support unbounded shapes
   * @param matrix - affine transformation matrix
   * @returns {Multiline} - new multiline
   */
  transform(matrix = new Matrix()): Multiline {
    return new Multiline(this.edges.map((edge) => edge.shape.transform(matrix)))
  }

  /**
   * Transform multiline into array of shapes
   * @returns
   */
  toShapes(): (Segment | Arc)[] {
    return this.edges.map((edge) => edge.shape.clone())
  }
}

/**
 * Shortcut function to create multiline
 * @param args
 */
export const multiline = (...args: [] | [(Segment | Arc)[]]) =>
  new Multiline(...args)
