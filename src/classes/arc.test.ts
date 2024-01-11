import {
  Point,
  // Circle,
  Line,
  Segment,
  Arc,
  // Polygon,
  point,
  vector,
  // circle,
  arc,
  matrix,
  circle,
  Circle
} from '../index'
import { CCW, CW, PIx2 } from '../utils/constants'
import { EQ } from '../utils/utils'

describe('Arc', function () {
  it('May create new instance of Arc', function () {
    const arc = new Arc()
    expect(arc).toBeInstanceOf(Arc)
  })
  it('Default constructor constructs full circle unit arc with zero center and sweep 2PI CCW', function () {
    const arc = new Arc()
    expect(arc.pc).toEqual({ x: 0, y: 0 })
    expect(arc.sweep).toEqual(PIx2)
    expect(arc.counterClockwise).toBe(CCW)
  })
  it('Constructor creates CCW arc if parameter counterClockwise is omitted', function () {
    const arc = new Arc(new Point(), 1, Math.PI / 4, (3 * Math.PI) / 4)
    expect(arc.sweep).toEqual(Math.PI / 2)
    expect(arc.counterClockwise).toBe(CCW)
  })
  it('Constructor can create different CCW arcs if counterClockwise=true 1', function () {
    const arc = new Arc(new Point(), 1, Math.PI / 4, (3 * Math.PI) / 4, CCW)
    expect(arc.sweep).toBe(Math.PI / 2)
    expect(arc.counterClockwise).toBe(CCW)
  })
  it('Constructor can create different CCW arcs if counterClockwise=true 2', function () {
    const arc = new Arc(new Point(), 1, (3 * Math.PI) / 4, Math.PI / 4, CCW)
    expect(arc.sweep).toBe((3 * Math.PI) / 2)
    expect(arc.counterClockwise).toBe(CCW)
  })
  it('Constructor can create different CCW arcs if counterClockwise=true 3', function () {
    const arc = new Arc(new Point(3, 4), 1, Math.PI / 4, -Math.PI / 4, CCW)
    expect(arc.sweep).toBe((3 * Math.PI) / 2)
    expect(arc.counterClockwise).toBe(CCW)
  })
  it('Constructor can create different CCW arcs if counterClockwise=true 4', function () {
    const arc = new Arc(new Point(2, -2), 1, -Math.PI / 4, Math.PI / 4, CCW)
    expect(arc.sweep).toBe(Math.PI / 2)
    expect(arc.counterClockwise).toBe(CCW)
  })
  it('Constructor can create different CW arcs if counterClockwise=false 1', function () {
    const arc = new Arc(new Point(), 1, Math.PI / 4, (3 * Math.PI) / 4, CW)
    expect(arc.sweep).toBe((3 * Math.PI) / 2)
    expect(arc.counterClockwise).toBe(CW)
  })
  it('Constructor can create different CW arcs if counterClockwise=false 2', function () {
    const arc = new Arc(new Point(), 1, (3 * Math.PI) / 4, Math.PI / 4, CW)
    expect(arc.sweep).toBe(Math.PI / 2)
    expect(arc.counterClockwise).toBe(CW)
  })
  it('Constructor can create different CW arcs if counterClockwise=false 3', function () {
    const arc = new Arc(new Point(3, 4), 1, Math.PI / 4, -Math.PI / 4, CW)
    expect(arc.sweep).toBe(Math.PI / 2)
    expect(arc.counterClockwise).toBe(CW)
  })
  it('Constructor can create different CW arcs if counterClockwise=false 4', function () {
    const arc = new Arc(new Point(2, -2), 1, -Math.PI / 4, Math.PI / 4, CW)
    expect(arc.sweep).toBe((3 * Math.PI) / 2)
    expect(arc.counterClockwise).toBe(CW)
  })
  it('In order to construct full circle, set end_angle = start_angle + 2pi', function () {
    const arc = new Arc(new Point(), 5, Math.PI, 3 * Math.PI, true)
    expect(arc.sweep).toBe(2 * Math.PI)
  })
  it('Constructor creates zero arc when end_angle = start_angle', function () {
    const arc = new Arc(new Point(), 5, Math.PI / 4, Math.PI / 4, true)
    expect(arc.sweep).toBe(0)
  })
  it('New arc may be constructed by function call', function () {
    expect(arc(point(), 5, Math.PI, 3 * Math.PI, true)).toEqual(
      new Arc(new Point(), 5, Math.PI, 3 * Math.PI, true)
    )
  })
  it('Getter arc.start returns start point', function () {
    const arc = new Arc(new Point(), 1, -Math.PI / 4, Math.PI / 4, true)
    expect(arc.start).toEqual({
      x: Math.cos(-Math.PI / 4),
      y: Math.sin(-Math.PI / 4)
    })
  })
  it('Getter arc.end returns end point', function () {
    const arc = new Arc(new Point(), 1, -Math.PI / 4, Math.PI / 4, true)
    expect(arc.end).toEqual({
      x: Math.cos(Math.PI / 4),
      y: Math.sin(Math.PI / 4)
    })
  })
  it('Getter arc.length returns arc length', function () {
    const arc1 = new Arc(new Point(), 1, -Math.PI / 4, Math.PI / 4, true)
    expect(arc1.length).toEqual(Math.PI / 2)

    const arc2 = new Arc(new Point(), 5, -Math.PI / 4, Math.PI / 4, false)
    expect(arc2.length).toEqual((5 * 3 * Math.PI) / 2)
  })
  it('Getter arc.box returns arc bounding box, CCW case', function () {
    const arc = new Arc(new Point(), 1, -Math.PI / 4, Math.PI / 4, true)
    const box = arc.box
    expect(EQ(box.xmin, Math.sqrt(2) / 2)).toBe(true)
    expect(EQ(box.ymin, -Math.sqrt(2) / 2)).toBe(true)
    expect(EQ(box.xmax, 1)).toBe(true)
    expect(EQ(box.ymax, Math.sqrt(2) / 2)).toBe(true)
  })
  it('Getter arc.box returns arc bounding box, CW case', function () {
    const arc = new Arc(new Point(), 1, -Math.PI / 4, Math.PI / 4, false)
    const box = arc.box
    expect(EQ(box.xmin, -1)).toBe(true)
    expect(EQ(box.ymin, -1)).toBe(true)
    expect(EQ(box.xmax, Math.sqrt(2) / 2)).toBe(true)
    expect(EQ(box.ymax, 1)).toBe(true)
  })
  it('Getter arc.box returns arc bounding box, circle case', function () {
    const arc = circle(point(200, 200), 75).toArc(false)
    const box = arc.box
    expect(EQ(box.xmin, 125)).toBe(true)
    expect(EQ(box.ymin, 125)).toBe(true)
    expect(EQ(box.xmax, 275)).toBe(true)
    expect(EQ(box.ymax, 275)).toBe(true)
  })
})

