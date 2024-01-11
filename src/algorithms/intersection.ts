import { Arc } from '../classes/arc'
import { Box } from '../classes/box'
import { Circle } from '../classes/circle'
import { Line } from '../classes/line'
import { Point } from '../classes/point'
import { Segment } from '../classes/segment'
import { Vector } from '../classes/vector'
import { EQ, EQ_0, GE, GT, LE, LT } from '../utils/utils'

export function intersectLine2Line(line1: Line, line2: Line): Point[] {
  const ip = []

  const [A1, B1, C1] = line1.standard
  const [A2, B2, C2] = line2.standard

  /* Cramer's rule */
  const det = A1 * B2 - B1 * A2
  const detX = C1 * B2 - B1 * C2
  const detY = A1 * C2 - C1 * A2

  if (!EQ_0(det)) {
    const x = detX / det
    const y = detY / det
    ip.push(new Point(x, y))
  }

  return ip
}

export function intersectLine2Circle(line: Line, circle: Circle): Point[] {
  const ip: Point[] = []
  const prj = circle.pc.projectionOn(line) // projection of circle center on a line
  const dist = circle.pc.distanceTo(prj)[0] // distance from circle center to projection

  if (EQ(dist, circle.r)) {
    // line tangent to circle - return single intersection point
    ip.push(prj)
  } else if (LT(dist, circle.r)) {
    // return two intersection points
    const delta = Math.sqrt(circle.r * circle.r - dist * dist)
    let transVec, pt

    transVec = line.norm.rotate90CCW().multiply(delta)
    pt = prj.translate(transVec)
    ip.push(pt)

    transVec = line.norm.rotate90CW().multiply(delta)
    pt = prj.translate(transVec)
    ip.push(pt)
  }
  return ip
}

export function intersectLine2Box(line: Line, box: Box): Point[] {
  const ips = []
  for (const seg of box.toSegments()) {
    const ipsTmp = intersectSegment2Line(seg, line)
    for (const pt of ipsTmp) {
      if (!ptInIntPoints(pt, ips)) {
        ips.push(pt)
      }
    }
  }
  return ips
}

export function intersectLine2Arc(line: Line, arc: Arc): Point[] {
  const ips: Point[] = []

  if (intersectLine2Box(line, arc.box).length === 0) {
    return ips
  }

  const circle = new Circle(arc.pc, arc.r)
  const ipsTmp = intersectLine2Circle(line, circle)
  for (const pt of ipsTmp) {
    if (pt.on(arc)) {
      ips.push(pt)
    }
  }

  return ips
}

export function intersectSegment2Line(seg: Segment, line: Line): Point[] {
  const ip = []

  // Boundary cases
  if (seg.ps.on(line)) {
    ip.push(seg.ps)
  }

  // If both ends lay on line, return two intersection points
  if (seg.pe.on(line) && !seg.isZeroLength()) {
    ip.push(seg.pe)
  }

  if (ip.length > 0) {
    return ip // done, intersection found
  }

  // If zero-length segment and nothing found, return no intersections
  if (seg.isZeroLength()) {
    return ip
  }

  // Not a boundary case, check if both points are on the same side and
  // hence there is no intersection
  if (
    (seg.ps.leftTo(line) && seg.pe.leftTo(line)) ||
    (!seg.ps.leftTo(line) && !seg.pe.leftTo(line))
  ) {
    return ip
  }

  // Calculate intersection between lines
  const line1 = new Line(seg.ps, seg.pe)
  return intersectLine2Line(line1, line)
}

export function intersectSegment2Segment(
  seg1: Segment,
  seg2: Segment
): Point[] {
  const ip: Point[] = []

  // quick reject
  if (seg1.box.notIntersect(seg2.box)) {
    return ip
  }

  // Special case of seg1 zero length
  if (seg1.isZeroLength()) {
    if (seg1.ps.on(seg2)) {
      ip.push(seg1.ps)
    }
    return ip
  }

  // Special case of seg2 zero length
  if (seg2.isZeroLength()) {
    if (seg2.ps.on(seg1)) {
      ip.push(seg2.ps)
    }
    return ip
  }

  // Neither seg1 nor seg2 is zero length
  const line1 = new Line(seg1.ps, seg1.pe)
  const line2 = new Line(seg2.ps, seg2.pe)

  // Check overlapping between segments in case of incidence
  // If segments touching, add one point. If overlapping, add two points
  if (line1.incidentTo(line2)) {
    if (seg1.ps.on(seg2)) {
      ip.push(seg1.ps)
    }
    if (seg1.pe.on(seg2)) {
      ip.push(seg1.pe)
    }
    if (
      seg2.ps.on(seg1) &&
      !seg2.ps.equalTo(seg1.ps) &&
      !seg2.ps.equalTo(seg1.pe)
    ) {
      ip.push(seg2.ps)
    }
    if (
      seg2.pe.on(seg1) &&
      !seg2.pe.equalTo(seg1.ps) &&
      !seg2.pe.equalTo(seg1.pe)
    ) {
      ip.push(seg2.pe)
    }
  } else {
    /* not incident - parallel or intersect */
    // Calculate intersection between lines
    const newIp = intersectLine2Line(line1, line2)
    if (newIp.length > 0) {
      if (
        isPointInSegmentBox(newIp[0], seg1) &&
        isPointInSegmentBox(newIp[0], seg2)
      ) {
        ip.push(newIp[0])
      }
    }
  }
  return ip
}

