/* eslint-disable @typescript-eslint/no-explicit-any */
import { Point } from '../classes/point'
import { Line, line } from '../classes/line'
import { Segment } from '../classes/segment'
import { Vector } from '../classes/vector'
import { EQ_0, GE, GT, LE, LT } from '../utils/utils'
import * as Intersection from '../algorithms/intersection'
import { Circle } from '../classes/circle'
import { Arc } from '../classes/arc'
import { IntervalTree, Node } from './structures/intervalTree'
import { PlanarSet } from './structures/planarSet'
import { Box } from '../classes/box'
import { Polygon } from '../classes/polygon'
import { Shape } from '../classes/shape'
import { Edge } from '../classes/edge'

export class Distance {
  /**
   * Calculate distance and shortest segment between points
   * @param pt1
   * @param pt2
   * @returns distance and shortest segment
   */
  static point2point(pt1: Point, pt2: Point): [number, Segment] {
    return pt1.distanceTo(pt2) as [number, Segment]
  }

  /**
   * Calculate distance and shortest segment between point and line
   * @param pt
   * @param line
   * @returns  distance and shortest segment
   */
  static point2line(pt: Point, line: Line): [number, Segment] {
    const closestPoint = pt.projectionOn(line)
    const vec = new Vector(pt, closestPoint)
    return [vec.length, new Segment(pt, closestPoint)]
  }

  /**
   * Calculate distance and shortest segment between point and circle
   * @param pt
   * @param circle
   * @returns  distance and shortest segment
   */
  static point2circle(pt: Point, circle: Circle): [number, Segment] {
    const [dist2center] = pt.distanceTo(circle.center)
    if (EQ_0(dist2center)) {
      return [circle.r, new Segment(pt, circle.toArc().start)]
    } else {
      const dist = Math.abs(dist2center - circle.r)
      const v = new Vector(circle.pc, pt).normalize().multiply(circle.r)
      const closestPoint = circle.pc.translate(v)
      return [dist, new Segment(pt, closestPoint)]
    }
  }

  /**
   * Calculate distance and shortest segment between point and segment
   * @param pt
   * @param segment
   * @returns distance and shortest segment
   */
  static point2segment(pt: Point, segment: Segment): [number, Segment] {
    /* Degenerated case of zero-length segment */
    if (segment.start.equalTo(segment.end)) {
      return Distance.point2point(pt, segment.start)
    }

    const segVec = new Vector(segment.start, segment.end)
    const ps2ptVec = new Vector(segment.start, pt)
    const pe2ptVec = new Vector(segment.end, pt)

    /* Check if point is out of segment scope */
    const inPsScope = segVec.dot(ps2ptVec)
    const inPeScope = -segVec.dot(pe2ptVec)

    if (GE(inPsScope, 0) && GE(inPeScope, 0)) {
      const closestPoint = pt.projectionOn(line(segment.ps, segment.pe))
      return pt.distanceTo(closestPoint)
    } else if (inPsScope < 0) {
      /* point is out of scope closer to ps */
      return pt.distanceTo(segment.start) as [number, Segment]
    } else {
      /* point is out of scope closer to pe */
      return pt.distanceTo(segment.end) as [number, Segment]
    }
  }

  /**
   * Calculate distance and shortest segment between point and arc
   * @param pt
   * @param arc
   * @returns {Number | Segment} - distance and shortest segment
   */
  static point2arc(pt: Point, arc: Arc): [number, Segment] {
    const circle = new Circle(arc.pc, arc.r)
    const distanceAndSegment = []
    const [_, shortestSegment] = Distance.point2circle(pt, circle)
    if (shortestSegment.end.on(arc)) {
      distanceAndSegment.push(Distance.point2circle(pt, circle))
    }
    distanceAndSegment.push(Distance.point2point(pt, arc.start))
    distanceAndSegment.push(Distance.point2point(pt, arc.end))

    Distance.sort(distanceAndSegment)

    return distanceAndSegment[0]
  }

