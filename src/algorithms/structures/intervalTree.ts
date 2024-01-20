/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { RB_TREE_COLOR_RED, RB_TREE_COLOR_BLACK } from '../../utils/constants'

/**
 * Interval is a pair of numbers or a pair of any comparable objects on which may be defined predicates
 * *equal*, *less* and method *max(p1, p1)* that returns maximum in a pair.
 * When interval is an object rather than pair of numbers, this object should have properties *low*, *high*, *max*
 * and implement methods *lessThan(), equalTo(), intersect(), notIntersect(), clone(), output()*.
 * Two static methods *comparable_max(), comparable_less_than()* define how to compare values in pair. <br/>
 * This interface is described in typescript definition file *index.d.ts*
 *
 * Axis aligned rectangle is an example of such interval.
 * We may look at rectangle as an interval between its low left and top right corners.
 * See **Box** class {@link Box} library as the example
 * of Interval interface implementation
 * @type {Interval}
 */

export interface Interval {
  low: any
  high: any
  max: any
  lessThan(otherInterval: Interval): boolean
  equalTo(otherInterval: Interval): boolean
  intersect(otherInterval: Interval): boolean
  notIntersect(otherInterval: Interval): boolean
  merge(otherInterval: Interval): Interval
  clone(): Interval
  output(): [any, any]
}

export class NumberInterval implements Interval {
  low: number
  high: number

  constructor(low: any, high: any) {
    this.low = low
    this.high = high
  }

  clone(): Interval {
    return new NumberInterval(this.low, this.high)
  }

  get max(): Interval {
    return this.clone()
  }

  lessThan(otherInterval: Interval): boolean {
    return (
      this.low < otherInterval.low ||
      (this.low === otherInterval.low && this.high < otherInterval.high)
    )
  }

  equalTo(otherInterval: Interval): boolean {
    return this.low === otherInterval.low && this.high === otherInterval.high
  }

  intersect(otherInterval: Interval): boolean {
    return !this.notIntersect(otherInterval)
  }

  notIntersect(otherInterval: Interval): boolean {
    return this.high < otherInterval.low || otherInterval.high < this.low
  }

  merge(otherInterval: Interval): Interval {
    return new NumberInterval(
      this.low === undefined
        ? otherInterval.low
        : Math.min(this.low, otherInterval.low),
      this.high === undefined
        ? otherInterval.high
        : Math.max(this.high, otherInterval.high)
    )
  }

  output(): [any, any] {
    return [this.low, this.high]
  }

  /**
   * Function returns maximum between two comparable values
   * @param interval1
   * @param interval2
   * @returns {Interval}
   */
  static comparableMax(
    interval1: NumberInterval,
    interval2: NumberInterval
  ): NumberInterval {
    return interval1.merge(interval2)
  }

  /**
   * Predicate returns true if first value less than second value
   * @param val1
   * @param val2
   * @returns {boolean}
   */
  static comparableLessThan(val1: number, val2: number): boolean {
    return val1 < val2
  }
}

export class Node {
  left: Node | null
  right: Node | null
  parent: Node | null
  color: number
  item: { key: any; value: any }
  max: any

  constructor(
    key: Interval | [number, number] | undefined = undefined,
    value: any = undefined,
    left: Node | null = null,
    right: Node | null = null,
    parent: Node | null = null,
    color: number = RB_TREE_COLOR_BLACK
  ) {
    this.left = left // reference to left child node
    this.right = right // reference to right child node
    this.parent = parent // reference to parent node
    this.color = color

    this.item = { key: key, value: value } // key is supposed to be an instance of Interval

    /* If not, this should by an array of two numbers */
    if (key && key instanceof Array && key.length == 2) {
      if (!Number.isNaN(key[0]) && !Number.isNaN(key[1])) {
        this.item.key = new NumberInterval(
          Math.min(key[0], key[1]),
          Math.max(key[0], key[1])
        )
      }
    }

    this.max = this.item.key ? this.item.key.max : undefined
  }

  isNil(): boolean {
    return (
      this.item.key === undefined &&
      this.item.value === undefined &&
      this.left === null &&
      this.right === null &&
      this.color === RB_TREE_COLOR_BLACK
    )
  }

  _valueLessThan(otherNode: Node): boolean {
    return this.item.value && otherNode.item.value && this.item.value.lessThan
      ? this.item.value.lessThan(otherNode.item.value)
      : this.item.value < otherNode.item.value
  }

