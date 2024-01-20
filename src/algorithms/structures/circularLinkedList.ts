import { LinkedList, LinkedListElement } from './linkedList'

/**
 * Class implements circular bidirectional linked list
 * LinkedListElement - object of any type that has properties next and prev.
 */
export class CircularLinkedList extends LinkedList {
  constructor(
    first: LinkedListElement | undefined = undefined,
    last: LinkedListElement | undefined = undefined
  ) {
    super(first, last)
    this.setCircularLinks()
  }

  setCircularLinks(): void {
    if (this.isEmpty()) return
    this.last!.next = this.first!
    this.first!.prev = this.last!
  }

  [Symbol.iterator](): Iterator<LinkedListElement> {
    let element: LinkedListElement | undefined = undefined

    const iterator: Iterator<LinkedListElement> = {
      next: (): IteratorResult<LinkedListElement> => {
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
   * @param {LinkedList} element - new element to be appended
   * @returns {CircularLinkedList}
   */
  append(element: LinkedListElement): CircularLinkedList {
    super.append(element)
    this.setCircularLinks()
    return this
  }

  /**
   * Insert new element to the list after elementBefore
   * @param {LinkedList} newElement - new element to be inserted
   * @param {LinkedList} elementBefore - element in the list to insert after it
   * @returns {CircularLinkedList}
   */
  insert(
    newElement: LinkedListElement,
    elementBefore?: LinkedListElement
  ): CircularLinkedList {
    super.insert(newElement, elementBefore)
    this.setCircularLinks()
    return this
  }

  /**
   * Remove element from the list
   * @param {LinkedList} element - element to be removed from the list
   * @returns {CircularLinkedList}
   */
  remove(element: LinkedListElement): CircularLinkedList {
    super.remove(element)
    this.setCircularLinks()
    return this
  }
}

export default CircularLinkedList