  /**
   * Calculate distance and shortest segment between segment and line
   * @param seg
   * @param line
   * @returns distance and shortest segment
   */
  static segment2line(seg: Segment, line: Line): [number, Segment] {
    const ip = seg.intersect(line)
    if (ip.length > 0) {
      return [0, new Segment(ip[0], ip[0])]
    }
    const distanceAndSegment = []
    distanceAndSegment.push(Distance.point2line(seg.start, line))
    distanceAndSegment.push(Distance.point2line(seg.end, line))

    Distance.sort(distanceAndSegment)
    return distanceAndSegment[0]
  }

  /**
   * Calculate distance and shortest segment between two segments
   * @param seg1
   * @param seg2
   * @returns distance and shortest segment
   */
  static segment2segment(seg1: Segment, seg2: Segment): [number, Segment] {
    const ip = Intersection.intersectSegment2Segment(seg1, seg2)
    if (ip.length > 0) {
      return [0, new Segment(ip[0], ip[0])]
    }

    // Seg1 and seg2 not intersected
    const distanceAndSegment: [number, Segment][] = []
    const [distTmp1, shortestSegmentTmp1] = Distance.point2segment(
      seg2.start,
      seg1
    )
    distanceAndSegment.push([distTmp1, shortestSegmentTmp1.reverse()])
    const [distTmp2, shortestSegmentTmp2] = Distance.point2segment(
      seg2.end,
      seg1
    )
    distanceAndSegment.push([distTmp2, shortestSegmentTmp2.reverse()])
    distanceAndSegment.push(Distance.point2segment(seg1.start, seg2))
    distanceAndSegment.push(Distance.point2segment(seg1.end, seg2))

    Distance.sort(distanceAndSegment)
    return distanceAndSegment[0]
  }

  /**
   * Calculate distance and shortest segment between segment and circle
   * @param seg
   * @param circle
   * @returns distance and shortest segment
   */
  static segment2circle(seg: Segment, circle: Circle): [number, Segment] {
    /* Case 1 Segment and circle intersected. Return the first point and zero distance */
    const ip = seg.intersect(circle)
    if (ip.length > 0) {
      return [0, new Segment(ip[0], ip[0])]
    }

    // No intersection between segment and circle

    /* Case 2. Distance to projection of center point to line bigger than radius
     * And projection point belong to segment
     * Then measure again distance from projection to circle and return it */
    const line = new Line(seg.ps, seg.pe)
    const [dist, shortestSegment] = Distance.point2line(circle.center, line)
    if (GE(dist, circle.r) && shortestSegment.end.on(seg)) {
      return Distance.point2circle(shortestSegment.end, circle)
    } else {
      /* Case 3. Otherwise closest point is one of the end points of the segment */
      const [distFromStart, shortestSegmentFromStart] = Distance.point2circle(
        seg.start,
        circle
      )
      const [distFromEnd, shortestSegmentFromEnd] = Distance.point2circle(
        seg.end,
        circle
      )
      return LT(distFromStart, distFromEnd)
        ? [distFromStart, shortestSegmentFromStart]
        : [distFromEnd, shortestSegmentFromEnd]
    }
  }

