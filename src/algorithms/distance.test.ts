import { Box } from '../classes/box'
import { circle } from '../classes/circle'
import { point } from '../classes/point'
import { Distance } from './distance'
import { PlanarSet } from './structures/planarSet'
describe('PlanarSet distance related.', () => {
  it('box2boxMinMax testing - intersection case', () => {
    const box1 = new Box(0, 0, 10, 10)
    const box2 = new Box(5, 5, 15, 15)
    const [min, max] = Distance.box2boxMinMax(box1, box2)
    expect(min).toEqual(0)
    expect(max).toEqual(450)
  })
  it('box2boxMinMax testing - no intersection case', () => {
    const box1 = new Box(0, 0, 10, 10)
    const box2 = new Box(15, 15, 25, 25)
    const [min, max] = Distance.box2boxMinMax(box1, box2)
    expect(min).toEqual(50)
    expect(max).toEqual(1250)
  })
  it('minMaxTree testing', () => {
    const set = new PlanarSet()
    const points = [point(3, 3), point(5, 5), point(4, 4)]
    const circles = points.map((point) => circle(point, 1))
    for (const circle of circles) {
      set.add(circle)
    }

    const dot = point(7, 7)
    const tree = Distance.minMaxTree(dot, set)
    expect(tree.keys).toEqual([
      [2, 18],
      [8, 32],
      [18, 50]
    ])
  })
  it('shape2planarSet testing', () => {
    const set = new PlanarSet()
    const points = [point(3, 3), point(5, 5), point(4, 4)]
    const circles = points.map((point) => circle(point, 1))
    for (const circle of circles) {
      set.add(circle)
    }

    const dot = point(7, 7)
    const [dist, _shortestSegment] = Distance.shape2planarSet(dot, set)
    expect(dist).toEqual(2 * Math.sqrt(2) - 1)
  })
})