function isPointInSegmentBox(point: Point, segment: Segment): boolean {
  const box = segment.box
  return (
    LE(point.x, box.xmax) &&
    GE(point.x, box.xmin) &&
    LE(point.y, box.ymax) &&
    GE(point.y, box.ymin)
  )
}

export function intersectSegment2Circle(
  segment: Segment,
  circle: Circle
): Point[] {
  const ips: Point[] = []

  if (segment.box.notIntersect(circle.box)) {
    return ips
  }

  // Special case of zero length segment
  if (segment.isZeroLength()) {
    const [dist] = segment.ps.distanceTo(circle.pc)
    if (EQ(dist, circle.r)) {
      ips.push(segment.ps)
    }
    return ips
  }

  // Non zero-length segment
  const line = new Line(segment.ps, segment.pe)

  const ipsTmp = intersectLine2Circle(line, circle)

  for (const ip of ipsTmp) {
    if (ip.on(segment)) {
      ips.push(ip)
    }
  }

  return ips
}

export function intersectSegment2Arc(segment: Segment, arc: Arc): Point[] {
  const ip: Point[] = []

  if (segment.box.notIntersect(arc.box)) {
    return ip
  }

  // Special case of zero-length segment
  if (segment.isZeroLength()) {
    if (segment.ps.on(arc)) {
      ip.push(segment.ps)
    }
    return ip
  }

  // Non-zero length segment
  const line = new Line(segment.ps, segment.pe)
  const circle = new Circle(arc.pc, arc.r)

  const ipTmp = intersectLine2Circle(line, circle)

  for (const pt of ipTmp) {
    if (pt.on(segment) && pt.on(arc)) {
      ip.push(pt)
    }
  }
  return ip
}

// export function intersectSegment2Box(segment, box) {
//   const ips = []
//   for (const seg of box.toSegments()) {
//     const ipsTmp = intersectSegment2Segment(seg, segment)
//     for (const ip of ipsTmp) {
//       ips.push(ip)
//     }
//   }
//   return ips
// }

export function intersectCircle2Circle(
  circle1: Circle,
  circle2: Circle
): Point[] {
  const ip: Point[] = []

  if (circle1.box.notIntersect(circle2.box)) {
    return ip
  }

  const vec = new Vector(circle1.pc, circle2.pc)

  const r1 = circle1.r
  const r2 = circle2.r

  // Degenerated circle
  if (EQ_0(r1) || EQ_0(r2)) return ip

  // In case of equal circles return one leftmost point
  if (EQ_0(vec.x) && EQ_0(vec.y) && EQ(r1, r2)) {
    ip.push(circle1.pc.translate(-r1, 0))
    return ip
  }

  const dist = circle1.pc.distanceTo(circle2.pc)[0]

  if (GT(dist, r1 + r2))
    // circles too far, no intersections
    return ip

  if (LT(dist, Math.abs(r1 - r2)))
    // one circle is contained within another, no intersections
    return ip

  // Normalize vector.
  vec.x /= dist
  vec.y /= dist

  let pt

  // Case of touching from outside or from inside - single intersection point
  if (EQ(dist, r1 + r2) || EQ(dist, Math.abs(r1 - r2))) {
    pt = circle1.pc.translate(r1 * vec.x, r1 * vec.y)
    ip.push(pt)
    return ip
  }

  // Case of two intersection points

  // Distance from first center to center of common chord:
  //   a = (r1^2 - r2^2 + d^2) / 2d
  // Separate for better accuracy
  const a = (r1 * r1) / (2 * dist) - (r2 * r2) / (2 * dist) + dist / 2

  const midPoint = circle1.pc.translate(a * vec.x, a * vec.y)
  const h = Math.sqrt(r1 * r1 - a * a)
  // let norm;

  // norm = vec.rotate90CCW().multiply(h);
  pt = midPoint.translate(vec.rotate90CCW().multiply(h))
  ip.push(pt)

  // norm = vec.rotate90CW();
  pt = midPoint.translate(vec.rotate90CW().multiply(h))
  ip.push(pt)

  return ip
}

