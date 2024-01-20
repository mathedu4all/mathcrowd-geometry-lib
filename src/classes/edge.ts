import { Arc } from './arc'
import { Point } from './point'
import { Segment } from './segment'
import { Box } from './box'
import type { Face } from './face'
import { LinkedListElement } from '../algorithms/structures/linkedList'

/**
 * Class representing an edge of polygon. Edge shape may be Segment or Arc.
 * Each edge contains references to the next and previous edges in the face of the polygon.
 *
 * @type {Edge}
 */
export class Edge implements LinkedListElement {
  /**
   * Shape of the edge: Segment or Arc
   */
  shape: Segment | Arc
  /**
   * Pointer to the next edge in the face
   */
  next: Edge | undefined = undefined
  /**
   * Pointer to the previous edge in the face
   */
  prev: Edge | undefined = undefined
  /**
   * Pointer to the face containing this edge
   */
  face: Face | undefined = undefined
  /**
   * "Arc distance" from the face start
   */
  arcLength: number = 0

  /**
   * Construct new instance of edge
   * @param {Shape} shape Shape of type Segment or Arc
   */
  constructor(shape: Arc | Segment) {
    this.shape = shape
  }

  /**
   * Get edge start point
   * @returns Point
   */
  get start(): Point {
    return this.shape.start
  }

  /**
   * Get edge end point
   * @returns Point
   */
  get end(): Point {
    return this.shape.end
  }

  /**
   * Get edge length
   * @returns edge length
   */
  get length(): number {
    return this.shape.length
  }

  /**
   * Get bounding box of the edge
   * @returns bounding box
   */
  get box(): Box {
    return this.shape.box
  }

  isSegment(): boolean {
    return this.shape instanceof Segment
  }

  isArc(): boolean {
    return this.shape instanceof Arc
  }

  /**
   * Get middle point of the edge
   * @returns middle point of the edge
   */
  middle(): Point {
    return this.shape.middle()
  }

  /**
   * Get point at given length
   * @param length - The length along the edge
   * @returns point at given length
   */
  pointAtLength(length: number): Point {
    return this.shape.pointAtLength(length)
  }

  /**
   * Returns true if point belongs to the edge, false otherwise
   * @param pt - test point
   */
  contains(pt: Point): boolean {
    return this.shape.contains(pt)
  }

  /**
   * Reverse edge direction
   */
  reverse(): void {
    this.shape = this.shape.reverse()
  }
}