  /**
   * Calculate distance and shortest segment between segment and arc
   * @param seg
   * @param arc
   * @returns distance and shortest segment
   */
  static segment2arc(seg: Segment, arc: Arc): [number, Segment] {
    /* Case 1 Segment and arc intersected. Return the first point and zero distance */
    const ip = seg.intersect(arc)
    if (ip.length > 0) {
      return [0, new Segment(ip[0], ip[0])]
    }

    // No intersection between segment and arc
    const line = new Line(seg.ps, seg.pe)
    const circle = new Circle(arc.pc, arc.r)

    /* Case 2. Distance to projection of center point to line bigger than radius AND
     * projection point belongs to segment AND
     * distance from projection point to circle belongs to arc  =>
     * return this distance from projection to circle */
    const [distFromCenter, shortestSegmentFromCenter] = Distance.point2line(
      circle.center,
      line
    )
    if (GE(distFromCenter, circle.r) && shortestSegmentFromCenter.end.on(seg)) {
      const [distFromProjection, shortestSegmentFromProjection] =
        Distance.point2circle(shortestSegmentFromCenter.end, circle)
      if (shortestSegmentFromProjection.end.on(arc)) {
        return [distFromProjection, shortestSegmentFromProjection]
      }
    }
    /* Case 3. Otherwise closest point is one of the end points of the segment */
    const distanceAndSegment: [number, Segment][] = []
    distanceAndSegment.push(Distance.point2arc(seg.start, arc))
    distanceAndSegment.push(Distance.point2arc(seg.end, arc))

    const [distTmp1, segmentTmp1] = Distance.point2segment(arc.start, seg)
    distanceAndSegment.push([distTmp1, segmentTmp1.reverse()])
    const [distTmp2, segmentTmp2] = Distance.point2segment(arc.end, seg)
    distanceAndSegment.push([distTmp2, segmentTmp2.reverse()])

    Distance.sort(distanceAndSegment)
    return distanceAndSegment[0]
  }

  /**
   * Calculate distance and shortest segment between two circles
   * @param circle1
   * @param circle2
   * @returns distance and shortest segment
   */
  static circle2circle(circle1: Circle, circle2: Circle): [number, Segment] {
    const ip = circle1.intersect(circle2)
    if (ip.length > 0) {
      return [0, new Segment(ip[0], ip[0])]
    }

    // Case 1. Concentric circles. Convert to arcs and take distance between two arc starts
    if (circle1.center.equalTo(circle2.center)) {
      const arc1 = circle1.toArc()
      const arc2 = circle2.toArc()
      return Distance.point2point(arc1.start, arc2.start)
    } else {
      // Case 2. Not concentric circles
      const line = new Line(circle1.center, circle2.center)
      const ip1 = line.intersect(circle1)
      const ip2 = line.intersect(circle2)
      const distanceAndSegment = []

      distanceAndSegment.push(Distance.point2point(ip1[0], ip2[0]))
      distanceAndSegment.push(Distance.point2point(ip1[0], ip2[1]))
      distanceAndSegment.push(Distance.point2point(ip1[1], ip2[0]))
      distanceAndSegment.push(Distance.point2point(ip1[1], ip2[1]))

      Distance.sort(distanceAndSegment)
      return distanceAndSegment[0]
    }
  }

  /**
   * Calculate distance and shortest segment between two circles
   * @param circle
   * @param line
   * @returns  distance and shortest segment
   */
  static circle2line(circle: Circle, line: Line): [number, Segment] {
    const ip = circle.intersect(line)
    if (ip.length > 0) {
      return [0, new Segment(ip[0], ip[0])]
    }

    const [_, shortestSegmentFromCenter] = Distance.point2line(
      circle.center,
      line
    )
    const [dist, shortestSegment] = Distance.point2circle(
      shortestSegmentFromCenter.end,
      circle
    )
    return [dist, shortestSegment.reverse()]
  }

  /**
   * Calculate distance and shortest segment between arc and line
   * @param arc
   * @param line
   * @returns distance and shortest segment
   */
  static arc2line(arc: Arc, line: Line): [number, Segment] {
    /* Case 1 Line and arc intersected. Return the first point and zero distance */
    const ip = line.intersect(arc)
    if (ip.length > 0) {
      return [0, new Segment(ip[0], ip[0])]
    }

    const circle = new Circle(arc.center, arc.r)

    /* Case 2. Distance to projection of center point to line bigger than radius AND
     * projection point belongs to segment AND
     * distance from projection point to circle belongs to arc  =>
     * return this distance from projection to circle */
    const [distFromCenter, shortestSegmentFromCenter] = Distance.point2line(
      circle.center,
      line
    )
    if (GE(distFromCenter, circle.r)) {
      const [distFromProjection, shortestSegmentFromProjection] =
        Distance.point2circle(shortestSegmentFromCenter.end, circle)
      if (shortestSegmentFromProjection.end.on(arc)) {
        return [distFromProjection, shortestSegmentFromProjection]
      }
    }

    const distanceAndSegment: [number, Segment][] = []
    distanceAndSegment.push(Distance.point2line(arc.start, line))
    distanceAndSegment.push(Distance.point2line(arc.end, line))

    Distance.sort(distanceAndSegment)
    return distanceAndSegment[0]
  }

