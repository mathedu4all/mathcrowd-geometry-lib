import { Errors } from '../../utils/errors'
import { LinkedList, LinkedListElement } from './linkedList'
import { CircularLinkedList } from './circularLinkedList'
interface Element extends LinkedListElement {
  val: string
}
describe('LinkedList', function () {
  it('May create new instance of LinkedList', function () {
    const list = new LinkedList()
    expect(list).toBeInstanceOf(LinkedList)
    expect(list.isEmpty()).toBe(true)
  })
  it('May return size of empty linked list', function () {
    const list = new LinkedList()
    expect(list.size).toBe(0)
  })
  it('May append element to empty linked list', function () {
    const list = new LinkedList()
    const element = { val: 'one', next: undefined, prev: undefined }
    list.append(element)
    expect(list.size).toBe(1)
    expect(list.first).toBe(element)
    expect(list.last).toBe(element)
  })
  it('May append 5 elements to linked list', function () {
    const list = new LinkedList()
    const element1 = { val: 'one', next: undefined, prev: undefined }
    const element2 = { val: 'two', next: undefined, prev: undefined }
    const element3 = { val: 'three', next: undefined, prev: undefined }
    const element4 = { val: 'four', next: undefined, prev: undefined }
    const element5 = { val: 'five', next: undefined, prev: undefined }
    list.append(element1)
    list.append(element2)
    list.append(element3)
    list.append(element4)
    list.append(element5)
    expect(list.size).toBe(5)
    expect(list.first).toBe(element1)
    expect(list.last).toBe(element5)
  })
  it('May insert element to the middle of linked list', function () {
    const list = new LinkedList()
    const element1 = { val: 'one', next: undefined, prev: undefined }
    const element2 = { val: 'two', next: undefined, prev: undefined }
    const element3 = { val: 'three', next: undefined, prev: undefined }
    const element4 = { val: 'four', next: undefined, prev: undefined }
    const element5 = { val: 'five', next: undefined, prev: undefined }
    const element10 = { val: 'ten', next: undefined, prev: undefined }
    list.append(element1)
    list.append(element2)
    list.append(element3)
    list.append(element4)
    list.append(element5)
    list.insert(element10, element2)
    expect(list.size).toBe(6)
    expect(element2.next).toBe(element10)
    expect(element10.next).toBe(element3)
    expect(element3.prev).toBe(element10)
    expect(element10.prev).toBe(element2)
  })
  it('May insert element to the end of linked list', function () {
    const list = new LinkedList()
    const element1 = { val: 'one', next: undefined, prev: undefined }
    const element2 = { val: 'two', next: undefined, prev: undefined }
    const element3 = { val: 'three', next: undefined, prev: undefined }
    const element4 = { val: 'four', next: undefined, prev: undefined }
    const element5 = { val: 'five', next: undefined, prev: undefined }
    const element10 = { val: 'ten', next: undefined, prev: undefined }
    list.append(element1)
    list.append(element2)
    list.append(element3)
    list.append(element4)
    list.append(element5)
    list.insert(element10, element5)
    expect(list.size).toBe(6)
    expect(element5.next).toBe(element10)
    expect(element10.prev).toBe(element5)
    expect(list.last).toBe(element10)
  })
  it('May insert element to the beginning of linked list if elementBefore is null', function () {
    const list = new LinkedList()
    const element1 = { val: 'one', next: undefined, prev: undefined }
    const element2 = { val: 'two', next: undefined, prev: undefined }
    const element3 = { val: 'three', next: undefined, prev: undefined }
    const element4 = { val: 'four', next: undefined, prev: undefined }
    const element5 = { val: 'five', next: undefined, prev: undefined }
    const element10 = { val: 'ten', next: undefined, prev: undefined }
    list.append(element1)
    list.append(element2)
    list.append(element3)
    list.append(element4)
    list.append(element5)
    list.insert(element10)
    expect(list.size).toBe(6)
    expect(element1.prev).toBe(element10)
    expect(element10.next).toBe(element1)
    expect(list.first).toBe(element10)
  })
  it('May insert element to the empty list', function () {
    const list = new LinkedList()
    const element1 = { val: 'one', next: undefined, prev: undefined }
    list.insert(element1)
    expect(list.size).toBe(1)
    expect(list.first).toBe(element1)
    expect(list.last).toBe(element1)
  })
  it('May remove element from the linked list', function () {
    const list = new LinkedList()
    const element1 = { val: 'one', next: undefined, prev: undefined }
    const element2 = { val: 'two', next: undefined, prev: undefined }
    const element3 = { val: 'three', next: undefined, prev: undefined }
    const element4 = { val: 'four', next: undefined, prev: undefined }
    const element5 = { val: 'five', next: undefined, prev: undefined }
    list.append(element1)
    list.append(element2)
    list.append(element3)
    list.append(element4)
    list.append(element5)

    expect(list.size).toBe(5)

    list.remove(element3)
    expect(list.size).toBe(4)
  })
  it('May remove all elements', function () {
    const list = new LinkedList()
    const element1 = { val: 'one', next: undefined, prev: undefined }
    const element2 = { val: 'two', next: undefined, prev: undefined }
    const element3 = { val: 'three', next: undefined, prev: undefined }
    const element4 = { val: 'four', next: undefined, prev: undefined }
    const element5 = { val: 'five', next: undefined, prev: undefined }
    list.append(element1)
    list.append(element2)
    list.append(element3)
    list.append(element4)
    list.append(element5)

    expect(list.size).toBe(5)

    list.remove(element1)
    list.remove(element2)
    list.remove(element3)
    list.remove(element4)
    list.remove(element5)
    expect(list.isEmpty()).toBe(true)
    expect(list.size).toBe(0)
  })
  it('May return array of all elements', function () {
    const list = new LinkedList()
    const element1: Element = { val: 'one', next: undefined, prev: undefined }
    const element2: Element = { val: 'two', next: undefined, prev: undefined }
    const element3: Element = { val: 'three', next: undefined, prev: undefined }
    const element4: Element = { val: 'four', next: undefined, prev: undefined }
    const element5: Element = { val: 'five', next: undefined, prev: undefined }
    list.append(element1)
    list.append(element2)
    list.append(element3)
    list.append(element4)
    list.append(element5)

    const arr = list.toArray().map((elm) => (elm as Element).val)
    expect(arr).toEqual(['one', 'two', 'three', 'four', 'five'])
  })
  it('May construct linked list by first and last', function () {
    const element1: Element = {
      val: 'one',
      next: undefined,
      prev: undefined
    }
    const element2: Element = {
      val: 'two',
      next: undefined,
      prev: undefined
    }
    const element3: Element = {
      val: 'three',
      next: undefined,
      prev: undefined
    }
    const element4: Element = {
      val: 'four',
      next: undefined,
      prev: undefined
    }
    const element5: Element = {
      val: 'five',
      next: undefined,
      prev: undefined
    }

    element1.next = element2
    element2.next = element3
    element2.prev = element1
    element3.next = element4
    element3.prev = element2
    element4.next = element5
    element4.prev = element3
    element5.prev = element4

    const list = new LinkedList(element1, element5)
    expect(list.size).toBe(5)
    expect(list.first).toBe(element1)
    expect(list.last).toBe(element5)
    const arr = list.toArray().map((elm) => (elm as Element).val)
    expect(arr).toEqual(['one', 'two', 'three', 'four', 'five'])
  })
  it('May throw error when infinite loop detected', function () {
    const element1: Element = {
      val: 'one',
      next: undefined,
      prev: undefined
    }
    const element2: Element = {
      val: 'two',
      next: undefined,
      prev: undefined
    }
    const element3: Element = {
      val: 'three',
      next: undefined,
      prev: undefined
    }
    const element4: Element = {
      val: 'four',
      next: undefined,
      prev: undefined
    }
    const element5: Element = {
      val: 'five',
      next: undefined,
      prev: undefined
    }

    element1.next = element2
    element2.next = element3
    element2.prev = element1
    element3.next = element4
    element3.prev = element2
    element4.next = element5
    element4.prev = element3
    element5.prev = element4
    element5.next = element3

    expect(() => LinkedList.testInfiniteLoop(element1)).toThrow(
      Errors.INFINITE_LOOP.message
    )
  })
  it('May reverse linked list', function () {
    const list = new LinkedList()
    const element1: Element = { val: 'one', next: undefined, prev: undefined }
    const element2: Element = { val: 'two', next: undefined, prev: undefined }
    const element3: Element = { val: 'three', next: undefined, prev: undefined }
    const element4: Element = { val: 'four', next: undefined, prev: undefined }
    const element5: Element = { val: 'five', next: undefined, prev: undefined }
    list.append(element1)
    list.append(element2)
    list.append(element3)
    list.append(element4)
    list.append(element5)

    list.reverse()
    expect(list.size).toBe(5)
    expect(list.first).toBe(element5)
    expect(list.last).toBe(element1)
  })
})