  lessThan(otherNode: Node): boolean {
    // if tree stores only keys
    if (
      this.item.value === this.item.key &&
      otherNode.item.value === otherNode.item.key
    ) {
      return this.item.key.lessThan(otherNode.item.key)
    } else {
      // if tree stores keys and values
      return (
        this.item.key.lessThan(otherNode.item.key) ||
        (this.item.key.equalTo(otherNode.item.key) &&
          this._valueLessThan(otherNode))
      )
    }
  }

  _valueEqual(otherNode: Node): boolean {
    return this.item.value && otherNode.item.value && this.item.value.equalTo
      ? this.item.value.equalTo(otherNode.item.value)
      : this.item.value == otherNode.item.value
  }

  equalTo(otherNode: Node): boolean {
    // if tree stores only keys
    if (
      this.item.value === this.item.key &&
      otherNode.item.value === otherNode.item.key
    ) {
      return this.item.key.equalTo(otherNode.item.key)
    } else {
      // if tree stores keys and values
      return (
        this.item.key.equalTo(otherNode.item.key) && this._valueEqual(otherNode)
      )
    }
  }

  intersect(otherNode: Node): boolean {
    return this.item.key.intersect(otherNode.item.key)
  }

  copyData(otherNode: Node): void {
    this.item.key = otherNode.item.key
    this.item.value = otherNode.item.value
  }

  updateMax(): void {
    // use key (Interval) max property instead of key.high
    this.max = this.item.key ? this.item.key.max : undefined
    if (this.right && this.right.max) {
      const comparableMax = this.item.key.constructor.comparableMax // static method
      this.max = comparableMax(this.max, this.right.max)
    }
    if (this.left && this.left.max) {
      const comparableMax = this.item.key.constructor.comparableMax // static method
      this.max = comparableMax(this.max, this.left.max)
    }
  }

  // OtherNode does not intersect any node of left subtree, if this.left.max < OtherNode.item.key.low
  notIntersectLeftSubtree(searchNode: Node): boolean {
    if (this.left == null || this.left.isNil()) return true
    const comparableLessThan = this.item.key.constructor.comparableLessThan // static method
    const high =
      this.left.max.high !== undefined ? this.left.max.high : this.left.max
    return comparableLessThan(high, searchNode.item.key.low)
  }

  // OtherNode does not intersect right subtree if OtherNode.item.key.high < this.right.key.low
  notIntersectRightSubtree(searchNode: Node): boolean {
    if (this.right == null || this.right.isNil()) return true

    const comparableLessThan = this.item.key.constructor.comparableLessThan // static method
    const low =
      this.right.max.low !== undefined
        ? this.right.max.low
        : this.right.item.key.low
    return comparableLessThan(searchNode.item.key.high, low)
  }
}

export class IntervalTree {
  root: Node | null
  nilNode: Node

  constructor() {
    this.root = null
    this.nilNode = new Node()
  }

  /**
   * Calculate max property for all nodes in the path from given node to the root
   * @param node
   */
  recalcMax(node: Node): void {
    let nodeCurrent = node
    while (nodeCurrent.parent !== null) {
      nodeCurrent.parent.updateMax()
      nodeCurrent = nodeCurrent.parent
    }
  }

  /**
   * Red-black tree operations.
   * Based on pseudocode from "Introduction to Algorithms" by Cormen, Leiserson, Rivest, Stein (3rd edition)
   *
   * - treeWalk
   * - leftRotate
   * - rightRotate
   * - transplant
   * - treeMinimum
   * - treeInsert
   * - treeInsertFixup
   * - treeSearch
   * - treeDelete
   * - treeDeleteFixup
   * - testRedBlackProperty
   * - testBlackHeightProperty
   *
   */

  /**
   * Walk through the tree and call callback function for each node
   * @param root
   * @param callback
   */
  treeWalk(root: Node | null, callback: Function): void {
    if (root !== this.nilNode && root !== null) {
      this.treeWalk(root!.left, callback)
      callback(root)
      this.treeWalk(root!.right, callback)
    }
  }