// export function intersectCircle2Box(circle, box) {
//   const ips = []
//   for (const seg of box.toSegments()) {
//     const ipsTmp = intersectSegment2Circle(seg, circle)
//     for (const ip of ipsTmp) {
//       ips.push(ip)
//     }
//   }
//   return ips
// }

export function intersectArc2Arc(arc1: Arc, arc2: Arc): Point[] {
  const ip: Point[] = []

  if (arc1.box.notIntersect(arc2.box)) {
    return ip
  }

  // Special case: overlapping arcs
  // May return up to 4 intersection points
  if (arc1.pc.equalTo(arc2.pc) && EQ(arc1.r, arc2.r)) {
    let pt

    pt = arc1.start
    if (pt.on(arc2)) ip.push(pt)

    pt = arc1.end
    if (pt.on(arc2)) ip.push(pt)

    pt = arc2.start
    if (pt.on(arc1)) ip.push(pt)

    pt = arc2.end
    if (pt.on(arc1)) ip.push(pt)

    return ip
  }

  // Common case
  const circle1 = new Circle(arc1.pc, arc1.r)
  const circle2 = new Circle(arc2.pc, arc2.r)
  const ipTmp = circle1.intersect(circle2)
  for (const pt of ipTmp) {
    if (pt.on(arc1) && pt.on(arc2)) {
      ip.push(pt)
    }
  }
  return ip
}

export function intersectArc2Circle(arc: Arc, circle: Circle): Point[] {
  const ip: Point[] = []

  if (arc.box.notIntersect(circle.box)) {
    return ip
  }

  // Case when arc center incident to circle center
  // Return arc's end points as 2 intersection points
  if (circle.pc.equalTo(arc.pc) && EQ(circle.r, arc.r)) {
    ip.push(arc.start)
    ip.push(arc.end)
    return ip
  }

  // Common case
  const circle1 = circle
  const circle2 = new Circle(arc.pc, arc.r)
  const ipTmp = intersectCircle2Circle(circle1, circle2)
  for (const pt of ipTmp) {
    if (pt.on(arc)) {
      ip.push(pt)
    }
  }
  return ip
}

// export function intersectArc2Box(arc, box) {
//   const ips = []
//   for (const seg of box.toSegments()) {
//     const ipsTmp = intersectSegment2Arc(seg, arc)
//     for (const ip of ipsTmp) {
//       ips.push(ip)
//     }
//   }
//   return ips
// }

// export function intersectEdge2Segment(edge, segment) {
//   return edge.isSegment()
//     ? intersectSegment2Segment(edge.shape, segment)
//     : intersectSegment2Arc(segment, edge.shape)
// }

// export function intersectEdge2Arc(edge, arc) {
//   return edge.isSegment()
//     ? intersectSegment2Arc(edge.shape, arc)
//     : intersectArc2Arc(edge.shape, arc)
// }

// export function intersectEdge2Line(edge, line) {
//   return edge.isSegment()
//     ? intersectSegment2Line(edge.shape, line)
//     : intersectLine2Arc(line, edge.shape)
// }

// export function intersectEdge2Circle(edge, circle) {
//   return edge.isSegment()
//     ? intersectSegment2Circle(edge.shape, circle)
//     : intersectArc2Circle(edge.shape, circle)
// }

// export function intersectSegment2Polygon(segment, polygon) {
//   const ip = []

//   for (const edge of polygon.edges) {
//     for (const pt of intersectEdge2Segment(edge, segment)) {
//       ip.push(pt)
//     }
//   }

//   return ip
// }

// export function intersectArc2Polygon(arc, polygon) {
//   const ip = []

//   for (const edge of polygon.edges) {
//     for (const pt of intersectEdge2Arc(edge, arc)) {
//       ip.push(pt)
//     }
//   }

//   return ip
// }

// export function intersectLine2Polygon(line, polygon) {
//   const ip = []

//   if (polygon.isEmpty()) {
//     return ip
//   }

//   for (const edge of polygon.edges) {
//     for (const pt of intersectEdge2Line(edge, line)) {
//       if (!ptInIntPoints(pt, ip)) {
//         ip.push(pt)
//       }
//     }
//   }

//   return line.sortPoints(ip)
// }

