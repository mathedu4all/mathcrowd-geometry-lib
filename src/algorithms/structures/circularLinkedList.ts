import { LinkedList, LinkedListElement } from './linkedList'

/**
 * Class implements circular bidirectional linked list
 * LinkedListElement - object of any type that has properties next and prev.
 */
export class CircularLinkedList<T> extends LinkedList<T> {
  constructor(
    first: LinkedListElement<T> | undefined,
    last: LinkedListElement<T> | undefined
  ) {
    super(first, last)
    this.setCircularLinks()
  }

  setCircularLinks(): void {
    if (this.isEmpty()) return
    this.last!.next = this.first!
    this.first!.prev = this.last!
  }

  [Symbol.iterator](): Iterator<LinkedListElement<T>> {
    let element: LinkedListElement<T> | undefined = undefined

    const iterator: Iterator<LinkedListElement<T>> = {
      next: (): IteratorResult<LinkedListElement<T>> => {
        const value = element ? element : this.first!
        const done = this.first
          ? element
            ? element === this.first
            : false
          : true
        element = value ? value.next : undefined
        return { value, done }
      }
    }

    return iterator
  }

  /**
   * Append new element to the end of the list
   * @param {LinkedList<T>} element - new element to be appended
   * @returns {CircularLinkedList<T>}
   */
  append(element: LinkedListElement<T>): CircularLinkedList<T> {
    super.append(element)
    this.setCircularLinks()
    return this
  }

  /**
   * Insert new element to the list after elementBefore
   * @param {LinkedList<T>} newElement - new element to be inserted
   * @param {LinkedList<T>} elementBefore - element in the list to insert after it
   * @returns {CircularLinkedList<T>}
   */
  insert(
    newElement: LinkedListElement<T>,
    elementBefore?: LinkedListElement<T>
  ): CircularLinkedList<T> {
    super.insert(newElement, elementBefore)
    this.setCircularLinks()
    return this
  }

  /**
   * Remove element from the list
   * @param {LinkedList<T>} element - element to be removed from the list
   * @returns {CircularLinkedList<T>}
   */
  remove(element: LinkedListElement<T>): CircularLinkedList<T> {
    super.remove(element)
    this.setCircularLinks()
    return this
  }
}

export default CircularLinkedList
