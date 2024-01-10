import { Shape } from './shape'
import { Point } from './point'
import { Matrix } from './matrix'
import { Errors } from '../utils/errors'
import { EQ, EQ_0 } from '../utils/utils'
import { SimplePoint } from './types'

/**
 * Class representing a vector
 * @type {Vector}
 */
export class Vector extends Shape<Vector> implements SimplePoint {
  /**
   * x-coordinate of a vector (float number)
   * @type {number}
   */
  x: number = 0

  /**
   * y-coordinate of a vector (float number)
   * @type {number}
   */
  y: number = 0

  /**
   * Vector may be constructed by two points, or by two float numbers,
   * or by array of two numbers
   * @param args - array of two numbers or two points [start,end] or two numbers
   */
  constructor(
    ...args: [[number, number]] | [Point, Point] | [number, number] | []
  ) {
    super()

    this.x = 0
    this.y = 0

    // return zero vector
    if (args.length === 0) {
      return
    }

    // return vector from a number array
    if (args.length === 1 && args[0] instanceof Array && args[0].length === 2) {
      const arr = args[0]
      if (typeof arr[0] == 'number' && typeof arr[1] == 'number') {
        this.x = arr[0]
        this.y = arr[1]
        return
      }
    }

    // return vector from one point
    if (
      args.length === 1 &&
      args[0] instanceof Point &&
      !isNaN(args[0].x) &&
      !isNaN(args[0].y)
    ) {
      const { x, y } = args[0]
      this.x = x
      this.y = y
      return
    }

    if (args.length === 2) {
      const a1 = args[0]
      const a2 = args[1]

      // return vector from two numbers
      if (typeof a1 == 'number' && typeof a2 == 'number') {
        this.x = a1
        this.y = a2
        return
      }

      // return vector from two points
      if (a1 instanceof Point && a2 instanceof Point) {
        this.x = a2.x - a1.x
        this.y = a2.y - a1.y
        return
      }
    }

    throw Errors.ILLEGAL_PARAMETERS
  }

  /**
   * Method clone returns new instance of Vector
   * @returns clone of the vector
   */
  clone(): Vector {
    return new Vector(this.x, this.y)
  }

  /**
   * Slope of the vector in radians from 0 to 2PI
   * @returns slope in radians from 0 to 2PI
   */
  get slope(): number {
    let angle = Math.atan2(this.y, this.x)
    if (angle < 0) angle = 2 * Math.PI + angle
    return angle
  }

  /**
   * Length of vector
   * @returns length of vector
   */
  get length(): number {
    return Math.sqrt(this.dot(this))
  }

  /**
   * Returns true if vectors are equal up to DP_TOL
   * tolerance
   * @param v Other vector
   * @returns true if vectors are equal
   */
  equalTo(v: Vector): boolean {
    return EQ(this.x, v.x) && EQ(this.y, v.y)
  }

  /**
   * Returns new vector multiplied by scalar
   * @param scalar
   * @returns scaled vector
   */
  multiply(scalar: number): Vector {
    return new Vector(scalar * this.x, scalar * this.y)
  }

  /**
   * Returns scalar product (dot product) of two vectors <br/>
   * <code>dot_product = (this * v)</code>
   * @param v Other vector
   * @returns dot product
   */
  dot(v: Vector): number {
    return this.x * v.x + this.y * v.y
  }

  /**
   * Returns vector product (cross product) of two vectors <br/>
   * <code>cross_product = (this x v)</code>
   * @param v Other vector
   * @returns cross_product
   */
  cross(v: Vector): number {
    return this.x * v.y - this.y * v.x
  }

  /**
   * Returns unit vector.<br/>
   * Throw error if given vector has zero length
   * @returns normalized vector
   */
  normalize(): Vector {
    if (!EQ_0(this.length)) {
      return new Vector(this.x / this.length, this.y / this.length)
    }
    throw Errors.ZERO_DIVISION
  }

  /**
   * Rotate vector by given angle,
   * positive angle defines rotation in counterclockwise direction,
   * negative - in clockwise direction
   * Vector only can be rotated around (0,0) point!
   * @param angle - Angle in radians
   * @returns rotated vector
   */
  rotate(angle: number, center: Point = new Point()): Vector {
    if (center.x === 0 && center.y === 0) {
      return this.transform(new Matrix().rotate(angle))
    }
    throw Errors.OPERATION_IS_NOT_SUPPORTED
  }

  /**
   * Return new vector transformed by affine transformation matrix m
   * @param m - affine transformation matrix (a,b,c,d,tx,ty)
   * @returns transformed vector
   */
  transform(m: Matrix): Vector {
    return new Vector(m.transform([this.x, this.y]))
  }

  /**
   * Returns vector rotated 90 degrees counterclockwise
   * @returns rotated vector
   */
  rotate90CCW(): Vector {
    return new Vector(-this.y, this.x)
  }

  /**
   * Returns vector rotated 90 degrees clockwise
   * @returns rotated vector
   */
  rotate90CW(): Vector {
    return new Vector(this.y, -this.x)
  }

  /**
   * Return inverted vector
   * @returns inverted vector
   */
  invert(): Vector {
    return new Vector(-this.x, -this.y)
  }

  /**
   * Return result of addition of other vector to this vector as a new vector
   * @param v Other vector
   * @returns sum of two vectors
   */
  add(v: Vector): Vector {
    return new Vector(this.x + v.x, this.y + v.y)
  }

  /**
   * Return result of subtraction of other vector from current vector as a new vector
   * @param v Another vector
   * @returns subtraction result
   */
  subtract(v: Vector): Vector {
    return new Vector(this.x - v.x, this.y - v.y)
  }

  /**
   * Return angle between this vector and other vector. <br/>
   * Angle is measured from 0 to 2*PI in the counterclockwise direction
   * from current vector to  another.
   * @param v Another vector
   * @returns Angle in radians between two vectors in range [0, 2*PI]
   */
  angleTo(v: Vector): number {
    const norm1 = this.normalize()
    const norm2 = v.normalize()
    let angle = Math.atan2(norm1.cross(norm2), norm1.dot(norm2))
    if (angle < 0) angle += 2 * Math.PI
    return angle
  }

  /**
   * Return vector projection of the current vector on another vector
   * @param v Another vector
   * @returns projection of the current vector on another vector
   */
  projectionOn(v: Vector): Vector {
    const n = v.normalize()
    const d = this.dot(n)
    return n.multiply(d)
  }

  get name() {
    return 'vector'
  }
}

/**
 * Function to create vector equivalent to "new" constructor
 * @param args
 */
export const vector = (
  ...args: [[number, number]] | [Point, Point] | [number, number] | []
) => new Vector(...args)
