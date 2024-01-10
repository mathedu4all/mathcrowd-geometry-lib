import { Errors } from '../utils/errors'
import { EQ } from '../utils/utils'

/**
 * Class representing an affine transformation 3x3 matrix:
 * <pre>
 *      [ a  c  tx
 * A =    b  d  ty
 *        0  0  1  ]
 * </pre>
 * @type {Matrix}
 */
export class Matrix {
  a: number
  b: number
  c: number
  d: number
  tx: number
  ty: number

  /**
   * Construct new instance of affine transformation matrix <br/>
   * If parameters omitted, construct identity matrix a = 1, d = 1
   * @param {number} a - position(0,0)   sx*cos(alpha)
   * @param {number} b - position (0,1)  sx*sin(alpha)
   * @param {number} c - position (1,0)  -sy*sin(alpha)
   * @param {number} d - position (1,1)  sy*cos(alpha)
   * @param {number} tx - position (2,0) translation by x
   * @param {number} ty - position (2,1) translation by y
   */
  constructor(
    a: number = 1,
    b: number = 0,
    c: number = 0,
    d: number = 1,
    tx: number = 0,
    ty: number = 0
  ) {
    this.a = a
    this.b = b
    this.c = c
    this.d = d
    this.tx = tx
    this.ty = ty
  }

  /**
   * Return new cloned instance of matrix
   **/
  clone(): Matrix {
    return new Matrix(this.a, this.b, this.c, this.d, this.tx, this.ty)
  }

  /**
   * Transform vector [x,y] using transformation matrix. <br/>
   * Vector [x,y] is an abstract array[2] of numbers and not a FlattenJS object <br/>
   * The result is also an abstract vector [x',y'] = A * [x,y]:
   * <code>
   * [x'       [ ax + by + tx
   *  y'   =     cx + dy + ty
   *  1]                    1 ]
   * </code>
   * @param  vector - array[2] of numbers
   * @returns transformation result - array[2] of numbers
   */
  transform(vector: [number, number]): [number, number] {
    return [
      vector[0] * this.a + vector[1] * this.c + this.tx,
      vector[0] * this.b + vector[1] * this.d + this.ty
    ]
  }

  /**
   * Multiplication of two matrix.
   * @param otherMatrix - matrix to multiply by
   * @returns result of multiplication of this matrix by other matrix
   */
  multiply(otherMatrix: Matrix): Matrix {
    return new Matrix(
      this.a * otherMatrix.a + this.c * otherMatrix.b,
      this.b * otherMatrix.a + this.d * otherMatrix.b,
      this.a * otherMatrix.c + this.c * otherMatrix.d,
      this.b * otherMatrix.c + this.d * otherMatrix.d,
      this.a * otherMatrix.tx + this.c * otherMatrix.ty + this.tx,
      this.b * otherMatrix.tx + this.d * otherMatrix.ty + this.ty
    )
  }

  /**
   * Translate matrix by vector or by pair of numbers.
   * @param args - Translation vector or translation by x and y
   * @returns new matrix as a result of multiplication of the current matrix
   * by the matrix(1,0,0,1,tx,ty)
   */
  translate(...args: [{ x: number; y: number }] | [number, number]): Matrix {
    let tx, ty
    if (
      args.length == 1 &&
      typeof args[0] === 'object' &&
      !isNaN(args[0].x) &&
      !isNaN(args[0].y)
    ) {
      tx = args[0].x
      ty = args[0].y
    } else if (
      args.length == 2 &&
      typeof args[0] == 'number' &&
      typeof args[1] == 'number'
    ) {
      tx = args[0]
      ty = args[1]
    } else {
      throw Errors.ILLEGAL_PARAMETERS
    }
    return this.multiply(new Matrix(1, 0, 0, 1, tx, ty))
  }

  /**
   * Rotate matrix by given angle (in radians) around center of rotation (0,0) in counterclockwise direction.
   * @param angle - angle in radians
   * @param centerX - center of rotation
   * @param centerY - center of rotation
   * @returns new matrix as a result of multiplication of the current matrix
   * by the matrix that defines rotation by given angle (in radians) around
   * center of rotation (centerX,centerY) in counterclockwise direction
   */
  rotate(angle: number, centerX: number = 0.0, centerY: number = 0.0): Matrix {
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    return this.translate(centerX, centerY)
      .multiply(new Matrix(cos, sin, -sin, cos, 0, 0))
      .translate(-centerX, -centerY)
  }

  /**
   * Scale matrix by a factor sx along the x-axis and sy along the y-axis.
   * @param sx
   * @param sy
   * @returns new matrix as a result of multiplication of the current matrix
   * by the matrix (sx,0,0,sy,0,0) that defines scaling
   */
  scale(sx: number, sy: number): Matrix {
    return this.multiply(new Matrix(sx, 0, 0, sy, 0, 0))
  }

  /**
   * Returns true if two matrix are equal parameter by parameter
   * @param matrix - other matrix
   * @returns true if equal, false otherwise
   */
  equalTo(matrix: Matrix): boolean {
    if (!EQ(this.tx, matrix.tx)) return false
    if (!EQ(this.ty, matrix.ty)) return false
    if (!EQ(this.a, matrix.a)) return false
    if (!EQ(this.b, matrix.b)) return false
    if (!EQ(this.c, matrix.c)) return false
    if (!EQ(this.d, matrix.d)) return false
    return true
  }
}

/**
 * Function to create matrix equivalent to "new" constructor
 * @param {number} a - position(0,0)   sx*cos(alpha)
 * @param {number} b - position (0,1)  sx*sin(alpha)
 * @param {number} c - position (1,0)  -sy*sin(alpha)
 * @param {number} d - position (1,1)  sy*cos(alpha)
 * @param {number} tx - position (2,0) translation by x
 * @param {number} ty - position (2,1) translation by y
 */
export const matrix = (
  a: number = 1,
  b: number = 0,
  c: number = 0,
  d: number = 1,
  tx: number = 0,
  ty: number = 0
) => new Matrix(a, b, c, d, tx, ty)