  /**
   * Left rotate subtree around given node.
   * exchange x.right and x, and take x.right.left as x.right
   *
   * @param x
   */
  leftRotate(x: Node): void {
    // x is supposed to have right child
    const y = x.right!
    x.right = y.left
    if (y.left !== this.nilNode) {
      y.left!.parent = x
    }
    y.parent = x.parent

    // change x.parent.left or x.parent.right to y
    if (x.parent === this.nilNode || x.parent === null) {
      this.root = y
    } else if (x === x.parent.left) {
      x.parent.left = y
    } else {
      x.parent.right = y
    }

    y.left = x
    x.parent = y

    y.updateMax()
    x.updateMax()
  }

  /**
   * Right rotate subtree around given node.
   * @param y
   */
  rightRotate(y: Node): void {
    // y is supposed to have left child
    const x = y.left!
    y.left = x.right
    if (x.right !== this.nilNode) {
      x.right!.parent = y
    }
    x.parent = y.parent

    // change y.parent.left or y.parent.right to x
    if (y.parent === this.nilNode || y.parent === null) {
      this.root = x
    } else if (y === y.parent.left) {
      y.parent.left = x
    } else {
      y.parent.right = x
    }
    x.right = y
    y.parent = x

    x.updateMax()
    y.updateMax()
  }

  /**
   * Transplant subtree v in place of subtree u.
   * replace u.parent.left or u.parent.right with v
   * @param u
   * @param v
   */
  transplant(u: Node, v: Node): void {
    if (u.parent === this.nilNode || u.parent === null) {
      this.root = v
    } else if (u === u.parent.left) {
      u.parent.left = v
    } else {
      u.parent.right = v
    }
    v.parent = u.parent

    v.updateMax()
  }

  /**
   * Return node with minimal key in the subtree
   * @param currentNode
   * @returns
   */
  treeMinimum(currentNode: Node | null): Node {
    while (currentNode !== null && currentNode.left !== this.nilNode) {
      currentNode = currentNode.left
    }

    return currentNode ?? this.nilNode
  }

  /**
   * Return successor of the given node.
   * @param currentNode
   * @returns
   */
  treeSuccessor(currentNode: Node): Node | null {
    // if right subtree is not empty, successor is the leftmost node in the right subtree
    if (currentNode.right !== this.nilNode) {
      return this.treeMinimum(currentNode.right)
    }

    // if right subtree is empty, successor is the lowest right ancestor of currentNode
    let parentNode = currentNode.parent
    while (
      parentNode !== this.nilNode &&
      parentNode !== null &&
      currentNode === parentNode.right
    ) {
      currentNode = parentNode
      parentNode = currentNode.parent
    }

    return parentNode
  }

  /**
   * Insert new node into the tree.
   * @param insertNode
   */
  treeInsert(insertNode: Node): void {
    let parentNode = null
    let currentNode: Node | null = this.root

    while (currentNode !== null && currentNode !== this.nilNode) {
      parentNode = currentNode
      if (insertNode.lessThan(currentNode)) {
        currentNode = currentNode.left
      } else {
        currentNode = currentNode.right
      }
    }

    insertNode.parent = parentNode
    if (parentNode === null) {
      this.root = insertNode // tree was empty
    } else if (insertNode.lessThan(parentNode)) {
      parentNode.left = insertNode
    } else {
      parentNode.right = insertNode
    }

    this.treeInsertFixup(insertNode)
  }

