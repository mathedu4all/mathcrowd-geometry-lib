import { Arc } from './arc'
import { Point } from './point'
import { Segment } from './segment'
import { Box } from './box'
import type { Face } from './face'
import { LinkedListElement } from '../algorithms/structures/linkedList'
import { Polygon } from './polygon'
import { Line } from './line'
import { Ray } from './ray'
import { INSIDE, OUTSIDE } from '../utils/constants'
import { rayShooting } from '../algorithms/rayShooting'

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
   * Start inclusion flag (inside/outside/boundary)
   */
  bvStart: number | undefined = undefined
  /**
   * End inclusion flag (inside/outside/boundary)
   */
  bvEnd: number | undefined = undefined
  /**
   * Edge inclusion flag (INSIDE, OUTSIDE, BOUNDARY)
   */
  bv: number | undefined = undefined
  /**
   * Overlap flag for boundary edge (OVERLAP_SAME/OVERLAP_OPPOSITE)
   */
  overlap: number | undefined = undefined

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

  /**
   * Set inclusion flag of the edge with respect to another polygon
   * Inclusion flag is one of INSIDE, OUTSIDE, BOUNDARY
   * @param polygon
   */
  setInclusion(polygon: Polygon) {
    if (this.bv !== undefined) return this.bv

    if (this.shape instanceof Line || this.shape instanceof Ray) {
      this.bv = OUTSIDE
      return this.bv
    }

    if (this.bvStart === undefined) {
      this.bvStart = rayShooting(polygon, this.start)
    }
    if (this.bvEnd === undefined) {
      this.bvEnd = rayShooting(polygon, this.end)
    }
    /* At least one end outside - the whole edge outside */
    if (this.bvStart === OUTSIDE || this.bvEnd == OUTSIDE) {
      this.bv = OUTSIDE
    } else if (
      /* At least one end inside - the whole edge inside */
      this.bvStart === INSIDE ||
      this.bvEnd == INSIDE
    ) {
      this.bv = INSIDE
    } else {
      const bvMiddle = rayShooting(polygon, this.middle())
      this.bv = bvMiddle
    }
    return this.bv
  }
}
