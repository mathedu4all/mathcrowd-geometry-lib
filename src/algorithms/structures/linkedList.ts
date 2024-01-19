import { Errors } from '../../utils/errors'

/**
 * Class implements bidirectional non-circular linked list. <br/>
 * LinkedListElement - object of any type that has properties next and prev.
 */
export class LinkedList<T> {
  first: LinkedListElement<T> | undefined
  last: LinkedListElement<T> | undefined

  /**
   *
   * @param first - First element of the list
   * @param last - Last element of the list
   */
  constructor(first?: LinkedListElement<T>, last?: LinkedListElement<T>) {
    this.first = first
    this.last = last || this.first
  }

  [Symbol.iterator](): Iterator<LinkedListElement<T>> {
    let value: LinkedListElement<T> | undefined = undefined

    const iterator: Iterator<LinkedListElement<T>> = {
      next: (): IteratorResult<LinkedListElement<T>> => {
        // If there is already a value, take the next element, otherwise start from the first element of the linked list
        value = value ? value.next : this.first

        // Return an object containing the current iteration value and the done flag
        return { value: value!, done: value === undefined }
      }
    }

    return iterator
  }

  /**
   * Return the number of elements in the list
   * @returns number of elements in the list
   */
  get size(): number {
    let counter = 0
    for (const _ of this) {
      counter++
    }
    return counter
  }

  /**
   * Return an array of elements from start to end
   * If start or end is not defined, take the first as the start, the last as the end
   * @param {LinkedListElement} start - Starting position (optional)
   * @param {LinkedListElement} end - Ending position (optional)
   * @returns {LinkedListElement[]} Array containing elements
   */
  toArray(
    start?: LinkedListElement<T>,
    end?: LinkedListElement<T>
  ): LinkedListElement<T>[] {
    const elements: LinkedListElement<T>[] = []
    const from = start || this.first
    const to = end || this.last
    let element: LinkedListElement<T> | undefined = from

    // If the starting position is undefined, return an empty array
    if (element === undefined) return elements

    // Start from the beginning and add each element to the array until reaching the ending position or an element with undefined next.
    do {
      elements.push(element)
      element = element.next
    } while (element !== to?.next && element !== undefined)

    return elements
  }

  /**
   * Append a new element to the end of the list
   * @param {LinkedListElement} element
   * @returns {LinkedList}
   */
  append(element: LinkedListElement<T>): LinkedList<T> {
    if (this.isEmpty()) {
      this.first = element
    } else {
      element.prev = this.last
      this.last!.next = element
    }

    // Update the edge to be the last
    this.last = element

    // Nullify non-circular links
    this.last.next = undefined
    this.first!.prev = undefined
    return this
  }

  /**
   * Insert a new element into the list after elementBefore
   * @param {LinkedListElement} newElement
   * @param {LinkedListElement} elementBefore
   * @returns {LinkedList}
   */
  insert(
    newElement: LinkedListElement<T>,
    elementBefore?: LinkedListElement<T>
  ): LinkedList<T> {
    if (this.isEmpty()) {
      this.first = newElement
      this.last = newElement
    } else if (!elementBefore) {
      newElement.next = this.first
      this.first!.prev = newElement
      this.first = newElement
    } else {
      /* Set links to the new element */
      const elementAfter = elementBefore.next
      elementBefore.next = newElement
      if (elementAfter) elementAfter.prev = newElement

      /* Set links from the new element */
      newElement.prev = elementBefore
      newElement.next = elementAfter

      /* Extend the list if the new element is added after the last element */
      if (this.last === elementBefore) this.last = newElement
    }
    // Nullify non-circular links
    this.last!.next = undefined
    this.first!.prev = undefined
    return this
  }

  /**
   * Remove an element from the list
   * @param {LinkedListElement} element
   * @returns {LinkedList}
   */
  remove(element: LinkedListElement<T>): LinkedList<T> {
    // Special case if the last edge is removed
    if (element === this.first && element === this.last) {
      this.first = undefined
      this.last = undefined
    } else {
      // Update the linked list
      if (element.prev) element.prev.next = element.next
      if (element.next) element.next.prev = element.prev
      // Update the first if needed
      if (element === this.first) {
        this.first = element.next
      }
      // Update the last if needed
      if (element === this.last) {
        this.last = element.prev
      }
    }
    return this
  }

  /**
   * Return true if the list is empty
   * @returns {boolean}
   */
  isEmpty(): boolean {
    return this.first === undefined
  }

  /**
   * Throw an error if a circular loop is detected in the linked list
   * @param {LinkedListElement} first - Element to start iteration
   * @throws {Errors.INFINITE_LOOP}
   */
  static testInfiniteLoop<T>(first: LinkedListElement<T>): void {
    let edge: LinkedListElement<T> | undefined = first
    let controlEdge: LinkedListElement<T> | undefined = first
    do {
      if (edge !== first && edge === controlEdge) {
        throw Errors.INFINITE_LOOP
      }
      edge = edge!.next
      controlEdge = controlEdge!.next!.next
    } while (edge !== first)
  }
}

/**
 * Class implements bidirectional non-circular linked list element
 */
export interface LinkedListElement<T> {
  prev: LinkedListElement<T> | undefined
  next: LinkedListElement<T> | undefined
  val: T
}
