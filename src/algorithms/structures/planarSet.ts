/* eslint-disable @typescript-eslint/no-explicit-any */
import { Point } from '../../classes/point'
import { Box } from '../../classes/box'
import { Shape } from '../../classes/shape'
import { Interval, IntervalTree } from './intervalTree'

/**
 * Class representing a planar set - a generic container with ability to keep and retrieve shapes and
 * perform spatial queries. Planar set is an extension of Set container, so it supports
 * Set properties and methods
 */
export class PlanarSet extends Set {
  /**
   * IntervalTree
   */
  index: IntervalTree

  /**
   * Create new instance of PlanarSet
   * Each object should have a <b>box</b> property
   */
  constructor() {
    super()
    this.index = new IntervalTree()
  }

  /**
   * Add new shape to planar set and to its spatial index.<br/>
   * If shape already exist, it will not be added again.
   * This happens with no error, it is possible to use <i>size</i> property to check if
   * a shape was actually added.<br/>
   * Method returns planar set object updated and may be chained
   * @param entry - shape to be added, should have valid <i>box</i> property
   *
   * Another option to transfer as an object {key: Box, value: AnyShape}
   * @returns
   */
  add(entry: Shape<any> | { key: Box; value: Shape<any> }) {
    const size = this.size
    let box: Box
    let shape: Shape<any>
    if (entry instanceof Shape) {
      box = entry.box
      shape = entry
    } else {
      const { key, value } = entry
      box = key
      shape = value
    }
    super.add(shape)
    // size not changed - item not added, probably trying to add same item twice
    if (this.size > size) {
      this.index.insert(box as Interval, shape)
    }
    return this // in accordance to Set.add interface
  }

  /**
   * Delete shape from planar set. Returns true if shape was actually deleted, false otherwise
   * @param entry - shape to be deleted
   * @returns
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete(entry: Shape<any> | { key: Box; value: Shape<any> }): boolean {
    let box: Box
    let shape: Shape<any>
    if (entry instanceof Shape) {
      box = entry.box
      shape = entry
    } else {
      const { key, value } = entry
      box = key
      shape = value
    }

    const deleted = super.delete(shape)
    if (deleted) {
      this.index.remove(box, shape)
    }
    return deleted
  }

  /**
   * Clear planar set
   */
  clear() {
    super.clear()
    this.index = new IntervalTree()
  }

  /**
   * 2d range search in planar set.<br/>
   * Returns array of all shapes in planar set which bounding box is intersected with query box
   * @param box - query box
   * @returns
   */
  search(box: Box): Shape<any>[] {
    const resp = this.index.search(box)
    return resp
  }

  /**
   * Point location test. Returns array of shapes which contains given point
   * @param  point - query point
   * @returns
   */
  hit(point: Point): Shape<any>[] {
    const box = new Box(point.x - 1, point.y - 1, point.x + 1, point.y + 1)
    const resp = this.index.search(box)
    return resp.filter((shape) => point.on(shape))
  }
}
