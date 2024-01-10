import {
  Point,
  // Circle,
  Line,
  Segment,
  // Polygon,
  point,
  vector,
  line,
  segment
} from '../index'
import { EQ } from '../utils/utils'

describe('Segment', function () {
  it('May create new instance of Segment', function () {
    const segment = new Segment()
    expect(segment).toBeInstanceOf(Segment)
  })
  it('Constructor Segment(ps, pe) creates new instance of Segment', function () {
    const ps = new Point(1, 1)
    const pe = new Point(2, 3)
    const segment = new Segment(ps, pe)
    expect(segment.start).toEqual({ x: 1, y: 1 })
    expect(segment.end).toEqual({ x: 2, y: 3 })
  })
  it('May constructor by array [4]', function () {
    const ps = new Point(1, 1)
    const pe = new Point(2, 3)
    const segment = new Segment([ps.x, ps.y, pe.x, pe.y])
    expect(segment.start).toEqual(ps)
    expect(segment.end).toEqual(pe)
  })
  it('May constructor by 4 number', function () {
    const ps = new Point(1, 1)
    const pe = new Point(2, 3)
    const segment = new Segment(ps.x, ps.y, pe.x, pe.y)
    expect(segment.start).toEqual(ps)
    expect(segment.end).toEqual(pe)
  })
  it('New segment may be constructed by function call', function () {
    expect(segment(point(1, 1), point(2, 3))).toEqual(
      new Segment(new Point(1, 1), new Point(2, 3))
    )
  })
  it('Method clone copy to a new instance of Segment', function () {
    const ps = new Point(1, 1)
    const pe = new Point(2, 3)
    const segment = new Segment(ps, pe)
    expect(segment.clone()).toEqual(segment)
  })
  it('Method length returns length of segment', function () {
    const ps = new Point(1, 1)
    const pe = new Point(5, 4)
    const segment = new Segment(ps, pe)
    expect(segment.length).toBe(5.0)
  })
  it('Method box returns bounding box of segment', function () {
    const ps = new Point(1, 1)
    const pe = new Point(5, 4)
    const segment = new Segment(ps, pe)
    expect(segment.box).toEqual({ xmin: 1, ymin: 1, xmax: 5, ymax: 4 })
  })
  it('Method slope returns slope of segment', function () {
    const ps = new Point(1, 1)
    const pe = new Point(5, 5)
    const segment = new Segment(ps, pe)
    expect(segment.slope).toBe(Math.PI / 4)
  })
  it('Method contains returns true if point belongs to segment', function () {
    const ps = new Point(-2, 2)
    const pe = new Point(2, 2)
    const segment = new Segment(ps, pe)
    const pt = new Point(1, 2)
    expect(segment.contains(pt)).toBe(true)
  })
  it('Method tangentInStart and tangentInEnd returns vector [ps pe] and [pe, ps]', function () {
    const ps = new Point(5, 1)
    const pe = new Point(5, 5)
    const segment = new Segment(ps, pe)
    expect(segment.tangentInStart()).toEqual(vector(0, 1))
    expect(segment.tangentInEnd()).toEqual(vector(0, -1))
  })
  it('Calculates middle point', function () {
    const ps = new Point(-2, -2)
    const pe = new Point(2, 2)
    const segment = new Segment(ps, pe)
    expect(segment.middle()).toEqual({ x: 0, y: 0 })
  })
  it('Can translate segment by given vector', function () {
    const seg = segment(0, 0, 3, 3)
    const v = vector(-1, -1)
    const segT = segment(-1, -1, 2, 2)
    expect(seg.translate(v)).toEqual(segT)
  })
  it('Can rotate by angle around center of bounding box', function () {
    const seg = segment(0, 0, 6, 0)
    const segPlusPi2 = segment(3, -3, 3, 3)
    const segMinuspi2 = segment(3, 3, 3, -3)
    const center = seg.box.center
    expect(seg.rotate(Math.PI / 2, center).equalTo(segPlusPi2)).toBe(true)
    expect(seg.rotate(-Math.PI / 2, center).equalTo(segMinuspi2)).toBe(true)
  })
  it('Can rotate by angle around given point', function () {
    const seg = segment(1, 1, 3, 3)
    const segPlusPi2 = segment(1, 1, -1, 3)
    const segMinuspi2 = segment(1, 1, 3, -1)
    expect(seg.rotate(Math.PI / 2, seg.start).equalTo(segPlusPi2)).toBe(true)
    expect(seg.rotate(-Math.PI / 2, seg.start).equalTo(segMinuspi2)).toBe(true)
  })
})
describe('Segment.Intersect', function () {
  it('Intersection with Segment - not parallel segments case (one point)', function () {
    const segment1 = new Segment(new Point(0, 0), new Point(2, 2))
    const segment2 = new Segment(new Point(0, 2), new Point(2, 0))
    expect(segment1.intersect(segment2).length).toBe(1)
    expect(segment1.intersect(segment2)[0]).toEqual({ x: 1, y: 1 })
  })
  it('Intersection with Segment - overlapping segments case (two points)', function () {
    const segment1 = new Segment(new Point(0, 0), new Point(2, 2))
    const segment2 = new Segment(new Point(3, 3), new Point(1, 1))
    expect(segment1.intersect(segment2).length).toBe(2)
    expect(segment1.intersect(segment2)[0]).toEqual({ x: 2, y: 2 })
    expect(segment1.intersect(segment2)[1]).toEqual({ x: 1, y: 1 })
  })
  it('Intersection with Segment - boxes intersecting, segments not intersecting', function () {
    const segment1 = new Segment(new Point(0, 0), new Point(2, 2))
    const segment2 = new Segment(new Point(0.5, 1.5), new Point(-2, -4))
    expect(segment1.box.intersect(segment2.box)).toBe(true)
    expect(segment1.intersect(segment2).length).toBe(0)
  })
  // it('Intersection with Segment - boxes not intersecting, quick reject', function () {
  //   const segment1 = new Segment(new Point(0, 0), new Point(2, 2))
  //   const segment2 = new Segment(new Point(-0.5, 2.5), new Point(-2, -4))
  //   expect(segment1.box.not_intersect(segment2.box)).toBe(true)
  //   expect(segment1.intersect(segment2).length).toBe(0)
  // })
  it('Intersection with Line - not parallel segments case (one point)', function () {
    const segment = new Segment(new Point(0, 0), new Point(2, 2))
    const line = new Line(new Point(0, 2), new Point(2, 0))
    expect(segment.intersect(line).length).toBe(1)
    expect(segment.intersect(line)[0]).toEqual({ x: 1, y: 1 })
  })
  it('Intersection with Line - segment lays on line case (two points)', function () {
    const segment = new Segment(0, 0, 2, 2)
    const line = new Line(new Point(3, 3), new Point(1, 1))
    expect(segment.intersect(line).length).toBe(2)
    expect(segment.intersect(line)[0]).toEqual({ x: 0, y: 0 })
    expect(segment.intersect(line)[1]).toEqual({ x: 2, y: 2 })
  })
  // it('Intersection with Circle', function () {
  //   const segment = new Segment(0, 0, 2, 2)
  //   const circle = new Circle(new Point(0, 0), 1)
  //   const ip_expected = new Point(Math.sqrt(2) / 2, Math.sqrt(2) / 2)
  //   expect(segment.intersect(circle).length).toBe(1)
  //   expect(segment.intersect(circle)[0].equalTo(ip_expected)).toBe(true)
  // })
  // it('Intersection with Circle - case of tangent', function () {
  //   const segment = new Segment(-2, 2, 2, 2)
  //   const circle = new Circle(new Point(0, 0), 2)
  //   const ip_expected = new Point(0, 2)
  //   expect(segment.intersect(circle).length).toBe(1)
  //   expect(segment.intersect(circle)[0].equalTo(ip_expected)).toBe(true)
  // })
  // it('Intersection with Polygon', function () {
  //   const segment = new Segment(150, -20, 150, 60)

  //   const points = [
  //     point(100, 20),
  //     point(200, 20),
  //     point(200, 40),
  //     point(100, 40)
  //   ]

  //   const poly = new Polygon()
  //   const face = poly.addFace(points)

  //   const ip_expected = new Point(0, 2)
  //   const ip = segment.intersect(poly)
  //   expect(ip.length).toBe(2)
  //   expect(ip[0].equalTo(point(150, 20))).toBe(true)
  //   expect(ip[1].equalTo(point(150, 40))).toBe(true)
  // })
  // it('Intersection with Box', function () {
  //   const segment = new Segment(150, -20, 150, 60)

  //   const points = [
  //     point(100, 20),
  //     point(200, 20),
  //     point(200, 40),
  //     point(100, 40)
  //   ]

  //   const poly = new Polygon()
  //   const face = poly.addFace(points)

  //   const ip_expected = new Point(0, 2)
  //   const ip = segment.intersect(poly.box)
  //   expect(ip.length).toBe(2)
  //   expect(ip[0].equalTo(point(150, 20))).toBe(true)
  //   expect(ip[1].equalTo(point(150, 40))).toBe(true)
  // })
  it('Intersection between two very close lines returns zero intersections (#99)', () => {
    const s1 = segment([34.35, 36.557426400375626, 25.4, 36.557426400375626])
    const s2 = segment([25.4, 36.55742640037563, 31.25, 36.55742640037563])

    const ip = s1.intersect(s2)
    expect(ip.length).toBe(0)
  })
})
describe('Segment.DistanceTo', function () {
  it('Distance to Segment Case 1 Intersected Segments', function () {
    const segment1 = new Segment(new Point(0, 0), new Point(2, 2))
    const segment2 = new Segment(new Point(0, 2), new Point(2, 0))
    expect(segment1.distanceTo(segment2)[0]).toBe(0)
  })
  it('Distance to Segment Case 2 Not Intersected Segments', function () {
    const segment1 = new Segment(new Point(0, 0), new Point(2, 2))
    const segment2 = new Segment(new Point(1, 0), new Point(4, 0))
    const [dist] = segment1.distanceTo(segment2)
    expect(EQ(dist, Math.sqrt(2) / 2)).toBe(true)
  })
  it('Distance to Line', function () {
    const seg = segment(1, 3, 4, 6)
    const l = line(point(-1, 1), vector(0, -1))
    expect(seg.distanceTo(l)[0]).toBe(2)
  })
  //   it('Distance to Circle Case 1 Intersection - touching', function () {
  //     const segment = new Segment(point(-4, 2), point(4, 2))
  //     const circle = new Circle(point(0, 0), 2)
  //     expect(segment.distanceTo(circle)[0]).toBe(0)
  //   })
  //   it('Distance to Circle Case 1 Intersection - two points', function () {
  //     const segment = new Segment(point(-4, 2), point(4, 2))
  //     const circle = new Circle(point(0, 0), 3)
  //     expect(segment.distanceTo(circle)[0]).toBe(0)
  //   })
  //   it('Distance to Circle Case 1 Intersection - one points', function () {
  //     const segment = new Segment(point(0, 2), point(4, 2))
  //     const circle = new Circle(point(0, 0), 3)
  //     expect(segment.distanceTo(circle)[0]).toBe(0)
  //   })
  //   it('Distance to Circle Case 2 Projection', function () {
  //     const segment = new Segment(point(-4, 4), point(4, 4))
  //     const circle = new Circle(point(0, 0), 2)
  //     expect(segment.distanceTo(circle)[0]).toBe(2)
  //   })
  //   it('Distance to Circle Case 3 End point out of the circle', function () {
  //     const segment = new Segment(point(2, 2), point(4, 2))
  //     const circle = new Circle(point(0, 0), 2)
  //     expect(segment.distanceTo(circle)[0]).toBe(2 * Math.sqrt(2) - 2)
  //   })
  //   it('Distance to Circle Case 3 End point inside the circle', function () {
  //     const segment = new Segment(point(-1, 1), point(1, 1))
  //     const circle = new Circle(point(0, 0), 2)
  //     expect(segment.distanceTo(circle)[0]).toBe(2 - Math.sqrt(2))
  //   })
  // })

  describe('#Segment.pointAtLength', function () {
    it('gets the point at specific length', function () {
      const segment = new Segment(point(-1, 1), point(1, 1))
      expect(segment.length).toBe(2)
      expect(segment.pointAtLength(1).x).toBe(0)
      expect(segment.pointAtLength(0).x).toBe(-1)
      expect(segment.pointAtLength(2).x).toBe(1)
      expect(segment.pointAtLength(0.5).x).toBe(-0.5)
    })
    it('points at specific length is on segment', function () {
      const segment = new Segment(point(-12, 4), point(30, -2))
      const length = segment.length
      for (let i = 0; i < 33; i++) {
        const point = segment.pointAtLength((i / 33) * length)
        expect(segment.contains(point)).toBe(true)
      }
    })
  })
})
