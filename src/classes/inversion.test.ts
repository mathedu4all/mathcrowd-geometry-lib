import {
  Inversion,
  point,
  circle,
  line,
  vector,
  Point,
  Circle,
  Line
} from '../index'

describe('Inversion', function () {
  it('May create new instance of Inversion object', function () {
    const I = new Inversion(circle(point(100, 100), 50))
    expect(I).toBeInstanceOf(Inversion)
  })
  it('May construct inversion operator with given circle', () => {
    const I = new Inversion(circle(point(100, 100), 50))
    expect(I.circle).toEqual(circle(point(100, 100), 50))
  })
  it('May invert point around circle', () => {
    const I = new Inversion(circle(point(100, 100), 50))
    const p = point(200, 100)
    const invPoint = I.inverse(p) as Point

    /* test inversion property */
    const d1 = I.circle.center.distanceTo(p)[0]
    const d2 = I.circle.center.distanceTo(invPoint)[0]
    expect(d1 * d2).toEqual(I.circle.r ** 2)
  })
  it('May invert line in circle, line does not pass through inversion center', () => {
    const I = new Inversion(circle(point(100, 100), 50))
    const l = line(point(200, 100), vector(1, 0))
    const invCircle = I.inverse(l) as Circle

    expect(invCircle).toEqual(circle(point(112.5, 100), 12.5))
    /* Expect invCircle pass through inversion center */
    expect(invCircle.contains(I.circle.center)).toBe(true)
  })
  it('May invert line in circle, line pass through inversion center', () => {
    const center = point(100, 100)
    const I = new Inversion(circle(center, 50))
    const l = line(center, vector(1, 0))
    const invLine = I.inverse(l)

    /* Expect line to be mapped to itself */
    expect(invLine).toEqual(l)
  })
  it('May invert circle in circle, circle does not pass through inversion center', () => {
    const I = new Inversion(circle(point(100, 100), 50))
    const c = circle(point(250, 100), 50)
    const invCircle = I.inverse(c)

    expect(invCircle).toEqual(circle(point(118.75, 100), 6.25))
  })
  it('May invert circle in circle, circle passes through inversion center', () => {
    const I = new Inversion(circle(point(100, 100), 50))
    const c = circle(point(200, 100), 100)
    const invLine = I.inverse(c) as Line

    /* Expect circle passes through inversion center mapped to the line */
    expect(invLine).toEqual(line(point(112.5, 100), vector(1, 0)))

    /* Expect line to pass through intersection points between circles */
    const ip = I.circle.intersect(c)
    expect(invLine.contains(ip[0])).toBe(true)
    expect(invLine.contains(ip[1])).toBe(true)
  })
})
