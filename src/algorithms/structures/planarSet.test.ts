import {
  Point,
  Segment,
  Circle,
  Box,
  point,
  segment,
  circle
} from '../../index'
import { Distance } from '../distance'
import { IntervalTree } from './intervalTree'
import { PlanarSet } from './planarSet'

describe('PlanarSet', function () {
  it('Class PlanarSet defined', function () {
    expect(PlanarSet).toBeDefined()
  })
  it('May construct new instance of PlanarSet', function () {
    const planarSet = new PlanarSet()
    expect(planarSet).toBeInstanceOf(PlanarSet)
  })
  it('May add planar objects', function () {
    const segment = new Segment(1, 2, 4, 5)
    const circle = new Circle(new Point(3, 3), 5)
    const planarSet = new PlanarSet()
    planarSet.add(segment)
    planarSet.add(circle)
    expect(planarSet.has(segment)).toBe(true)
    expect(planarSet.has(circle)).toBe(true)
    expect(planarSet.size).toBe(2)
  })
  it('May add planar objects using {key, value} interface', function () {
    const planarSet = new PlanarSet()
    const segment = new Segment(1, 2, 4, 5)
    const circle = new Circle(new Point(3, 3), 5)
    planarSet.add({ key: segment.box, value: segment })
    planarSet.add({ key: circle.box, value: circle })
    expect(planarSet.has(segment)).toBe(true)
    expect(planarSet.has(circle)).toBe(true)
    expect(planarSet.size).toBe(2)
  })
  it('May delete planar objects', function () {
    const planarSet = new PlanarSet()
    const segment = new Segment(1, 2, 4, 5)
    const circle = new Circle(new Point(3, 3), 5)
    planarSet.add(segment)
    planarSet.add(circle)
    planarSet.delete(segment)
    expect(planarSet.has(segment)).toBe(false)
    expect(planarSet.size).toBe(1)
  })
  it('May delete planar objects using {key,value} interface', function () {
    const planarSet = new PlanarSet()
    const segment = new Segment(1, 2, 4, 5)
    const circle = new Circle(new Point(3, 3), 5)
    planarSet.add({ key: segment.box, value: segment })
    planarSet.add({ key: circle.box, value: circle })
    planarSet.delete({ key: segment.box, value: segment })
    expect(planarSet.has(segment)).toBe(false)
    expect(planarSet.size).toBe(1)
  })
  it('May not add same object twice (without error ?)', function () {
    const planarSet = new PlanarSet()
    const segment = new Segment(1, 2, 4, 5)
    planarSet.add(segment)
    planarSet.add(segment)
    expect(planarSet.size).toBe(1)
  })
  it('May update planar objects', function () {
    const planarSet = new PlanarSet()
    const segment = new Segment(1, 2, 4, 5)
    const circle = new Circle(new Point(3, 3), 5)
    planarSet.add(segment)
    planarSet.add(circle)

    // Update == delete and add
    planarSet.delete(segment)
    segment.pe.x = 3
    segment.pe.y = 4
    planarSet.add(segment)

    expect(planarSet.has(segment)).toBe(true)
    expect(planarSet.size).toBe(2)
  })
  it('May find planar objects in given box 1', function () {
    const planarSet = new PlanarSet()
    const segment = new Segment(1, 1, 2, 2)
    const circle = new Circle(new Point(3, 3), 1)
    planarSet.add(segment)
    planarSet.add(circle)
    const resp = planarSet.search(new Box(0, 0, 1, 1))
    expect(resp.length).toBe(1)
    expect(resp[0]).toBe(segment)
  })
  it('May find planar objects in given box 2', function () {
    const planarSet = new PlanarSet()
    const segment = new Segment(1, 1, 2, 2)
    const circle = new Circle(new Point(3, 3), 1)
    planarSet.add(segment)
    planarSet.add(circle)
    const resp = planarSet.search(new Box(2, 2, 3, 3))
    expect(resp.length).toBe(2)
    expect(resp[0]).toBe(segment)
    expect(resp[1]).toBe(circle)
  })
  it('May keep same black height after add many items', function () {
    const random = function (min: number, max: number) {
      return Math.floor(Math.random() * max) + min
    }

    const shapeSet = new PlanarSet()

    for (let i = 0; i < 1000; i++) {
      const ps = point(random(1, 600), random(1, 600))
      const pe = ps.translate(random(50, 100), random(50, 100))
      shapeSet.add(segment(ps, pe))
    }

    const height = (tree: IntervalTree) => {
      return tree.testBlackHeightProperty(tree.root!)
    }

    expect(height(shapeSet.index)).toBeGreaterThanOrEqual(7)
    expect(height(shapeSet.index)).toBeLessThanOrEqual(8)
  })

  it('May calculate distance between shape and planar set', function () {
    const points = [
      point(100, 20),
      point(250, 75),
      point(350, 75),
      point(300, 270),
      point(170, 200),
      point(120, 350),
      point(70, 120)
    ]

    const circles = points.map((point) => circle(point, 50))

    const set = new PlanarSet()
    for (const circle of circles) {
      set.add(circle)
    }

    const pt = point(300, 200)

    const [dist, _shortestSegment] = Distance.shape2planarSet(pt, set)
    expect(dist).toBe(20)
  })
  it('May clean planar set', function () {
    const points = [
      point(100, 20),
      point(250, 75),
      point(350, 75),
      point(300, 270),
      point(170, 200),
      point(120, 350),
      point(70, 120)
    ]

    const circles = points.map((point) => circle(point, 50))

    const set = new PlanarSet()
    for (const circle of circles) {
      set.add(circle)
    }
    expect(set.size).toBe(7)

    set.clear()
    expect(set.size).toBe(0)
  })
  it('May perform hit test and return shapes under given point', function () {
    const points = [
      point(100, 20),
      point(250, 75),
      point(350, 75),
      point(300, 270),
      point(170, 200),
      point(120, 350),
      point(70, 120)
    ]

    const circles = points.map((point) => circle(point, 50))

    const planarSet = new PlanarSet()
    for (const circle of circles) {
      planarSet.add(circle)
    }

    const resp = planarSet.hit(point(340, 250))

    expect(resp.length).toBe(1)
  })

  it('May give same result as search without index', function () {
    const random = function (min: number, max: number) {
      return Math.floor(Math.random() * max) + min
    }

    const shapeSet = new PlanarSet()

    for (let i = 0; i < 1000; i++) {
      const ps = point(random(1, 600), random(1, 600))
      const pe = ps.translate(random(50, 100), random(50, 100))
      shapeSet.add(segment(ps, pe))
    }

    for (const shape of shapeSet) {
      const resp = shapeSet.search(shape.box)

      const respSet = new PlanarSet()
      for (const shapeTmp of resp) {
        respSet.add(shapeTmp)
      }

      for (const otherShape of shapeSet) {
        if (otherShape.box.intersect(shape.box) && !respSet.has(otherShape)) {
          throw new Error('Bad index')
        }
      }
    }
    expect(true).toBe(true)
  })
  it('May find intersections between many segments less than in a 1 sec', function () {
    const random = function (min: number, max: number) {
      return Math.floor(Math.random() * max) + min
    }

    const shapeSet = new PlanarSet()
    const ipSet = new PlanarSet()

    for (let i = 0; i < 1000; i++) {
      const ps = point(random(1, 6000), random(1, 6000))
      const pe = ps.translate(random(50, 100), random(50, 100))
      shapeSet.add(segment(ps, pe))
    }

    const t1 = Date.now()
    for (const shape of shapeSet) {
      for (const otherShape of shapeSet.search(shape.box)) {
        if (otherShape == shape) continue
        for (const ip of shape.intersect(otherShape)) {
          ipSet.add(ip)
        }
      }
    }
    const t2 = Date.now()
    console.log(
      `${ipSet.size} intersections found. Elapsed time ${(t2 - t1).toFixed(
        1
      )} msec`
    )

    expect(t2 - t1).toBeLessThan(1000)
  })
})