  /**
   * Calculate distance and shortest segment between arc and circle
   * @param arc
   * @param circle2
   * @returns distance and shortest segment
   */
  static arc2circle(arc: Arc, circle2: Circle): [number, Segment] {
    const ip = arc.intersect(circle2)
    if (ip.length > 0) {
      return [0, new Segment(ip[0], ip[0])]
    }

    const circle1 = new Circle(arc.center, arc.r)

    const [dist, shortestSegment] = Distance.circle2circle(circle1, circle2)
    if (shortestSegment.start.on(arc)) {
      return [dist, shortestSegment]
    } else {
      const distanceAndSegment = []

      distanceAndSegment.push(Distance.point2circle(arc.start, circle2))
      distanceAndSegment.push(Distance.point2circle(arc.end, circle2))

      Distance.sort(distanceAndSegment)

      return distanceAndSegment[0]
    }
  }

  /**
   * Calculate distance and shortest segment between two arcs
   * @param arc1
   * @param arc2
   * @returns {Number | Segment} - distance and shortest segment
   */
  static arc2arc(arc1: Arc, arc2: Arc): [number, Segment] {
    const ip = arc1.intersect(arc2)
    if (ip.length > 0) {
      return [0, new Segment(ip[0], ip[0])]
    }

    const circle1 = new Circle(arc1.center, arc1.r)
    const circle2 = new Circle(arc2.center, arc2.r)

    const [dist, shortestSegment] = Distance.circle2circle(circle1, circle2)
    if (shortestSegment.start.on(arc1) && shortestSegment.end.on(arc2)) {
      return [dist, shortestSegment]
    } else {
      const distanceAndSegment: [number, Segment][] = []

      let distTmp, segmentTmp
      ;[distTmp, segmentTmp] = Distance.point2arc(arc1.start, arc2)
      if (segmentTmp.end.on(arc2)) {
        distanceAndSegment.push([distTmp, segmentTmp])
      }

      ;[distTmp, segmentTmp] = Distance.point2arc(arc1.end, arc2)
      if (segmentTmp.end.on(arc2)) {
        distanceAndSegment.push([distTmp, segmentTmp])
      }

      ;[distTmp, segmentTmp] = Distance.point2arc(arc2.start, arc1)
      if (segmentTmp.end.on(arc1)) {
        distanceAndSegment.push([distTmp, segmentTmp.reverse()])
      }

      ;[distTmp, segmentTmp] = Distance.point2arc(arc2.end, arc1)
      if (segmentTmp.end.on(arc1)) {
        distanceAndSegment.push([distTmp, segmentTmp.reverse()])
      }

      ;[distTmp, segmentTmp] = Distance.point2point(arc1.start, arc2.start)
      distanceAndSegment.push([distTmp, segmentTmp])
      ;[distTmp, segmentTmp] = Distance.point2point(arc1.start, arc2.end)
      distanceAndSegment.push([distTmp, segmentTmp])
      ;[distTmp, segmentTmp] = Distance.point2point(arc1.end, arc2.start)
      distanceAndSegment.push([distTmp, segmentTmp])
      ;[distTmp, segmentTmp] = Distance.point2point(arc1.end, arc2.end)
      distanceAndSegment.push([distTmp, segmentTmp])

      Distance.sort(distanceAndSegment)

      return distanceAndSegment[0]
    }
  }

