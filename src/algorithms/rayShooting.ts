import * as Utils from '../utils/utils'
import * as Constants from '../utils/constants'
import { Config } from '../utils/config'
import { Polygon } from '../classes/polygon'
import { Point } from '../classes/point'
import { Ray } from '../classes/ray'
import { Line } from '../classes/line'
import { Box } from '../classes/box'
import { Edge } from '../classes/edge'
import { Segment } from '../classes/segment'
/**
 * Implements ray shooting algorithm. Returns relation between point and polygon: inside, outside or boundary
 * @param polygon - polygon to test
 * @param point - point to test
 * @returns relation between point and polygon: inside, outside or boundary
 */
export function rayShooting(polygon: Polygon, point: Point): number {
  let contains = undefined

  // 1. Quick reject
  // if (polygon.box.not_intersect(point.box)) {
  //     return OUTSIDE;
  // }

  const ray = new Ray(point)
  const line = new Line(ray.pt, ray.norm)

  // 2. Locate relevant edges of the polygon
  const searchBox = new Box(
    ray.box.xmin - Config.DP_TOL,
    ray.box.ymin - Config.DP_TOL,
    ray.box.xmax,
    ray.box.ymax + Config.DP_TOL
  )

  if (polygon.box.notIntersect(searchBox)) {
    return Constants.OUTSIDE
  }

  const respEdges = polygon.edges.search(searchBox) as Edge[]

  if (respEdges.length == 0) {
    return Constants.OUTSIDE
  }

  // 2.5 Check if boundary
  for (const edge of respEdges) {
    if (edge.shape.contains(point)) {
      return Constants.BOUNDARY
    }
  }

  // 3. Calculate intersections
  const intersections = []
  for (const edge of respEdges) {
    for (const ip of ray.intersect(edge.shape)) {
      // If intersection is equal to query point then point lays on boundary
      if (ip.equalTo(point)) {
        return Constants.BOUNDARY
      }

      intersections.push({
        pt: ip,
        edge: edge
      })
    }
  }

  // 4. Sort intersection in x-ascending order
  intersections.sort((i1, i2) => {
    if (Utils.LT(i1.pt.x, i2.pt.x)) {
      return -1
    }
    if (Utils.GT(i1.pt.x, i2.pt.x)) {
      return 1
    }
    return 0
  })

  // 5. Count real intersections, exclude touching
  let counter = 0

  for (let i = 0; i < intersections.length; i++) {
    const intersection = intersections[i]
    if (intersection.pt.equalTo(intersection.edge.shape.start)) {
      /* skip same point between same edges if already counted */
      if (
        i > 0 &&
        intersection.pt.equalTo(intersections[i - 1].pt) &&
        intersection.edge.prev === intersections[i - 1].edge
      ) {
        continue
      }
      let prevEdge = intersection.edge.prev as Edge
      while (Utils.EQ_0(prevEdge.length)) {
        prevEdge = prevEdge.prev as Edge
      }
      const prevTangent = prevEdge.shape.tangentInEnd()
      const prevPoint = intersection.pt.translate(prevTangent)

      const curTangent = intersection.edge.shape.tangentInStart()
      const curPoint = intersection.pt.translate(curTangent)

      const prevOnTheLeft = prevPoint.leftTo(line)
      const curOnTheLeft = curPoint.leftTo(line)

      if (
        (prevOnTheLeft && !curOnTheLeft) ||
        (!prevOnTheLeft && curOnTheLeft)
      ) {
        counter++
      }
    } else if (intersection.pt.equalTo(intersection.edge.shape.end)) {
      /* skip same point between same edges if already counted */
      if (
        i > 0 &&
        intersection.pt.equalTo(intersections[i - 1].pt) &&
        intersection.edge.next === intersections[i - 1].edge
      ) {
        continue
      }
      let nextEdge = intersection.edge.next as Edge
      while (Utils.EQ_0(nextEdge.length)) {
        nextEdge = nextEdge.next as Edge
      }
      const nextTangent = nextEdge.shape.tangentInStart()
      const nextPoint = intersection.pt.translate(nextTangent)

      const curTangent = intersection.edge.shape.tangentInEnd()
      const curPoint = intersection.pt.translate(curTangent)

      const nextOnTheLeft = nextPoint.leftTo(line)
      const curOnTheLeft = curPoint.leftTo(line)

      if (
        (nextOnTheLeft && !curOnTheLeft) ||
        (!nextOnTheLeft && curOnTheLeft)
      ) {
        counter++
      }
    } else {
      /* intersection point is not a coincident with a vertex */
      if (intersection.edge.shape instanceof Segment) {
        counter++
      } else {
        /* Check if ray does not touch the curve in the extremal (top or bottom) point */
        const box = intersection.edge.shape.box
        if (
          !(
            Utils.EQ(intersection.pt.y, box.ymin) ||
            Utils.EQ(intersection.pt.y, box.ymax)
          )
        ) {
          counter++
        }
      }
    }
  }

  // 6. Odd or even?
  contains = counter % 2 == 1 ? Constants.INSIDE : Constants.OUTSIDE

  return contains
}