  /**
   * Recolor nodes and perform rotations to preserve red-black tree properties after insert.
   * @param insertNode
   */
  treeInsertFixup(insertNode: Node): void {
    let currentNode = insertNode

    while (
      currentNode.parent !== null &&
      currentNode.parent.color === RB_TREE_COLOR_RED
    ) {
      // currentNode.parent's color is red

      if (currentNode.parent === currentNode.parent.parent?.left) {
        // currentNode.parent is red and is left child of its parent

        // y is currentNode.parent's sibling (maybe null)
        const y = currentNode.parent.parent?.right

        if (y?.color === RB_TREE_COLOR_RED) {
          // case 1: currentNode.parent's sibling y is red
          currentNode.parent.color = RB_TREE_COLOR_BLACK
          y.color = RB_TREE_COLOR_BLACK
          currentNode.parent.parent!.color = RB_TREE_COLOR_RED
          currentNode = currentNode.parent.parent!
        } else {
          // case 2: currentNode.parent's sibling y is black

          if (currentNode === currentNode.parent.right) {
            // case 2.1: currentNode is right child of its parent
            currentNode = currentNode.parent
            this.leftRotate(currentNode)
          }

          currentNode.parent!.color = RB_TREE_COLOR_BLACK
          currentNode.parent!.parent!.color = RB_TREE_COLOR_RED
          this.rightRotate(currentNode.parent!.parent!)
        }
      } else {
        // currentNode.parent is red and is right child of its parent

        // y is currentNode.parent's sibling (maybe null)
        const y = currentNode.parent.parent?.left

        if (y?.color === RB_TREE_COLOR_RED) {
          // case 1: currentNode.parent's sibling y is red
          currentNode.parent.color = RB_TREE_COLOR_BLACK
          y.color = RB_TREE_COLOR_BLACK
          currentNode.parent.parent!.color = RB_TREE_COLOR_RED
          currentNode = currentNode.parent.parent!
        } else {
          // case 2: currentNode.parent's sibling y is black

          if (currentNode === currentNode.parent.left) {
            // case 2.1: currentNode is left child of its parent
            currentNode = currentNode.parent
            this.rightRotate(currentNode)
          }

          currentNode.parent!.color = RB_TREE_COLOR_BLACK
          currentNode.parent!.parent!.color = RB_TREE_COLOR_RED
          this.leftRotate(currentNode.parent!.parent!)
        }
      }
    }

    this.root!.color = RB_TREE_COLOR_BLACK
  }

  /**
   * Tree search. Returns node if found, null otherwise
   * @param root
   * @param searchNode
   * @returns
   */
  treeSearch(root: Node | null, searchNode: Node): Node | null {
    let currentNode = root

    while (currentNode !== this.nilNode && currentNode !== null) {
      if (searchNode.lessThan(currentNode)) {
        currentNode = currentNode.left!
      } else if (searchNode.equalTo(currentNode)) {
        return currentNode
      } else {
        currentNode = currentNode.right!
      }
    }

    return null
  }

  /**
   * Recolor nodes and perform rotations to preserve red-black tree properties after delete.
   */
  treeDeleteFixup(fixupNode: Node): void {
    let currentNode = fixupNode

    while (
      currentNode !== this.root &&
      currentNode.color === RB_TREE_COLOR_BLACK
    ) {
      if (currentNode === currentNode.parent!.left) {
        let sibling = currentNode.parent!.right!

        if (sibling.color === RB_TREE_COLOR_RED) {
          sibling.color = RB_TREE_COLOR_BLACK
          currentNode.parent!.color = RB_TREE_COLOR_RED
          this.leftRotate(currentNode.parent!)
          sibling = currentNode.parent!.right!
        }

        if (
          sibling.left!.color === RB_TREE_COLOR_BLACK &&
          sibling.right!.color === RB_TREE_COLOR_BLACK
        ) {
          sibling.color = RB_TREE_COLOR_RED
          currentNode = currentNode.parent!
        } else {
          if (sibling.right!.color === RB_TREE_COLOR_BLACK) {
            sibling.left!.color = RB_TREE_COLOR_BLACK
            sibling.color = RB_TREE_COLOR_RED
            this.rightRotate(sibling)
            sibling = currentNode.parent!.right!
          }

          sibling.color = currentNode.parent!.color
          currentNode.parent!.color = RB_TREE_COLOR_BLACK
          sibling.right!.color = RB_TREE_COLOR_BLACK
          this.leftRotate(currentNode.parent!)
          currentNode = this.root!
        }
      } else {
        let sibling = currentNode.parent!.left!

        if (sibling.color === RB_TREE_COLOR_RED) {
          sibling.color = RB_TREE_COLOR_BLACK
          currentNode.parent!.color = RB_TREE_COLOR_RED
          this.rightRotate(currentNode.parent!)
          sibling = currentNode.parent!.left!
        }

        if (
          sibling.right!.color === RB_TREE_COLOR_BLACK &&
          sibling.left!.color === RB_TREE_COLOR_BLACK
        ) {
          sibling.color = RB_TREE_COLOR_RED
          currentNode = currentNode.parent!
        } else {
          if (sibling.left!.color === RB_TREE_COLOR_BLACK) {
            sibling.right!.color = RB_TREE_COLOR_BLACK
            sibling.color = RB_TREE_COLOR_RED
            this.leftRotate(sibling)
            sibling = currentNode.parent!.left!
          }

          sibling.color = currentNode.parent!.color
          currentNode.parent!.color = RB_TREE_COLOR_BLACK
          sibling.left!.color = RB_TREE_COLOR_BLACK
          this.rightRotate(currentNode.parent!)
          currentNode = this.root!
        }
      }
    }

    currentNode.color = RB_TREE_COLOR_BLACK
  }