  /**
   * Calculate distance and shortest segment between point and polygon
   * @param point
   * @param polygon
   * @returns {Number | Segment} - distance and shortest segment
   */
  static point2polygon(point: Point, polygon: Polygon): [number, Segment] {
    let minDistanceAndSegment: [number, Segment] = [
      Number.POSITIVE_INFINITY,
      new Segment()
    ]
    for (const edge of polygon.edges) {
      const [dist, shortestSegment] =
        edge.shape instanceof Segment
          ? Distance.point2segment(point, edge.shape)
          : Distance.point2arc(point, edge.shape)
      if (LT(dist, minDistanceAndSegment[0])) {
        minDistanceAndSegment = [dist, shortestSegment]
      }
    }
    return minDistanceAndSegment
  }

  static shape2polygon(shape: Shape<any>, polygon: Polygon): [number, Segment] {
    let minDistanceAndSegment: [number, Segment] = [
      Number.POSITIVE_INFINITY,
      new Segment()
    ]
    for (const edge of polygon.edges) {
      const [dist, shortestSegment] = shape.distanceTo(edge.shape)
      if (LT(dist, minDistanceAndSegment[0])) {
        minDistanceAndSegment = [dist, shortestSegment]
      }
    }
    return minDistanceAndSegment
  }

  /**
   * Returns [mindist, maxdist] array of *squared* minimal and maximal distance between boxes
   * Minimal distance by x is
   *    (box2.xmin - box1.xmax), if box1 is left to box2
   *    (box1.xmin - box2.xmax), if box2 is left to box1
   *    0,                       if box1 and box2 are intersected by x
   * Minimal distance by y is defined in the same way
   *
   * Maximal distance is estimated as a sum of squared dimensions of the merged box
   *
   * @param box1
   * @param box2
   * @returns [minDist, maxDist]
   */
  static box2boxMinMax(box1: Box, box2: Box): [number, number] {
    const minDistX = Math.max(
      Math.max(box1.xmin - box2.xmax, 0),
      Math.max(box2.xmin - box1.xmax, 0)
    )
    const minDistY = Math.max(
      Math.max(box1.ymin - box2.ymax, 0),
      Math.max(box2.ymin - box1.ymax, 0)
    )
    const minDist = minDistX * minDistX + minDistY * minDistY

    const mergedBox = box1.merge(box2)
    const dx = mergedBox.xmax - mergedBox.xmin
    const dy = mergedBox.ymax - mergedBox.ymin
    const maxDist = dx * dx + dy * dy

    return [minDist, maxDist]
  }

  /**
   * Calculate estimated minimal and maxium distance between the shape and node in PlanarSet using box level by level.
   * The minimum maxDistance is updated, nodes with minDist larger than minMax will be skipped.
   * the estimated [minDist, maxDist] pair is inserted into the interval tree.
   *
   * @param shape - represents the current query shape
   * @param level - the array of nodes at the current level of the interval tree
   * @param minStop - the current minimum stop distance
   * @param tree - the interval tree used to store the calculation results.
   * @returns the updated minimum stop distance.
   */
  static minMaxTreeProcessLevel(
    shape: Segment | Arc | Circle | Line | Point,
    level: Node[],
    minStop: number,
    tree: IntervalTree
  ): number {
    let minDist, maxDist

    for (const node of level) {
      ;[minDist, maxDist] = Distance.box2boxMinMax(shape.box, node.item.key)

      if (node.item.value instanceof Edge) {
        tree.insert([minDist, maxDist], node.item.value.shape)
      } else {
        tree.insert([minDist, maxDist], node.item.value)
      }

      if (LT(maxDist, minStop)) {
        minStop = maxDist // update minStop
      }
    }

    if (level.length === 0) return minStop

    // get the next level nodes in PlanarSet
    const newLevelLeft = level
      .map((node) =>
        node.left == null || node.left.isNil() ? undefined : node.left
      )
      .filter((node) => node !== undefined)
    const newLevelRight = level
      .map((node) =>
        node.right == null || node.right.isNil() ? undefined : node.right
      )
      .filter((node) => node !== undefined)

    const newLevel = [...newLevelLeft, ...newLevelRight].filter((node) => {
      const [minDist, _maxDist] = Distance.box2boxMinMax(shape.box, node!.max)
      return LE(minDist, minStop)
    }) as Node[]

    minStop = Distance.minMaxTreeProcessLevel(shape, newLevel, minStop, tree)
    return minStop
  }