// export function intersectCircle2Polygon(circle, polygon) {
//   const ip = []

//   if (polygon.isEmpty()) {
//     return ip
//   }

//   for (const edge of polygon.edges) {
//     for (const pt of intersectEdge2Circle(edge, circle)) {
//       ip.push(pt)
//     }
//   }

//   return ip
// }

// export function intersectEdge2Edge(edge1, edge2) {
//   const shape1 = edge1.shape
//   const shape2 = edge2.shape
//   return edge1.isSegment()
//     ? edge2.isSegment()
//       ? intersectSegment2Segment(shape1, shape2)
//       : intersectSegment2Arc(shape1, shape2)
//     : edge2.isSegment()
//       ? intersectSegment2Arc(shape2, shape1)
//       : intersectArc2Arc(shape1, shape2)
// }

// export function intersectEdge2Polygon(edge, polygon) {
//   const ip = []

//   if (polygon.isEmpty() || edge.shape.box.not_intersect(polygon.box)) {
//     return ip
//   }

//   const resp_edges = polygon.edges.search(edge.shape.box)

//   for (const resp_edge of resp_edges) {
//     for (const pt of intersectEdge2Edge(edge, resp_edge)) {
//       ip.push(pt)
//     }
//   }

//   return ip
// }

// export function intersectMultiline2Polygon(multiline, polygon) {
//   let ip = []

//   if (polygon.isEmpty() || multiline.size === 0) {
//     return ip
//   }

//   for (const edge of multiline) {
//     const ip_edge = intersectEdge2Polygon(edge, polygon)
//     const ip_sorted = edge.shape.sortPoints(ip_edge) // TODO: support arc edge
//     ip = [...ip, ...ip_sorted]
//   }

//   return ip
// }

// export function intersectPolygon2Polygon(polygon1, polygon2) {
//   const ip = []

//   if (polygon1.isEmpty() || polygon2.isEmpty()) {
//     return ip
//   }

//   if (polygon1.box.not_intersect(polygon2.box)) {
//     return ip
//   }

//   for (const edge1 of polygon1.edges) {
//     for (const pt of intersectEdge2Polygon(edge1, polygon2)) {
//       ip.push(pt)
//     }
//   }

//   return ip
// }

// export function intersectBox2Box(box1, box2) {
//   const ip = []
//   for (const segment1 of box1.toSegments()) {
//     for (const segment2 of box2.toSegments()) {
//       for (const pt of intersectSegment2Segment(segment1, segment2)) {
//         ip.push(pt)
//       }
//     }
//   }
//   return ip
// }

// export function intersectShape2Polygon(shape, polygon) {
//   if (shape instanceof Line) {
//     return intersectLine2Polygon(shape, polygon)
//   } else if (shape instanceof Segment) {
//     return intersectSegment2Polygon(shape, polygon)
//   } else if (shape instanceof Arc) {
//     return intersectArc2Polygon(shape, polygon)
//   } else {
//     return []
//   }
// }

function ptInIntPoints(newPt: Point, ip: Point[]): boolean {
  return ip.some((pt) => pt.equalTo(newPt))
}

// function createLineFromRay(ray) {
//   return new Line(ray.start, ray.norm)
// }
// export function intersectRay2Segment(ray, segment) {
//   return intersectSegment2Line(segment, createLineFromRay(ray)).filter((pt) =>
//     ray.contains(pt)
//   )
// }

// export function intersectRay2Arc(ray, arc) {
//   return intersectLine2Arc(createLineFromRay(ray), arc).filter((pt) =>
//     ray.contains(pt)
//   )
// }

// export function intersectRay2Circle(ray, circle) {
//   return intersectLine2Circle(createLineFromRay(ray), circle).filter((pt) =>
//     ray.contains(pt)
//   )
// }

// export function intersectRay2Box(ray, box) {
//   return intersectLine2Box(createLineFromRay(ray), box).filter((pt) =>
//     ray.contains(pt)
//   )
// }

// export function intersectRay2Line(ray, line) {
//   return intersectLine2Line(createLineFromRay(ray), line).filter((pt) =>
//     ray.contains(pt)
//   )
// }

// export function intersectRay2Ray(ray1, ray2) {
//   return intersectLine2Line(createLineFromRay(ray1), createLineFromRay(ray2))
//     .filter((pt) => ray1.contains(pt))
//     .filter((pt) => ray2.contains(pt))
// }

// export function intersectRay2Polygon(ray, polygon) {
//   return intersectLine2Polygon(createLineFromRay(ray), polygon).filter((pt) =>
//     ray.contains(pt)
//   )
// }