describe('CircularLinkedList', () => {
  // Test case for the append method
  test('append adds a new element to the list', () => {
    const linkedList = new CircularLinkedList(undefined, undefined)
    const element = { val: 1, next: undefined, prev: undefined }
    linkedList.append(element)
    // Perform assertions based on your expectations
    expect(linkedList.size).toBe(1)
    expect((linkedList.first as Element).val).toBe(1)
  })

  // Test circularity of the list
  test('append makes the list circular', () => {
    const element1 = {
      val: 'one',
      next: undefined,
      prev: undefined
    }
    const element2 = {
      val: 'two',
      next: undefined,
      prev: undefined
    }
    const element3 = {
      val: 'three',
      next: undefined,
      prev: undefined
    }
    const element4 = {
      val: 'four',
      next: undefined,
      prev: undefined
    }
    const element5 = {
      val: 'five',
      next: undefined,
      prev: undefined
    }

    const list = new CircularLinkedList(undefined, undefined)
    list.append(element1)
    list.append(element2)
    list.append(element3)
    list.append(element4)
    list.append(element5)
    expect(list.size).toBe(5)
    expect(list.first).toBe(element1)
    expect(list.last).toBe(element5)
    expect(list.last!.next).toBe(list.first)
  })

  // test case for the insert method
  test('insert adds a new element to the list', () => {
    const linkedList = new CircularLinkedList(undefined, undefined)
    const element1 = { val: 1, next: undefined, prev: undefined }
    linkedList.insert(element1)
    // Perform assertions based on your expectations
    expect(linkedList.size).toBe(1)
    expect((linkedList.first as Element).val).toBe(1)
    const element2 = { val: 2, next: undefined, prev: undefined }
    linkedList.insert(element2, linkedList.first)

    // Perform assertions based on your expectations
    expect(linkedList.size).toBe(2)
    expect((linkedList.first! as Element).val).toBe(1)

    const element3 = { val: 3, next: undefined, prev: undefined }
    linkedList.insert(element3)
    expect(linkedList.size).toBe(3)
    expect((linkedList.first! as Element).val).toBe(3)
    expect((linkedList.first!.next! as Element).val).toBe(1)
    expect((linkedList.first!.next!.next! as Element).val).toBe(2)
    expect((linkedList.first!.next!.next!.next! as Element).val).toBe(3)
  })
  it('May reverse linked list', function () {
    const list = new CircularLinkedList()
    const element1: Element = { val: 'one', next: undefined, prev: undefined }
    const element2: Element = { val: 'two', next: undefined, prev: undefined }
    const element3: Element = { val: 'three', next: undefined, prev: undefined }
    const element4: Element = { val: 'four', next: undefined, prev: undefined }
    const element5: Element = { val: 'five', next: undefined, prev: undefined }
    list.append(element1)
    list.append(element2)
    list.append(element3)
    list.append(element4)
    list.append(element5)

    list.reverse()
    expect(list.size).toBe(5)
    expect(list.first).toBe(element5)
    expect(list.last).toBe(element1)
  })
})
