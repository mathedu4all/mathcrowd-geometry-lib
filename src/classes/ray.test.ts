import { Ray, point, vector, segment, arc, ray } from '../index'
import { CCW, CW } from '../utils/constants'
import { EQ } from '../utils/utils'

describe('#Flatten.Ray', function () {
  it('May create new instance of Ray', function () {
    const ray = new Ray()
    expect(ray).toBeInstanceOf(Ray)
    expect(ray.start).toEqual({ x: 0, y: 0 })
  })
  it('May return bounding box of ray', function () {
    const ray = new Ray(point(2, 2))
    expect(ray.box).toEqual({
      xmin: 2,
      ymin: 2,
      xmax: Number.POSITIVE_INFINITY,
      ymax: 2
    })
  })
  it('May find intersection between ray and segment. Case 1. Quick reject', function () {
    const r = ray(point(2, 2))
    const seg = segment(point(0, 3), point(1, 1))
    const ip = r.intersect(seg)
    expect(ip.length).toEqual(0)
  })
  it('May find intersection between ray and segment. Case 2. No intersection', function () {
    const r = ray(point(2, 2))
    const seg = segment(point(0, 3), point(3, 0))
    const ip = r.intersect(seg)
    expect(ip.length).toEqual(0)
  })
  it('May find intersection between ray and segment. Case 3. Start intersection', function () {
    const r = ray(point(2, 2))
    const seg = segment(point(1, 1), point(3, 3))
    const ip = r.intersect(seg)
    expect(ip.length).toEqual(1)
    expect(ip[0]).toEqual(point(2, 2))
  })
  it('May find intersection between ray and segment. Case 4. One not start intersection', function () {
    const r = ray(point(2, 2))
    const seg = segment(point(4, 0), point(4, 4))
    const ip = r.intersect(seg)
    expect(ip.length).toEqual(1)
    expect(ip[0]).toEqual(point(4, 2))
  })
  it('May find intersection between ray and segment. Case 5. Two intersections', function () {
    const r = ray(point(2, 2))
    const seg = segment(point(4, 2), point(8, 2))
    const ip = r.intersect(seg)
    expect(ip.length).toEqual(2)
    expect(ip[0]).toEqual(point(4, 2))
    expect(ip[1]).toEqual(point(8, 2))
  })
  it('May find intersection between ray and arc. Case 1. Quick reject', function () {
    const r = ray(point(3, 3))
    const a = arc(point(6, 0), 2, 0, Math.PI, CCW)
    const ip = r.intersect(a)
    expect(ip.length).toEqual(0)
  })
  it('May find intersection between ray and arc. Case 2. No interection', function () {
    const r = ray(point(3, 3))
    const a = arc(point(4, 3), 2, Math.PI / 2, (3 * Math.PI) / 2, CCW)
    const ip = r.intersect(a)
    expect(ip.length).toEqual(0)
  })
  it('May find intersection between ray and arc. Case 3. One touching interection', function () {
    const r = ray(point(3, 3))
    const a = arc(point(6, 0), 3, Math.PI / 2, (3 * Math.PI) / 2, CCW)
    const ip = r.intersect(a)
    expect(ip.length).toEqual(1)
    expect(ip[0]).toEqual(point(6, 3))
  })
  it('May find intersection between ray and arc. Case 4. One regular interection', function () {
    const r = ray(point(3, 3))
    const a = arc(point(4, 3), 2, Math.PI / 2, (3 * Math.PI) / 2, CW)
    const ip = r.intersect(a)
    expect(ip.length).toEqual(1)
    expect(ip[0]).toEqual(point(6, 3))
  })
  it('May find intersection between ray and arc. Case 5. Two interections', function () {
    const r = ray(point(3, 3))
    const a = arc(point(6, 3), 3, 0, Math.PI, CW)
    const ip = r.intersect(a)
    expect(ip.length).toEqual(2)
    expect(ip[0]).toEqual(point(3, 3))
    expect(ip[1]).toEqual(point(9, 3))
  })
  it('May construct and treat ray by pi/4 slope', function () {
    const r = ray(
      point(3, 3),
      vector(Math.cos((3 * Math.PI) / 4), Math.sin((3 * Math.PI) / 4))
    )
    const seg = segment(point(10, 0), point(0, 10))
    expect(r.slope).toEqual(Math.PI / 4)
    expect(r.box.xmin).toEqual(3)
    expect(r.box.ymin).toEqual(3)
    expect(r.box.xmax).toEqual(Number.POSITIVE_INFINITY)
    expect(r.box.ymax).toEqual(Number.POSITIVE_INFINITY)
    expect(r.contains(point(5, 5))).toBe(true)
    expect(r.intersect(seg)[0].equalTo(point(5, 5))).toBe(true)
  })
  it('May construct and treat ray by pi/2 slope', function () {
    const r = ray(point(3, 3), vector(Math.cos(Math.PI), Math.sin(Math.PI)))
    const seg = segment(point(-10, 5), point(10, 5))
    expect(r.slope).toEqual(Math.PI / 2)
    expect(r.box.xmin).toEqual(3)
    expect(r.box.ymin).toEqual(3)
    expect(r.box.xmax).toEqual(3)
    expect(r.box.ymax).toEqual(Number.POSITIVE_INFINITY)
    expect(r.contains(point(3, 5))).toBe(true)
    expect(r.intersect(seg)[0].equalTo(point(3, 5))).toBe(true)
  })
  it('May construct and treat ray by 3*pi/4 slope', function () {
    const r = ray(
      point(-3, 3),
      vector(Math.cos((5 * Math.PI) / 4), Math.sin((5 * Math.PI) / 4))
    )
    const seg = segment(point(-10, 0), point(0, 10))
    expect(r.slope).toEqual((3 * Math.PI) / 4)
    expect(r.box.xmin).toEqual(Number.NEGATIVE_INFINITY)
    expect(r.box.ymin).toEqual(3)
    expect(r.box.xmax).toEqual(-3)
    expect(r.box.ymax).toEqual(Number.POSITIVE_INFINITY)
    expect(r.contains(point(-5, 5))).toBe(true)
    expect(r.intersect(seg)[0].equalTo(point(-5, 5))).toBe(true)
  })
  it('May construct and treat ray by pi slope', function () {
    const r = ray(
      point(3, 3),
      vector(Math.cos((3 * Math.PI) / 2), Math.sin((3 * Math.PI) / 2))
    )
    const seg = segment(point(-10, 0), point(-10, 5))
    expect(r.slope).toEqual(Math.PI)
    expect(r.box.xmin).toEqual(Number.NEGATIVE_INFINITY)
    expect(r.box.ymin).toEqual(3)
    expect(r.box.xmax).toEqual(3)
    expect(r.box.ymax).toEqual(3)
    expect(r.contains(point(-10, 3))).toBe(true)
    expect(r.intersect(seg)[0].equalTo(point(-10, 3))).toBe(true)
  })
  it('May construct and treat ray by 5*pi/4 slope', function () {
    const r = ray(
      point(-3, -3),
      vector(Math.cos((7 * Math.PI) / 4), Math.sin((7 * Math.PI) / 4))
    )
    const seg = segment(point(-10, 0), point(0, -10))
    expect(EQ(r.slope, (5 * Math.PI) / 4)).toBe(true)
    expect(r.box.xmin).toEqual(Number.NEGATIVE_INFINITY)
    expect(r.box.ymin).toEqual(Number.NEGATIVE_INFINITY)
    expect(r.box.xmax).toEqual(-3)
    expect(r.box.ymax).toEqual(-3)
    expect(r.contains(point(-5, -5))).toBe(true)
    expect(r.intersect(seg)[0].equalTo(point(-5, -5))).toBe(true)
  })
  it('May construct and treat ray by 3*pi/2 slope', function () {
    const r = ray(point(0, -3), vector(Math.cos(0), Math.sin(0)))
    const seg = segment(point(10, -5), point(-10, -5))
    expect(r.slope).toEqual((3 * Math.PI) / 2)
    expect(r.box.xmin).toEqual(0)
    expect(r.box.ymin).toEqual(Number.NEGATIVE_INFINITY)
    expect(r.box.xmax).toEqual(0)
    expect(r.box.ymax).toEqual(-3)
    expect(r.contains(point(0, -5))).toBe(true)
    expect(r.intersect(seg)[0].equalTo(point(0, -5))).toBe(true)
  })
  it('May construct and treat ray by 7*pi/4 slope', function () {
    const r = ray(
      point(3, -3),
      vector(Math.cos(Math.PI / 4), Math.sin(Math.PI / 4))
    )
    const seg = segment(point(10, 0), point(0, -10))
    expect(EQ(r.slope, (7 * Math.PI) / 4)).toBe(true)
    expect(r.box.xmin).toEqual(3)
    expect(r.box.ymin).toEqual(Number.NEGATIVE_INFINITY)
    expect(r.box.xmax).toEqual(Number.POSITIVE_INFINITY)
    expect(r.box.ymax).toEqual(-3)
    expect(r.contains(point(5, -5))).toBe(true)
    expect(r.intersect(seg)[0].equalTo(point(5, -5))).toBe(true)
  })
})
