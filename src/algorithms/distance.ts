import { Point } from '../classes/point'
import { Line, line } from '../classes/line'
import { Segment } from '../classes/segment'
import { Vector } from '../classes/vector'
import { EQ_0, GE, GT, LT } from '../utils/utils'
import * as Intersection from '../algorithms/intersection'

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

  // /**
  //  * Calculate distance and shortest segment between point and circle
  //  * @param pt
  //  * @param circle
  //  * @returns {Number | Segment} - distance and shortest segment
  //  */
  // static point2circle(pt, circle) {
  //   const [dist2center, shortest_dist] = pt.distanceTo(circle.center)
  //   if (EQ_0(dist2center)) {
  //     return [circle.r, new Segment(pt, circle.toArc().start)]
  //   } else {
  //     const dist = Math.abs(dist2center - circle.r)
  //     const v = new Vector(circle.pc, pt).normalize().multiply(circle.r)
  //     const closest_point = circle.pc.translate(v)
  //     return [dist, new Segment(pt, closest_point)]
  //   }
  // }

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

  // /**
  //  * Calculate distance and shortest segment between point and arc
  //  * @param pt
  //  * @param arc
  //  * @returns {Number | Segment} - distance and shortest segment
  //  */
  // static point2arc(pt, arc) {
  //   const circle = new Circle(arc.pc, arc.r)
  //   const dist_and_segment = []
  //   let dist, shortest_segment
  //   ;[dist, shortest_segment] = Distance.point2circle(pt, circle)
  //   if (shortest_segment.end.on(arc)) {
  //     dist_and_segment.push(Distance.point2circle(pt, circle))
  //   }
  //   dist_and_segment.push(Distance.point2point(pt, arc.start))
  //   dist_and_segment.push(Distance.point2point(pt, arc.end))

  //   Distance.sort(dist_and_segment)

  //   return dist_and_segment[0]
  // }

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

  //   /**
  //    * Calculate distance and shortest segment between segment and circle
  //    * @param seg
  //    * @param circle
  //    * @returns {Number | Segment} - distance and shortest segment
  //    */
  //   static segment2circle(seg, circle) {
  //     /* Case 1 Segment and circle intersected. Return the first point and zero distance */
  //     const ip = seg.intersect(circle)
  //     if (ip.length > 0) {
  //       return [0, new Segment(ip[0], ip[0])]
  //     }

  //     // No intersection between segment and circle

  //     /* Case 2. Distance to projection of center point to line bigger than radius
  //      * And projection point belong to segment
  //      * Then measure again distance from projection to circle and return it */
  //     const line = new Line(seg.ps, seg.pe)
  //     const [dist, shortest_segment] = Distance.point2line(circle.center, line)
  //     if (GE(dist, circle.r) && shortest_segment.end.on(seg)) {
  //       return Distance.point2circle(shortest_segment.end, circle)
  //     } else {
  //       /* Case 3. Otherwise closest point is one of the end points of the segment */
  //       const [dist_from_start, shortest_segment_from_start] =
  //         Distance.point2circle(seg.start, circle)
  //       const [dist_from_end, shortest_segment_from_end] = Distance.point2circle(
  //         seg.end,
  //         circle
  //       )
  //       return LT(dist_from_start, dist_from_end)
  //         ? [dist_from_start, shortest_segment_from_start]
  //         : [dist_from_end, shortest_segment_from_end]
  //     }
  //   }

  //   /**
  //    * Calculate distance and shortest segment between segment and arc
  //    * @param seg
  //    * @param arc
  //    * @returns {Number | Segment} - distance and shortest segment
  //    */
  //   static segment2arc(seg, arc) {
  //     /* Case 1 Segment and arc intersected. Return the first point and zero distance */
  //     const ip = seg.intersect(arc)
  //     if (ip.length > 0) {
  //       return [0, new Segment(ip[0], ip[0])]
  //     }

  //     // No intersection between segment and arc
  //     const line = new Line(seg.ps, seg.pe)
  //     const circle = new Circle(arc.pc, arc.r)

  //     /* Case 2. Distance to projection of center point to line bigger than radius AND
  //      * projection point belongs to segment AND
  //      * distance from projection point to circle belongs to arc  =>
  //      * return this distance from projection to circle */
  //     const [dist_from_center, shortest_segment_from_center] =
  //       Distance.point2line(circle.center, line)
  //     if (
  //       GE(dist_from_center, circle.r) &&
  //       shortest_segment_from_center.end.on(seg)
  //     ) {
  //       const [dist_from_projection, shortest_segment_from_projection] =
  //         Distance.point2circle(shortest_segment_from_center.end, circle)
  //       if (shortest_segment_from_projection.end.on(arc)) {
  //         return [dist_from_projection, shortest_segment_from_projection]
  //       }
  //     }
  //     /* Case 3. Otherwise closest point is one of the end points of the segment */
  //     const dist_and_segment = []
  //     dist_and_segment.push(Distance.point2arc(seg.start, arc))
  //     dist_and_segment.push(Distance.point2arc(seg.end, arc))

  //     let dist_tmp, segment_tmp
  //     ;[dist_tmp, segment_tmp] = Distance.point2segment(arc.start, seg)
  //     dist_and_segment.push([dist_tmp, segment_tmp.reverse()])
  //     ;[dist_tmp, segment_tmp] = Distance.point2segment(arc.end, seg)
  //     dist_and_segment.push([dist_tmp, segment_tmp.reverse()])

  //     Distance.sort(dist_and_segment)
  //     return dist_and_segment[0]
  //   }

  //   /**
  //    * Calculate distance and shortest segment between two circles
  //    * @param circle1
  //    * @param circle2
  //    * @returns {Number | Segment} - distance and shortest segment
  //    */
  //   static circle2circle(circle1, circle2) {
  //     const ip = circle1.intersect(circle2)
  //     if (ip.length > 0) {
  //       return [0, new Segment(ip[0], ip[0])]
  //     }

  //     // Case 1. Concentric circles. Convert to arcs and take distance between two arc starts
  //     if (circle1.center.equalTo(circle2.center)) {
  //       const arc1 = circle1.toArc()
  //       const arc2 = circle2.toArc()
  //       return Distance.point2point(arc1.start, arc2.start)
  //     } else {
  //       // Case 2. Not concentric circles
  //       const line = new Line(circle1.center, circle2.center)
  //       const ip1 = line.intersect(circle1)
  //       const ip2 = line.intersect(circle2)

  //       const dist_and_segment = []

  //       dist_and_segment.push(Distance.point2point(ip1[0], ip2[0]))
  //       dist_and_segment.push(Distance.point2point(ip1[0], ip2[1]))
  //       dist_and_segment.push(Distance.point2point(ip1[1], ip2[0]))
  //       dist_and_segment.push(Distance.point2point(ip1[1], ip2[1]))

  //       Distance.sort(dist_and_segment)
  //       return dist_and_segment[0]
  //     }
  //   }

  //   /**
  //    * Calculate distance and shortest segment between two circles
  //    * @param circle
  //    * @param line
  //    * @returns {Number | Segment} - distance and shortest segment
  //    */
  //   static circle2line(circle, line) {
  //     const ip = circle.intersect(line)
  //     if (ip.length > 0) {
  //       return [0, new Segment(ip[0], ip[0])]
  //     }

  //     const [dist_from_center, shortest_segment_from_center] =
  //       Distance.point2line(circle.center, line)
  //     let [dist, shortest_segment] = Distance.point2circle(
  //       shortest_segment_from_center.end,
  //       circle
  //     )
  //     shortest_segment = shortest_segment.reverse()
  //     return [dist, shortest_segment]
  //   }

  //   /**
  //    * Calculate distance and shortest segment between arc and line
  //    * @param arc
  //    * @param line
  //    * @returns {Number | Segment} - distance and shortest segment
  //    */
  //   static arc2line(arc, line) {
  //     /* Case 1 Line and arc intersected. Return the first point and zero distance */
  //     const ip = line.intersect(arc)
  //     if (ip.length > 0) {
  //       return [0, new Segment(ip[0], ip[0])]
  //     }

  //     const circle = new Circle(arc.center, arc.r)

  //     /* Case 2. Distance to projection of center point to line bigger than radius AND
  //      * projection point belongs to segment AND
  //      * distance from projection point to circle belongs to arc  =>
  //      * return this distance from projection to circle */
  //     const [dist_from_center, shortest_segment_from_center] =
  //       Distance.point2line(circle.center, line)
  //     if (GE(dist_from_center, circle.r)) {
  //       const [dist_from_projection, shortest_segment_from_projection] =
  //         Distance.point2circle(shortest_segment_from_center.end, circle)
  //       if (shortest_segment_from_projection.end.on(arc)) {
  //         return [dist_from_projection, shortest_segment_from_projection]
  //       }
  //     } else {
  //       const dist_and_segment = []
  //       dist_and_segment.push(Distance.point2line(arc.start, line))
  //       dist_and_segment.push(Distance.point2line(arc.end, line))

  //       Distance.sort(dist_and_segment)
  //       return dist_and_segment[0]
  //     }
  //   }

  //   /**
  //    * Calculate distance and shortest segment between arc and circle
  //    * @param arc
  //    * @param circle2
  //    * @returns {Number | Segment} - distance and shortest segment
  //    */
  //   static arc2circle(arc, circle2) {
  //     const ip = arc.intersect(circle2)
  //     if (ip.length > 0) {
  //       return [0, new Segment(ip[0], ip[0])]
  //     }

  //     const circle1 = new Circle(arc.center, arc.r)

  //     const [dist, shortest_segment] = Distance.circle2circle(circle1, circle2)
  //     if (shortest_segment.start.on(arc)) {
  //       return [dist, shortest_segment]
  //     } else {
  //       const dist_and_segment = []

  //       dist_and_segment.push(Distance.point2circle(arc.start, circle2))
  //       dist_and_segment.push(Distance.point2circle(arc.end, circle2))

  //       Distance.sort(dist_and_segment)

  //       return dist_and_segment[0]
  //     }
  //   }

  //   /**
  //    * Calculate distance and shortest segment between two arcs
  //    * @param arc1
  //    * @param arc2
  //    * @returns {Number | Segment} - distance and shortest segment
  //    */
  //   static arc2arc(arc1, arc2) {
  //     const ip = arc1.intersect(arc2)
  //     if (ip.length > 0) {
  //       return [0, new Segment(ip[0], ip[0])]
  //     }

  //     const circle1 = new Circle(arc1.center, arc1.r)
  //     const circle2 = new Circle(arc2.center, arc2.r)

  //     const [dist, shortest_segment] = Distance.circle2circle(circle1, circle2)
  //     if (shortest_segment.start.on(arc1) && shortest_segment.end.on(arc2)) {
  //       return [dist, shortest_segment]
  //     } else {
  //       const dist_and_segment = []

  //       let dist_tmp, segment_tmp
  //       ;[dist_tmp, segment_tmp] = Distance.point2arc(arc1.start, arc2)
  //       if (segment_tmp.end.on(arc2)) {
  //         dist_and_segment.push([dist_tmp, segment_tmp])
  //       }

  //       ;[dist_tmp, segment_tmp] = Distance.point2arc(arc1.end, arc2)
  //       if (segment_tmp.end.on(arc2)) {
  //         dist_and_segment.push([dist_tmp, segment_tmp])
  //       }

  //       ;[dist_tmp, segment_tmp] = Distance.point2arc(arc2.start, arc1)
  //       if (segment_tmp.end.on(arc1)) {
  //         dist_and_segment.push([dist_tmp, segment_tmp.reverse()])
  //       }

  //       ;[dist_tmp, segment_tmp] = Distance.point2arc(arc2.end, arc1)
  //       if (segment_tmp.end.on(arc1)) {
  //         dist_and_segment.push([dist_tmp, segment_tmp.reverse()])
  //       }

  //       ;[dist_tmp, segment_tmp] = Distance.point2point(arc1.start, arc2.start)
  //       dist_and_segment.push([dist_tmp, segment_tmp])
  //       ;[dist_tmp, segment_tmp] = Distance.point2point(arc1.start, arc2.end)
  //       dist_and_segment.push([dist_tmp, segment_tmp])
  //       ;[dist_tmp, segment_tmp] = Distance.point2point(arc1.end, arc2.start)
  //       dist_and_segment.push([dist_tmp, segment_tmp])
  //       ;[dist_tmp, segment_tmp] = Distance.point2point(arc1.end, arc2.end)
  //       dist_and_segment.push([dist_tmp, segment_tmp])

  //       Distance.sort(dist_and_segment)

  //       return dist_and_segment[0]
  //     }
  //   }

  //   /**
  //    * Calculate distance and shortest segment between point and polygon
  //    * @param point
  //    * @param polygon
  //    * @returns {Number | Segment} - distance and shortest segment
  //    */
  //   static point2polygon(point, polygon) {
  //     let min_dist_and_segment = [Number.POSITIVE_INFINITY, new Segment()]
  //     for (const edge of polygon.edges) {
  //       const [dist, shortest_segment] =
  //         edge.shape instanceof Segment
  //           ? Distance.point2segment(point, edge.shape)
  //           : Distance.point2arc(point, edge.shape)
  //       if (LT(dist, min_dist_and_segment[0])) {
  //         min_dist_and_segment = [dist, shortest_segment]
  //       }
  //     }
  //     return min_dist_and_segment
  //   }

  //   static shape2polygon(shape, polygon) {
  //     let min_dist_and_segment = [Number.POSITIVE_INFINITY, new Segment()]
  //     for (const edge of polygon.edges) {
  //       const [dist, shortest_segment] = shape.distanceTo(edge.shape)
  //       if (LT(dist, min_dist_and_segment[0])) {
  //         min_dist_and_segment = [dist, shortest_segment]
  //       }
  //     }
  //     return min_dist_and_segment
  //   }

  //   /**
  //    * Calculate distance and shortest segment between two polygons
  //    * @param polygon1
  //    * @param polygon2
  //    * @returns {Number | Segment} - distance and shortest segment
  //    */
  //   static polygon2polygon(polygon1, polygon2) {
  //     let min_dist_and_segment = [Number.POSITIVE_INFINITY, new Segment()]
  //     for (const edge1 of polygon1.edges) {
  //       for (const edge2 of polygon2.edges) {
  //         const [dist, shortest_segment] = edge1.shape.distanceTo(edge2.shape)
  //         if (LT(dist, min_dist_and_segment[0])) {
  //           min_dist_and_segment = [dist, shortest_segment]
  //         }
  //       }
  //     }
  //     return min_dist_and_segment
  //   }

  //   /**
  //    * Returns [mindist, maxdist] array of squared minimal and maximal distance between boxes
  //    * Minimal distance by x is
  //    *    (box2.xmin - box1.xmax), if box1 is left to box2
  //    *    (box1.xmin - box2.xmax), if box2 is left to box1
  //    *    0,                       if box1 and box2 are intersected by x
  //    * Minimal distance by y is defined in the same way
  //    *
  //    * Maximal distance is estimated as a sum of squared dimensions of the merged box
  //    *
  //    * @param box1
  //    * @param box2
  //    * @returns {Number | Number} - minimal and maximal distance
  //    */
  //   static box2box_minmax(box1, box2) {
  //     const mindist_x = Math.max(
  //       Math.max(box1.xmin - box2.xmax, 0),
  //       Math.max(box2.xmin - box1.xmax, 0)
  //     )
  //     const mindist_y = Math.max(
  //       Math.max(box1.ymin - box2.ymax, 0),
  //       Math.max(box2.ymin - box1.ymax, 0)
  //     )
  //     const mindist = mindist_x * mindist_x + mindist_y * mindist_y

  //     const box = box1.merge(box2)
  //     const dx = box.xmax - box.xmin
  //     const dy = box.ymax - box.ymin
  //     const maxdist = dx * dx + dy * dy

  //     return [mindist, maxdist]
  //   }

  //   static minmax_tree_process_level(shape, level, min_stop, tree) {
  //     // Calculate minmax distance to each shape in current level
  //     // Insert result into the interval tree for further processing
  //     // update min_stop with maxdist, it will be the new stop distance
  //     let mindist, maxdist
  //     for (const node of level) {
  //       // [mindist, maxdist] = Distance.box2box_minmax(shape.box, node.max);
  //       // if (GT(mindist, min_stop))
  //       //     continue;

  //       // Estimate min-max dist to the shape stored in the node.item, using node.item.key which is shape's box
  //       ;[mindist, maxdist] = Distance.box2box_minmax(shape.box, node.item.key)
  //       if (node.item.value instanceof Edge) {
  //         tree.insert([mindist, maxdist], node.item.value.shape)
  //       } else {
  //         tree.insert([mindist, maxdist], node.item.value)
  //       }
  //       if (LT(maxdist, min_stop)) {
  //         min_stop = maxdist // this will be the new distance estimation
  //       }
  //     }

  //     if (level.length === 0) return min_stop

  //     // Calculate new level from left and right children of the current
  //     const new_level_left = level
  //       .map((node) => (node.left.isNil() ? undefined : node.left))
  //       .filter((node) => node !== undefined)
  //     const new_level_right = level
  //       .map((node) => (node.right.isNil() ? undefined : node.right))
  //       .filter((node) => node !== undefined)
  //     // Merge left and right subtrees and leave only relevant subtrees
  //     const new_level = [...new_level_left, ...new_level_right].filter((node) => {
  //       // Node subtree quick reject, node.max is a subtree box
  //       const [mindist, maxdist] = Distance.box2box_minmax(shape.box, node.max)
  //       return LE(mindist, min_stop)
  //     })

  //     min_stop = Distance.minmax_tree_process_level(
  //       shape,
  //       new_level,
  //       min_stop,
  //       tree
  //     )
  //     return min_stop
  //   }

  //   /**
  //    * Calculates sorted tree of [mindist, maxdist] intervals between query shape
  //    * and shapes of the planar set.
  //    * @param shape
  //    * @param set
  //    */
  //   static minmax_tree(shape, set, min_stop) {
  //     const tree = new IntervalTree()
  //     const level = [set.index.root]
  //     let squared_min_stop =
  //       min_stop < Number.POSITIVE_INFINITY
  //         ? min_stop * min_stop
  //         : Number.POSITIVE_INFINITY
  //     squared_min_stop = Distance.minmax_tree_process_level(
  //       shape,
  //       level,
  //       squared_min_stop,
  //       tree
  //     )
  //     return tree
  //   }

  //   static minmax_tree_calc_distance(shape, node, min_dist_and_segment) {
  //     let min_dist_and_segment_new, stop
  //     if (node != null && !node.isNil()) {
  //       ;[min_dist_and_segment_new, stop] = Distance.minmax_tree_calc_distance(
  //         shape,
  //         node.left,
  //         min_dist_and_segment
  //       )

  //       if (stop) {
  //         return [min_dist_and_segment_new, stop]
  //       }

  //       if (
  //         LT(
  //           min_dist_and_segment_new[0],
  //           Math.sqrt(node.item.key.low)
  //         )
  //       ) {
  //         return [min_dist_and_segment_new, true] // stop condition
  //       }

  //       const [dist, shortest_segment] = Distance.distance(shape, node.item.value)
  //       // console.log(dist)
  //       if (LT(dist, min_dist_and_segment_new[0])) {
  //         min_dist_and_segment_new = [dist, shortest_segment]
  //       }

  //       ;[min_dist_and_segment_new, stop] = Distance.minmax_tree_calc_distance(
  //         shape,
  //         node.right,
  //         min_dist_and_segment_new
  //       )

  //       return [min_dist_and_segment_new, stop]
  //     }

  //     return [min_dist_and_segment, false]
  //   }

  //   /**
  //    * Calculates distance between shape and Planar Set of shapes
  //    * @param shape
  //    * @param {PlanarSet} set
  //    * @param {Number} min_stop
  //    * @returns {*}
  //    */
  //   static shape2planarSet(shape, set, min_stop = Number.POSITIVE_INFINITY) {
  //     let min_dist_and_segment = [min_stop, new Segment()]
  //     let stop = false
  //     if (set instanceof PlanarSet) {
  //       const tree = Distance.minmax_tree(shape, set, min_stop)
  //       ;[min_dist_and_segment, stop] = Distance.minmax_tree_calc_distance(
  //         shape,
  //         tree.root,
  //         min_dist_and_segment
  //       )
  //     }
  //     return min_dist_and_segment
  //   }

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

  //   static distance(shape1, shape2) {
  //     return shape1.distanceTo(shape2)
  //   }
}