  /**
   * Delete node from the tree, and fixup tree properties
   * @param deleteNode
   */
  treeDelete(deleteNode: Node): void {
    let currentNode = deleteNode
    let originalColor = currentNode.color
    let fixupNode: Node | null

    if (deleteNode.left === this.nilNode) {
      fixupNode = deleteNode.right
      this.transplant(deleteNode, deleteNode.right!)
    } else if (deleteNode.right === this.nilNode) {
      fixupNode = deleteNode.left
      this.transplant(deleteNode, deleteNode.left!)
    } else {
      currentNode = this.treeMinimum(deleteNode.right)
      originalColor = currentNode.color
      fixupNode = currentNode.right

      if (currentNode.parent === deleteNode) {
        fixupNode!.parent = currentNode
      } else {
        this.transplant(currentNode, currentNode.right!)
        currentNode.right = deleteNode.right
        currentNode.right!.parent = currentNode
      }

      this.transplant(deleteNode, currentNode)
      currentNode.left = deleteNode.left
      currentNode.left!.parent = currentNode
      currentNode.color = deleteNode.color
    }

    if (originalColor === RB_TREE_COLOR_BLACK) {
      this.treeDeleteFixup(fixupNode!)
    }
  }

  /**
   * Return true if all red nodes have exactly two black child nodes
   */
  testRedBlackProperty() {
    let res = true
    this.treeWalk(this.root, (node: Node) => {
      if (node.color == RB_TREE_COLOR_RED) {
        if (
          !(
            node.left?.color == RB_TREE_COLOR_BLACK &&
            node.right?.color == RB_TREE_COLOR_BLACK
          )
        ) {
          res = false
        }
      }
    })
    return res
  }

  /**
   * Throw error if not every path from root to bottom has same black height
   */
  testBlackHeightProperty(node: Node) {
    let height = 0
    let heightLeft = 0
    let heightRight = 0
    if (node.color == RB_TREE_COLOR_BLACK) {
      height++
    }
    if (node.left != this.nilNode && node.left != null) {
      heightLeft = this.testBlackHeightProperty(node.left)
    } else {
      heightLeft = 1
    }
    if (node.right != this.nilNode && node.right != null) {
      heightRight = this.testBlackHeightProperty(node.right)
    } else {
      heightRight = 1
    }
    if (heightLeft != heightRight) {
      throw new Error('Red-black height property violated')
    }
    height += heightLeft
    return height
  }

  /**
   * Interval tree operations
   *
   * - treeSearchInterval
   */

  /**
   * Tree search for interval intersection. save all intersection nodes found as array in respNodes.
   * @param node
   * @param searchNode
   * @param respNodes
   */
  treeSearchInterval(
    node: Node | null,
    searchNode: Node,
    respNodes: Node[]
  ): void {
    if (node !== null && node !== this.nilNode) {
      if (
        node.left != this.nilNode &&
        !node.notIntersectLeftSubtree(searchNode)
      ) {
        this.treeSearchInterval(node.left, searchNode, respNodes)
      }

      if (node.intersect(searchNode)) {
        respNodes.push(node)
      }

      if (
        node.right != this.nilNode &&
        !node.notIntersectRightSubtree(searchNode)
      ) {
        this.treeSearchInterval(node.right, searchNode, respNodes)
      }
    }
  }

  /**
   * Returns true if intersection between given and any interval stored in the tree found
   * @param root
   * @param searchNode
   * @returns
   */
  treeFindAnyInterval(root: Node | null, searchNode: Node): boolean {
    let currentNode = root

    while (currentNode !== this.nilNode && currentNode !== null) {
      if (searchNode.intersect(currentNode)) {
        return true
      } else if (currentNode.notIntersectLeftSubtree(searchNode)) {
        currentNode = currentNode.right!
      } else {
        currentNode = currentNode.left!
      }
    }

    return false
  }

