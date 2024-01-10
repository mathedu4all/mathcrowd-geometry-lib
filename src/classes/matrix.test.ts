import { Matrix, matrix } from './matrix'

import { point } from './point'

describe('Matrix', function () {
  it('May create new instance of Matrix', function () {
    const matrix = new Matrix()
    expect(matrix).toBeInstanceOf(Matrix)
  })
  it('Default constructor creates identity matrix', function () {
    const matrix = new Matrix()
    expect(matrix).toEqual({ a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 })
  })
  it('Matrix can translate vector', function () {
    const m = matrix(1, 0, 0, 1, 5, 10)
    expect(m.transform([10, 5])).toEqual([15, 15])
  })
  it('Method translate returns translation matrix', function () {
    const m = matrix().translate(5, 10)
    expect(m.transform([10, 5])).toEqual([15, 15])
  })
  it('Matrix can rotate vector counterclockwise', function () {
    const cos = 0.0
    const sin = 1.0
    const m = matrix(cos, sin, -sin, cos, 0, 0)
    expect(m.transform([3, 0])).toEqual([0, 3])
  })
  it('Method rotate returns rotation matrix to rotate around (0,0)', function () {
    const m = matrix().rotate(Math.PI / 2)
    const pt = point(3, 0)
    const [x, y] = m.transform([pt.x, pt.y])
    const transformedPoint = point(x, y)
    const expectedPoint = point(0, 3)
    expect(transformedPoint.equalTo(expectedPoint)).toBe(true)
  })
  it('Method rotate and translate may compose rotation matrix to rotate around point other than (0,0)', function () {
    const pt = point(4, 1)
    const pc = point(1, 1)
    let [x, y] = [pt.x, pt.y]
    // Transform coordinate origin into point x,y, then rotate, then transform origin back
    const m = matrix()
      .translate(pc.x, pc.y)
      .rotate((3 * Math.PI) / 2)
      .translate(-pc.x, -pc.y)
    ;[x, y] = m.transform([x, y])
    const transformedPoint = point(x, y)
    const expectedPoint = point(1, -2)
    expect(transformedPoint.equalTo(expectedPoint)).toBe(true)
  })
  it('Composition of methods rotate and translate return same matrix as formula', function () {
    const angle = Math.PI / 4
    const sin = Math.sin(angle)
    const cos = Math.cos(angle)
    const pc = point(10001, -555)
    // https://stackoverflow.com/questions/8275882/one-step-affine-transform-for-rotation-around-a-point
    const m = matrix()
      .translate(pc.x, pc.y)
      .rotate(angle)
      .translate(-pc.x, -pc.y)
    const m1 = matrix(
      cos,
      sin,
      -sin,
      cos,
      pc.x - pc.x * cos + pc.y * sin,
      pc.y - pc.x * sin - pc.y * cos
    )
    expect(m.equalTo(m1)).toBe(true)
  })
  it('Matrix can scale vector', function () {
    const m = matrix(10, 0, 0, 5, 0, 0)
    expect(m.transform([1, 1])).toEqual([10, 5])
  })
  it('Method scale returns matrix that may scale vector', function () {
    const m = matrix().scale(5, 10)
    expect(m.transform([1, 1])).toEqual([5, 10])
  })
})