  /**
   * This function initializes the interval tree and starts the process by calling minMaxTreeProcessLevel.
   * It returns the resulting interval tree.
   * @param shape
   * @param set PlanarSet
   * @param minStop
   */
  static minMaxTree(
    shape: Segment | Arc | Circle | Line | Point,
    set: PlanarSet,
    minStop: number = Number.POSITIVE_INFINITY
  ): IntervalTree {
    const tree = new IntervalTree()
    const level = [set.index.root!]
    const squaredMinStop =
      minStop < Number.POSITIVE_INFINITY
        ? minStop * minStop
        : Number.POSITIVE_INFINITY
    Distance.minMaxTreeProcessLevel(shape, level, squaredMinStop, tree)
    return tree
  }

  /**
   *
   * @param shape
   * @param node
   * @param minDistAndSegment
   * @returns
   */
  static minMaxTreeCalcDistance(
    shape: Segment | Arc | Circle | Line | Point,
    node: Node | null,
    minDistAndSegment: [number, Segment]
  ): [[number, Segment], boolean] {
    let minDistAndSegmentNew: [number, Segment], stop: boolean

    if (node != null && !node.isNil()) {
      ;[minDistAndSegmentNew, stop] = Distance.minMaxTreeCalcDistance(
        shape,
        node.left,
        minDistAndSegment
      )

      if (stop) {
        return [minDistAndSegmentNew, stop]
      }

      if (LT(minDistAndSegmentNew[0], Math.sqrt(node.item.key.low))) {
        return [minDistAndSegmentNew, true] // stop
      }

      const [dist, shortestSegment] = Distance.distance(shape, node.item.value)

      if (LT(dist, minDistAndSegmentNew[0])) {
        minDistAndSegmentNew = [dist, shortestSegment]
      }

      ;[minDistAndSegmentNew, stop] = Distance.minMaxTreeCalcDistance(
        shape,
        node.right,
        minDistAndSegmentNew
      )

      return [minDistAndSegmentNew, stop]
    }

    return [minDistAndSegment, false]
  }

  /**
   * Calculates distance between shape and Planar Set of shapes
   * @param shape
   * @param set
   * @param minStop
   * @returns
   */
  static shape2planarSet(
    shape: Segment | Arc | Circle | Line | Point,
    set: PlanarSet,
    minStop: number = Number.POSITIVE_INFINITY
  ) {
    let minDistAndSegment: [number, Segment] = [minStop, new Segment()]
    if (set instanceof PlanarSet) {
      const tree = Distance.minMaxTree(shape, set, minStop)
      ;[minDistAndSegment] = Distance.minMaxTreeCalcDistance(
        shape,
        tree.root,
        minDistAndSegment
      )
    }
    return minDistAndSegment
  }

  /**
   * Sort array of [distance, segment] pairs by distance
   * @param distanceAndSegment sorted array of [distance, segment] pairs
   */
  static sort(distanceAndSegment: [number, Segment][]): void {
    distanceAndSegment.sort((d1, d2) => {
      if (LT(d1[0], d2[0])) {
        return -1
      }
      if (GT(d1[0], d2[0])) {
        return 1
      }
      return 0
    })
  }

  static distance(
    shape1: Arc | Circle | Line | Segment | Point | Polygon,
    shape2: Arc | Circle | Line | Segment | Point | Polygon
  ): [number, Segment] {
    return shape1.distanceTo(shape2)
  }
}