  /**
   * Returns number of items stored in the interval tree
   * @returns
   */
  get size(): number {
    let count = 0
    this.treeWalk(this.root, () => count++)
    return count
  }

  /**
   * Returns array of sorted keys in the ascending order
   * @returns
   */
  get keys(): any[] {
    const res: any[] = []
    this.treeWalk(this.root, (node: Node) =>
      res.push(node.item.key.output ? node.item.key.output() : node.item.key)
    )
    return res
  }

  /**
   * Return array of values in the ascending keys order
   * @returns
   */
  get values(): any[] {
    const res: any[] = []
    this.treeWalk(this.root, (node: Node) => res.push(node.item.value))
    return res
  }

  /**
   * Returns array of items (<key,value> pairs) in the ascended keys order
   * @returns
   */
  get items(): any[] {
    const res: any[] = []
    this.treeWalk(this.root, (node: Node) =>
      res.push({
        key: node.item.key.output ? node.item.key.output() : node.item.key,
        value: node.item.value
      })
    )
    return res
  }

  /**
   * Returns true if tree is empty
   * @returns {boolean}
   */
  isEmpty(): boolean {
    return this.root == null || this.root == this.nilNode
  }

  /**
   * Clear tree
   */
  clear(): void {
    this.root = null
  }

  /**
   * Insert new item into interval tree
   * @param key - interval object or array of two numbers [low, high]
   * @param value - value representing any object (optional)
   * @returns returns reference to inserted node as an object {key:NumberInterval, value: value}
   */
  insert(key: Interval | [number, number], value: any = key): Node | null {
    if (key === undefined) return null
    const insertNode = new Node(
      key,
      value,
      this.nilNode,
      this.nilNode,
      this.nilNode,
      RB_TREE_COLOR_RED
    )
    this.treeInsert(insertNode)
    this.recalcMax(insertNode)
    return insertNode
  }

  /**
   * Returns true if item {key,value} exist in the tree
   * @param key - interval correspondent to keys stored in the tree
   * @param value - value object to be checked
   * @returns true if item {key, value} exist in the tree, false otherwise
   */
  exist(key: any, value: any = key): boolean {
    const searchNode = new Node(key, value)
    return this.treeSearch(this.root, searchNode) ? true : false
  }

  /**
   * Remove entry {key, value} from the tree
   * @param key - interval correspondent to keys stored in the tree
   * @param value - value object
   * @returns deleted node or null if node not found
   */
  remove(key: any, value: any = key): Node | null {
    const searchNode = new Node(key, value)
    const deleteNode = this.treeSearch(this.root, searchNode)
    if (deleteNode) {
      this.treeDelete(deleteNode)
    }
    return deleteNode
  }

  /**
   * Returns array of entry values which keys intersect with given interval <br/>
   * If no values stored in the tree, returns array of keys which intersect given interval
   * @param interval - search interval, or tuple [low, high]
   * @param outputMapperFn - optional function that maps (value, key) to custom output
   * @returns {Array}
   */
  search(
    interval: any,
    outputMapperFn = (value: any, key: any) =>
      value === key ? key.output() : value
  ): any[] {
    const searchNode = new Node(interval)
    const respNodes: any[] = []
    this.treeSearchInterval(this.root, searchNode, respNodes)
    return respNodes.map((node) =>
      outputMapperFn(node.item.value, node.item.key)
    )
  }

  /**
   * Returns true if intersection between given and any interval stored in the tree found
   * @param interval - search interval or tuple [low, high]
   * @returns
   */
  intersectAny(interval: any): boolean {
    const searchNode = new Node(interval)
    const found = this.treeFindAnyInterval(this.root, searchNode)
    return found
  }

  /**
   * Tree visitor. For each node implement a callback function. <br/>
   * Method calls a callback function with two parameters (key, value)
   * @param visitor function to be called for each tree item
   */
  forEach(visitor: (key: any, value: any) => {}): void {
    this.treeWalk(this.root, (node: Node) =>
      visitor(node.item.key, node.item.value)
    )
  }

  /**
   * Value Mapper. Walk through every node and map node value to another value
   * @param callback function to be called for each tree item
   */
  map(callback: (value: any, key: any) => {}): IntervalTree {
    const tree = new IntervalTree()
    this.treeWalk(this.root, (node: Node) =>
      tree.insert(node.item.key, callback(node.item.value, node.item.key))
    )
    return tree
  }
}