describe('Arc.breakToFunctional', function () {
  it('Case 1. No intersection with axes', function () {
    const arc = new Arc(new Point(), 1, Math.PI / 6, Math.PI / 3, true)
    const functionalArcs = arc.breakToFunctional()
    expect(functionalArcs.length).toBe(1)
    expect(EQ(functionalArcs[0].startAngle, arc.startAngle)).toBe(true)
    expect(EQ(functionalArcs[0].endAngle, arc.endAngle)).toBe(true)
  })
  it('Case 2. One intersection, two sub arcs', function () {
    const arc = new Arc(new Point(), 1, Math.PI / 6, (3 * Math.PI) / 4, true)
    const functionalArcs = arc.breakToFunctional()
    expect(functionalArcs.length).toBe(2)
    expect(EQ(functionalArcs[0].startAngle, arc.startAngle)).toBe(true)
    expect(EQ(functionalArcs[0].endAngle, Math.PI / 2)).toBe(true)
    expect(EQ(functionalArcs[1].startAngle, Math.PI / 2)).toBe(true)
    expect(EQ(functionalArcs[1].endAngle, arc.endAngle)).toBe(true)
  })
  it('Case 3. One intersection, two sub arcs, CW', function () {
    const arc = new Arc(new Point(), 1, Math.PI / 6, -Math.PI / 6, false)
    const functionalArcs = arc.breakToFunctional()
    expect(functionalArcs.length).toBe(2)
    expect(EQ(functionalArcs[0].startAngle, arc.startAngle)).toBe(true)
    expect(EQ(functionalArcs[0].endAngle, 0)).toBe(true)
    expect(EQ(functionalArcs[1].startAngle, 0)).toBe(true)
    expect(EQ(functionalArcs[1].endAngle, arc.endAngle)).toBe(true)
  })
  it('Case 4. One intersection, start at extreme point', function () {
    const arc = new Arc(new Point(), 1, Math.PI / 2, (3 * Math.PI) / 4, true)
    const functionalArcs = arc.breakToFunctional()
    expect(functionalArcs.length).toBe(1)
    expect(EQ(functionalArcs[0].startAngle, Math.PI / 2)).toBe(true)
    expect(EQ(functionalArcs[0].endAngle, arc.endAngle)).toBe(true)
  })
  it('Case 5. 2 intersections, 3 parts', function () {
    const arc = new Arc(new Point(), 1, Math.PI / 4, (5 * Math.PI) / 4, true)
    const functionalArcs = arc.breakToFunctional()
    expect(functionalArcs.length).toBe(3)
    expect(EQ(functionalArcs[0].startAngle, arc.startAngle)).toBe(true)
    expect(EQ(functionalArcs[0].endAngle, Math.PI / 2)).toBe(true)
    expect(EQ(functionalArcs[1].endAngle, Math.PI)).toBe(true)
    expect(EQ(functionalArcs[2].endAngle, arc.endAngle)).toBe(true)
  })
  it('Case 6. 2 intersections, 3 parts, CW', function () {
    const arc = new Arc(new Point(), 1, (3 * Math.PI) / 4, -Math.PI / 4, false)
    const functionalArcs = arc.breakToFunctional()
    expect(functionalArcs.length).toBe(3)
    expect(EQ(functionalArcs[0].startAngle, arc.startAngle)).toBe(true)
    expect(EQ(functionalArcs[0].endAngle, Math.PI / 2)).toBe(true)
    expect(EQ(functionalArcs[1].startAngle, Math.PI / 2)).toBe(true)
    expect(EQ(functionalArcs[1].endAngle, 0)).toBe(true)
    expect(EQ(functionalArcs[2].startAngle, 0)).toBe(true)
    expect(EQ(functionalArcs[2].endAngle, arc.endAngle)).toBe(true)
  })
  it('Case 7. 2 intersections on extreme points, 1 parts, CW', function () {
    const arc = new Arc(new Point(), 1, Math.PI / 2, 0, false)
    const functionalArcs = arc.breakToFunctional()
    expect(functionalArcs.length).toBe(1)
    expect(EQ(functionalArcs[0].startAngle, Math.PI / 2)).toBe(true)
    expect(EQ(functionalArcs[0].endAngle, 0)).toBe(true)
  })
  it('Case 7. 4 intersections on extreme points, 5 parts', function () {
    const arc = new Arc(new Point(), 1, Math.PI / 3, Math.PI / 6, true)
    const functionalArcs = arc.breakToFunctional()
    expect(functionalArcs.length).toBe(5)
    expect(EQ(functionalArcs[0].startAngle, arc.startAngle)).toBe(true)
    expect(EQ(functionalArcs[4].endAngle, arc.endAngle)).toBe(true)
  })
  it('Case 8. Full circle, 4 intersections on extreme points, 4 parts', function () {
    const arc = new Arc(
      new Point(),
      1,
      Math.PI / 2,
      Math.PI / 2 + 2 * Math.PI,
      true
    )
    const functionalArcs = arc.breakToFunctional()
    expect(functionalArcs.length).toBe(4)
  })
})
describe('Arc.intersect', function () {
  it('Intersect arc with segment', function () {
    const arc = new Arc(point(), 1, 0, Math.PI, true)
    const segment = new Segment(-1, 0.5, 1, 0.5)
    const ip = arc.intersect(segment)
    expect(ip.length).toBe(2)
  })
  it('Intersect arc with line', function () {
    const line = new Line(point(1, 0), vector(1, 0))
    const arc = new Arc(point(1, 0), 3, -Math.PI / 3, Math.PI / 3, CW)
    const ip = arc.intersect(line)
    expect(ip.length).toBe(2)
  })
  it('Intersect arc with circle, same center and radius - return two end points', function () {
    const circle = new Circle(point(1, 0), 3)
    const arc = new Arc(point(1, 0), 3, -Math.PI / 3, Math.PI / 3, CW)
    const ip = arc.intersect(circle)
    expect(ip.length).toBe(2)
  })
  it('Intersect arc with arc', function () {
    const arc1 = new Arc(point(), 1, 0, Math.PI, true)
    const arc2 = new Arc(point(0, 1), 1, Math.PI, 2 * Math.PI, true)
    const ip = arc1.intersect(arc2)
    expect(ip.length).toBe(2)
  })
  it('Intersect arc with arc, case of touching', function () {
    const arc1 = new Arc(point(), 1, 0, Math.PI, true)
    const arc2 = new Arc(point(0, 2), 1, -Math.PI / 4, -3 * Math.PI * 4, false)
    const ip = arc1.intersect(arc2)
    expect(ip.length).toBe(1)
    expect(ip[0]).toEqual({ x: 0, y: 1 })
  })
  it('Intersect arc with arc, overlapping case', function () {
    const arc1 = new Arc(point(), 1, 0, Math.PI, true)
    const arc2 = new Arc(point(), 1, -Math.PI / 2, Math.PI / 2, true)
    const ip = arc1.intersect(arc2)
    expect(ip.length).toBe(2)
    expect(ip[0].equalTo(point(1, 0))).toBe(true)
    expect(ip[1].equalTo(point(0, 1))).toBe(true)
  })
  it('Intersect arc with arc, overlapping case, 4 points', function () {
    const arc1 = new Arc(point(), 1, -Math.PI / 4, (5 * Math.PI) / 4, true)
    const arc2 = new Arc(point(), 1, Math.PI / 4, (3 * Math.PI) / 4, false)
    const ip = arc1.intersect(arc2)
    expect(ip.length).toBe(4)
  })
  // it('Intersect arc with polygon', function () {
  //   const points = [
  //     point(100, 20),
  //     point(250, 75),
  //     point(350, 75),
  //     point(300, 200),
  //     point(170, 200),
  //     point(120, 350),
  //     point(70, 120)
  //   ]
  //   const polygon = new Polygon()
  //   polygon.addFace(points)
  //   const arc = new Arc(point(150, 50), 50, Math.PI / 3, (5 * Math.PI) / 3, CCW)
  //   expect(arc.intersect(polygon).length).toBe(1)
  // })
  // it('Intersect arc with box', function () {
  //   const points = [
  //     point(100, 20),
  //     point(250, 75),
  //     point(350, 75),
  //     point(300, 200),
  //     point(170, 200),
  //     point(120, 350),
  //     point(70, 120)
  //   ]
  //   const polygon = new Polygon()
  //   polygon.addFace(points)
  //   const arc = new Arc(point(150, 50), 50, Math.PI / 3, (5 * Math.PI) / 3, CCW)
  //   expect(arc.intersect(polygon.box).length).toBe(1)
  // })
})

