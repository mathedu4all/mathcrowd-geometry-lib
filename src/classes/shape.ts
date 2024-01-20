import { Matrix } from './matrix'
import { Errors } from '../utils/errors'
import type { Box } from './box'
import type { Vector } from './vector'
import type { Segment } from './segment'
import { SimplePoint } from './types'

/**
 * Base class representing shape
 * Implement common methods of affine transformations
 */
export class Shape<T extends Shape<T>> {
  /**
   * Shape name
   * @returns name of the shape
   */
  get name(): string {
    throw Errors.CANNOT_INVOKE_ABSTRACT_METHOD
  }

  /**
   * Bounding box
   * @returns bounding box of a shape
   */
  get box(): Box {
    throw Errors.CANNOT_INVOKE_ABSTRACT_METHOD
  }

  /**
   * Get a cloned shape
   * @return clone of a shape
   */
  clone(): T {
    throw Errors.CANNOT_INVOKE_ABSTRACT_METHOD
  }

  /**
   * Translated shape by given vector.
   * Translation vector may be also defined by a pair of numbers.
   * @param args - Translation vector or translation by x and y
   * or tuple of numbers
   * @returns new translated shape
   */
  translate(...args: [Vector] | [number, number]): T {
    return this.transform(new Matrix().translate(...args))
  }

  /**
   * Rotate shape by given angle around given center point.
   * If center point is omitted, rotates around zero point (0,0).
   * Positive value of angle defines rotation in counterclockwise direction,
   * negative angle defines rotation in clockwise direction
   * @param angle - angle in radians
   * @param center - center of rotation
   * @returns new rotated shape
   */
  rotate(angle: number, center: SimplePoint = { x: 0, y: 0 }): T {
    return this.transform(new Matrix().rotate(angle, center.x, center.y))
  }

  /**
   * Scale shape with coordinates multiplied by scaling factor
   * @param sx - x-axis scaling factor
   * @param sy - y-axis scaling factor
   * @returns new scaled shape
   */
  scale(sx: number, sy: number): T {
    return this.transform(new Matrix().scale(sx, sy))
  }

  /**
   * Transform shape with given affine transformation matrix.
   * @param matrix
   * @returns new transformed shape
   */
  transform(_matrix: Matrix): T {
    throw Errors.CANNOT_INVOKE_ABSTRACT_METHOD
  }

  /**
   * Get distance to shape.
   * @param shape
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  distanceTo(_shape: Shape<any>): [number, Segment] {
    throw Errors.OPERATION_IS_NOT_SUPPORTED
  }
}
