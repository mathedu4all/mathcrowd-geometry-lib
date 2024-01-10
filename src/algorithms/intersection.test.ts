import { Line } from '../classes/line'
import { point } from '../classes/point'
import { intersectLine2Line } from './intersection'

describe('Intersection', () => {
  it('Lines intersect at a point', () => {
    const line1 = new Line(point(0, 0), point(3, 3))
    const line2 = new Line(point(0, 3), point(3, 0))

    const intersection = intersectLine2Line(line1, line2)

    expect(intersection).toEqual([{ x: 1.5, y: 1.5 }])
  })

  test('Lines are parallel (including intersection)', () => {
    const line1 = new Line(point(0, 0), point(2, 2))
    const line2 = new Line(point(1, 1), point(3, 3))

    const intersection = line1.intersect(line2)

    expect(intersection).toEqual([])
  })
})