describe('#Arc.pointAtLength', function () {
  it('Calculate signed area under circular arc, full circle case, CCW', function () {
    const arc = new Arc(point(0, 1), 1, 0, 2 * Math.PI, true)
    const area = arc.definiteIntegral()
    expect(EQ(area, -Math.PI)).toBe(true)
  })
  it('Calculate signed area under circular arc, full circle case, CW', function () {
    const arc = new Arc(point(0, 1), 1, 0, 2 * Math.PI, false)
    const area = arc.definiteIntegral()
    expect(EQ(area, Math.PI)).toBe(true)
  })
  it('can calculate tangent vector in start point, CCW case', function () {
    const arc = new Arc(point(), 5, Math.PI / 4, (3 * Math.PI) / 4, CCW)
    const tangent = arc.tangentInStart()
    expect(
      tangent.equalTo(
        vector(Math.cos((3 * Math.PI) / 4), Math.sin((3 * Math.PI) / 4))
      )
    ).toBe(true)
  })
  it('can calculate tangent vector in start point, CW case', function () {
    const arc = new Arc(point(), 5, Math.PI / 4, (3 * Math.PI) / 4, CW)
    const tangent = arc.tangentInStart()
    expect(
      tangent.equalTo(
        vector(Math.cos((7 * Math.PI) / 4), Math.sin((7 * Math.PI) / 4))
      )
    ).toBe(true)
  })
  it('can calculate tangent vector in end point, CCW case', function () {
    const arc = new Arc(point(), 5, Math.PI / 4, (3 * Math.PI) / 4, CCW)
    const tangent = arc.tangentInEnd()
    expect(
      tangent.equalTo(vector(Math.cos(Math.PI / 4), Math.sin(Math.PI / 4)))
    ).toBe(true)
  })
  it('can calculate tangent vector in end point, CW case', function () {
    const arc = new Arc(point(), 5, Math.PI / 4, (3 * Math.PI) / 4, CW)
    const tangent = arc.tangentInEnd()
    expect(
      tangent.equalTo(
        vector(Math.cos((5 * Math.PI) / 4), Math.sin((5 * Math.PI) / 4))
      )
    ).toBe(true)
  })
  it('can calculate middle point case 1 full circle', function () {
    const arc = new Circle(point(), 3).toArc()
    const middle = arc.middle()
    expect(middle.equalTo(point(3, 0))).toBe(true)
  })
  it('can calculate middle point case 2 ccw', function () {
    const arc = new Arc(point(), 5, Math.PI / 4, (3 * Math.PI) / 4, CCW)
    const middle = arc.middle()
    expect(middle.equalTo(point(0, 5))).toBe(true)
  })
  it('can calculate middle point case 3 cw', function () {
    const arc = new Arc(point(), 5, Math.PI / 4, (3 * Math.PI) / 4, CW)
    const middle = arc.middle()
    expect(middle.equalTo(point(0, -5))).toBe(true)
  })
  it('can calculate middle point case 4 cw, startAngle > endAngle', function () {
    const arc = new Arc(point(), 5, Math.PI / 4, -Math.PI / 4, CW)
    const middle = arc.middle()
    expect(middle.equalTo(point(5, 0))).toBe(true)
  })
  it('Can reverse arc', function () {
    const arc = new Arc(point(), 5, Math.PI / 4, (3 * Math.PI) / 4, CCW)
    const reversedArc = arc.reverse()
    expect(reversedArc.counterClockwise).toBe(CW)
    expect(EQ(arc.sweep, reversedArc.sweep)).toBe(true)
  })

  it('Can mirror arc by Y axis using transformation matrix', () => {
    const a1 = arc(point(0, 10), 20, -Math.PI / 4, Math.PI / 4, true)
    const m = matrix().scale(-1, 1)
    const a2 = a1.transform(m)
    expect(a2.start.x).toBeCloseTo(-a1.start.x)
    expect(a2.start.y).toBeCloseTo(a1.start.y)
    expect(a2.end.x).toBeCloseTo(-a1.end.x)
    expect(a2.end.y).toBeCloseTo(a1.end.y)
    expect(a2.center.x).toBeCloseTo(-a1.center.x)
    expect(a2.center.y).toBeCloseTo(a1.center.y)
    expect(a2.counterClockwise).toBe(!a1.counterClockwise)
  })
})

describe('arc pointAtLength', function () {
  it('gets the point at specific length', function () {
    const arc = new Arc(new Point(), 1, Math.PI / 4, (3 * Math.PI) / 4)
    expect(arc.length).toBe(Math.abs(Math.PI / -2))
    const start = arc.pointAtLength(0)
    expect(start.x).toBe(arc.start.x)
    expect(start.y).toBe(arc.start.y)
    const end = arc.pointAtLength(arc.length)
    expect(end.x).toBe(arc.end.x)
    expect(end.y).toBe(arc.end.y)
  })
  it('points at specific length is on arc', function () {
    const arc = new Arc(new Point(), 1, Math.PI / 4, (3 * Math.PI) / 4)
    const length = arc.length
    for (let i = 0; i < 33; i++) {
      const point = arc.pointAtLength((i / 33) * length)
      expect(arc.contains(point)).toBe(true)
    }
  })
})
