import { Box } from './box'

describe('Box', function () {
  it('May create new instance of Box', function () {
    const box = new Box()
    expect(box).toBeInstanceOf(Box)
  })
  it('Method intersect returns true if two boxes intersected', function () {
    const box1 = new Box(1, 1, 3, 3)
    const box2 = new Box(-3, -3, 2, 2)
    expect(box1.intersect(box2)).toBe(true)
  })
  it('Method expand expands current box with other', function () {
    const box1 = new Box(1, 1, 3, 3)
    const box2 = new Box(-3, -3, 2, 2)
    expect(box1.merge(box2)).toEqual({
      xmin: -3,
      ymin: -3,
      xmax: 3,
      ymax: 3
    })
  })
})
