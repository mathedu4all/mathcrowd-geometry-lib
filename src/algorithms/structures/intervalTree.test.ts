import { IntervalTree, Node, NumberInterval } from './intervalTree'

describe('RedBlackTree Node Check', function () {
  it('Node class required without traits has default traits defined', function () {
    expect(typeof Node.prototype.lessThan).toBe('function')
    expect(typeof Node.prototype.equalTo).toBe('function')
    expect(typeof Node.prototype.copyData).toBe('function')
    expect(typeof Node.prototype.updateMax).toBe('function')
  })
  it('May create new default instance of Node', function () {
    const node = new Node()
    expect(node).toBeInstanceOf(Node)
  })
  it('May create new instance of Node', function () {
    const node = new Node([1, 3], '1')
    expect(node.item).toEqual({ key: { low: 1, high: 3 }, value: '1' })
  })
  it('May compare intervals: [0,1] less than [1,3]', function () {
    const node1 = new Node([0, 1])
    const node2 = new Node([1, 3])
    expect(node1.lessThan(node2)).toBe(true)
  })
  it('May compare intervals: [0,5] less than [1,3]', function () {
    const node1 = new Node([0, 5])
    const node2 = new Node([1, 3])
    expect(node1.lessThan(node2)).toBe(true)
  })
  it('May compare intervals: [0,2] less than [0,3]', function () {
    const node1 = new Node([0, 2])
    const node2 = new Node([0, 3])
    expect(node1.lessThan(node2)).toBe(true)
  })
  it('May compare intervals: [1,4] is not less than [0,3]', function () {
    const node1 = new Node([1, 4])
    const node2 = new Node([0, 3])
    expect(node1.lessThan(node2)).toBe(false)
  })
  it('May compare intervals: [1,4] is not equal to [0,3]', function () {
    const node1 = new Node([1, 4])
    const node2 = new Node([0, 3])
    expect(node1.equalTo(node2)).toBe(false)
  })
  it('May compare intervals: [0,3] equal to [0,3]', function () {
    const node1 = new Node([0, 3])
    const node2 = new Node([0, 3])
    expect(node1.equalTo(node2)).toBe(true)
  })
  it('May compare {key, value}: {[0,3], "1"} is not equal to {[0,3], "2"', function () {
    const node1 = new Node([0, 3], '1')
    const node2 = new Node([0, 3], '2')
    expect(node1.equalTo(node2)).toBe(false)
  })
  it('Mat check intersection of intervals: [0,3] intersect [1,4]', function () {
    const node1 = new Node([0, 3])
    const node2 = new Node([1, 4])
    expect(node1.intersect(node2)).toBe(true)
  })
})

describe('RedBlackTree Check', function () {
  it('Test left rotation', function () {
    const tree = new IntervalTree()
    const node1 = new Node([5, 12], '', tree.nilNode, tree.nilNode)
    const node2 = new Node([1, 4], '', tree.nilNode, node1)
    node1.parent = node2
    const node3 = new Node([6, 8], '', node2, tree.nilNode)
    node2.parent = node3
    tree.root = node3
    tree.leftRotate(node2)
    expect(tree.size).toEqual(3)
    expect(tree.root.left).toEqual(node1)
  })
  it('Test right rotation', function () {
    const tree = new IntervalTree()
    const node1 = new Node([5, 12], '', tree.nilNode, tree.nilNode)
    const node2 = new Node([1, 4], '', tree.nilNode, node1)
    node1.parent = node2
    const node3 = new Node([6, 8], '', node2, tree.nilNode)
    node2.parent = node3
    tree.root = node3
    tree.rightRotate(node3)
    expect(tree.size).toEqual(3)
    expect(tree.root).toEqual(node2)
  })

  it('Test transplant', function () {
    const tree = new IntervalTree()
    const node1 = new Node([5, 12], '', tree.nilNode, tree.nilNode)
    const node2 = new Node([1, 4], '', tree.nilNode, node1)
    node1.parent = node2
    const node3 = new Node([6, 8], '', node2, tree.nilNode)
    node2.parent = node3
    tree.root = node3
    tree.transplant(node3.left!, node1)
    expect(tree.size).toEqual(2)
  })
})

describe('IntervalTree Check', function () {
  it('Create new instance of IntervalTree', function () {
    const tree = new IntervalTree()
    expect(tree).toBeInstanceOf(IntervalTree)
  })
  it('Size of empty tree will be 0', function () {
    const tree = new IntervalTree()
    expect(tree.size).toEqual(0)
  })
  it('May insert one entry with key - array of numbers', function () {
    const tree = new IntervalTree()
    tree.insert([1, 2])
    expect(tree.size).toEqual(1)
  })
  it('May insert many entries with key - array of numbers', function () {
    const tree = new IntervalTree()
    const ints: [number, number][] = [
      [6, 8],
      [1, 4],
      [5, 12]
    ]
    for (const int of ints) tree.insert(int)
    expect(tree.size).toEqual(3)
  })
  it('May insert entries while transforming numeric pair into Interval', function () {
    const tree = new IntervalTree()
    const pairs = [
      [6, 8],
      [1, 4],
      [5, 12],
      [1, 1],
      [5, 7]
    ]
    for (const pair of pairs) tree.insert(new NumberInterval(pair[0], pair[1]))
    expect(tree.size).toEqual(5)
    expect(tree.keys).toEqual([
      [1, 1],
      [1, 4],
      [5, 7],
      [5, 12],
      [6, 8]
    ])
  })
  it('May return array of keys sorted', function () {
    const tree = new IntervalTree()
    const ints: [number, number][] = [
      [6, 8],
      [1, 4],
      [5, 12],
      [1, 1],
      [5, 7]
    ]
    for (const int of ints) tree.insert(int)
    expect(tree.keys).toEqual([
      [1, 1],
      [1, 4],
      [5, 7],
      [5, 12],
      [6, 8]
    ])
  })
  it('May test if node entry exist after insertion', function () {
    const tree = new IntervalTree()
    const ints: [number, number][] = [
      [6, 8],
      [1, 4],
      [5, 12],
      [1, 1],
      [5, 7]
    ]
    for (let i = 0; i < ints.length; i++) tree.insert(ints[i], 'val' + i)
    expect(tree.keys).toEqual([
      [1, 1],
      [1, 4],
      [5, 7],
      [5, 12],
      [6, 8]
    ])
    for (let i = 0; i < ints.length; i++) {
      expect(tree.exist(ints[i], 'val' + i)).toEqual(true)
    }
  })
  it('May not find value when key was not inserted', function () {
    const tree = new IntervalTree()
    const ints: [number, number][] = [
      [6, 8],
      [1, 4],
      [5, 12],
      [1, 1],
      [5, 7]
    ]
    for (let i = 0; i < ints.length; i++) tree.insert(ints[i], 'val' + i)
    expect(tree.exist([2, 4], 'val')).toBe(false) // wrong interval
    expect(tree.exist([1, 4], 'val2')).toBe(false) // wrong value
  })
  it('May not find entry after key was deleted', function () {
    const tree = new IntervalTree()
    const ints: [number, number][] = [
      [6, 8],
      [1, 4],
      [5, 12],
      [1, 1],
      [5, 7]
    ]
    for (let i = 0; i < ints.length; i++) tree.insert(ints[i], 'val' + i)
    tree.remove([1, 4], 'val1')

    expect(tree.size).toEqual(4)
    expect(tree.keys).toEqual([
      [1, 1],
      [5, 7],
      [5, 12],
      [6, 8]
    ])
    expect(tree.exist([1, 4])).toBe(false)
  })
  it('May become empty after all entries will be deleted', function () {
    const tree = new IntervalTree()
    const ints: [number, number][] = [
      [6, 8],
      [1, 4],
      [5, 12],
      [1, 1],
      [5, 7]
    ]
    for (let i = 0; i < ints.length; i++) tree.insert(ints[i], 'val' + i)
    tree.remove([6, 8], 'val0')
    tree.remove([1, 4], 'val1')
    tree.remove([5, 12], 'val2')
    tree.remove([1, 1], 'val3')
    tree.remove([5, 7], 'val4')

    expect(tree.size).toEqual(0)
    expect(tree.isEmpty()).toBe(true)
  })
  it('May return array of items', function () {
    const tree = new IntervalTree()
    const ints: [number, number][] = [
      [6, 8],
      [1, 4],
      [5, 12],
      [1, 1],
      [5, 7]
    ]
    for (let i = 0; i < ints.length; i++) tree.insert(ints[i], 'val' + i)

    const items = tree.items
    const keys = []
    for (const item of items) {
      keys.push(item)
    }
    expect(items.length).toEqual(5)
    expect(keys.length).toEqual(5)
    expect(tree.keys).toEqual([
      [1, 1],
      [1, 4],
      [5, 7],
      [5, 12],
      [6, 8]
    ])
  })
  it('May transform tree to another tree using map', function () {
    const tree1 = new IntervalTree()
    const ints: [number, number][] = [
      [6, 8],
      [1, 4],
      [5, 12],
      [1, 1],
      [5, 7]
    ]
    for (let i = 0; i < ints.length; i++) tree1.insert(ints[i], 'val' + i)

    const tree2 = tree1.map((value, key) => key.high - key.low)

    expect(tree2.size).toEqual(5)
    expect(tree2.keys).toEqual([
      [1, 1],
      [1, 4],
      [5, 7],
      [5, 12],
      [6, 8]
    ])
    expect(tree2.values).toEqual([0, 3, 2, 7, 2])
  })

  it('May search interval and return array of values', function () {
    const tree = new IntervalTree()
    const ints: [number, number][] = [
      [6, 8],
      [1, 4],
      [5, 12],
      [1, 1],
      [5, 7]
    ]
    for (let i = 0; i < ints.length; i++) tree.insert(ints[i], 'val' + i)
    expect(tree.search([2, 3])).toEqual(['val1'])
  })
  it('May search interval and return array of custom transformed objects', function () {
    const composers = [
      { name: 'Ludwig van Beethoven', period: [1770, 1827] },
      { name: 'Johann Sebastian Bach', period: [1685, 1750] },
      { name: 'Wolfgang Amadeus Mozart', period: [1756, 1791] },
      { name: 'Johannes Brahms', period: [1833, 1897] },
      { name: 'Richard Wagner', period: [1813, 1883] },
      { name: 'Claude Debussy', period: [1862, 1918] },
      { name: 'Pyotr Ilyich Tchaikovsky', period: [1840, 1893] },
      { name: 'Frédéric Chopin', period: [1810, 1849] },
      { name: 'Joseph Haydn', period: [1732, 1809] },
      { name: 'Antonio Vivaldi', period: [1678, 1741] }
    ]
    const tree = new IntervalTree()
    for (const composer of composers)
      tree.insert(composer.period as [number, number], composer.name)

    const searchRes = tree.search([1600, 1700], (name, period) => {
      return `${name} (${period.low}-${period.high})`
    })
    expect(searchRes.length).toEqual(2)
    expect(searchRes[0]).toEqual('Antonio Vivaldi (1678-1741)')
    expect(searchRes[1]).toEqual('Johann Sebastian Bach (1685-1750)')
  })
  it('May return empty array when search interval does not intersect any', function () {
    const tree = new IntervalTree()
    const ints = [
      [6, 8],
      [1, 2],
      [7, 12],
      [1, 1],
      [5, 7]
    ]
    for (let i = 0; i < ints.length; i++)
      tree.insert(ints[i] as [number, number], 'val' + i)
    expect(tree.search([3, 4])).toEqual([])
  })
  it('Each red node has exactly two black child nodes', function () {
    const tree = new IntervalTree()
    const ints = [
      [6, 8],
      [1, 2],
      [7, 12],
      [1, 1],
      [5, 7]
    ]
    for (let i = 0; i < ints.length; i++)
      tree.insert(ints[i] as [number, number], 'val' + i)
    expect(tree.testRedBlackProperty()).toEqual(true)
  })
  it('Each path from root to nil node has same black height', function () {
    const tree = new IntervalTree()
    const ints = [
      [6, 8],
      [1, 2],
      [7, 12],
      [1, 1],
      [5, 7]
    ]
    for (let i = 0; i < ints.length; i++)
      tree.insert(ints[i] as [number, number], 'val' + i)
    const height = (tree: IntervalTree) => {
      return tree.testBlackHeightProperty(tree.root!)
    }
    expect(height(tree)).toEqual(3)
  })
  it('Same black height property preserved while nodes deleted', function () {
    const tree = new IntervalTree()
    const ints = [
      [6, 8],
      [1, 2],
      [7, 12],
      [1, 1],
      [5, 7]
    ]
    for (let i = 0; i < ints.length; i++)
      tree.insert(ints[i] as [number, number], 'val' + i)
    const height = (tree: IntervalTree) => {
      return tree.testBlackHeightProperty(tree.root!)
    }
    tree.remove([1, 1], 'val3')
    expect(height(tree)).toEqual(3)
    expect(tree.testRedBlackProperty()).toEqual(true)

    tree.remove([5, 7], 'val4')
    expect(height(tree)).toEqual(3)
    expect(tree.testRedBlackProperty()).toEqual(true)

    tree.remove([1, 2], 'val1')
    expect(tree.testRedBlackProperty()).toEqual(true)
    expect(height(tree)).toEqual(2)

    tree.remove([6, 8], 'val0')
    expect(tree.testRedBlackProperty()).toEqual(true)
    expect(height(tree)).toEqual(2)

    tree.remove([7, 12], 'val2')
    expect(tree.testRedBlackProperty()).toEqual(true)
  })
  it('Test search interval', function () {
    function setupTreeAndSearch(
      intervals: [number, number][],
      searchInterval: [number, number]
    ) {
      const tree = new IntervalTree()

      for (let i = 0; i < intervals.length; i++) {
        tree.insert(intervals[i], 'val' + i)
      }

      return tree.search(searchInterval)
    }

    const resp1 = setupTreeAndSearch(
      [
        [1, 1],
        [1, 4],
        [5, 6],
        [5.5, 7],
        [7, 8]
      ],
      [5.5, 5.7]
    )
    expect(resp1).toEqual(['val2', 'val3'])

    const resp2 = setupTreeAndSearch(
      [
        [1, 1],
        [1, 4],
        [5, 6],
        [6, 7],
        [7, 8]
      ],
      [5.5, 5.7]
    )
    expect(resp2).toEqual(['val2'])
  })
  it('Low or high can be 0', function () {
    const tree = new IntervalTree()
    const ints = [
      [0, 0],
      [0, 0],
      [1, 1],
      [0, 0]
    ]
    for (let i = 0; i < ints.length; i++)
      tree.insert(ints[i] as [number, number], 'val' + i)
    expect(tree.search([0, 0])).toEqual(['val0', 'val1', 'val3'])
  })
  it('Insert nodes with same key but different values.', function () {
    const intervalTree3 = new IntervalTree()

    intervalTree3.insert([2, 5], 10)
    intervalTree3.insert([2, 5], 20)
    intervalTree3.insert([2, 5], 30)
    intervalTree3.insert([2, 5], 40)
    intervalTree3.insert([2, 5], 50)

    expect(intervalTree3.exist([2, 5], 10)).toBe(true)
    expect(intervalTree3.exist([2, 5], 20)).toBe(true)
    expect(intervalTree3.exist([2, 5], 30)).toBe(true)
    expect(intervalTree3.exist([2, 5], 40)).toBe(true)
    expect(intervalTree3.exist([2, 5], 50)).toBe(true)
    expect(intervalTree3.exist([2, 5], 25)).toBe(false)
  })
  it('May store any falsy values: 0, false, NaN, null', function () {
    const tree = new IntervalTree()
    tree.insert([0, 0], 0)
    tree.insert([0, 0], false)
    tree.insert([0, 0], NaN)
    tree.insert([0, 0], null)

    const resp1 = tree.search([0, 0])
    expect(resp1).toEqual([0, false, NaN, null])
  })
  it('Cannot store undefined value', function () {
    const tree = new IntervalTree()
    tree.insert([0, 0], undefined)

    const resp1 = tree.search([0, 0])
    expect(resp1).toEqual([[0, 0]])
  })
  it('May search interval and return true if intersection with any interval found. Issue #26', function () {
    const tree = new IntervalTree()
    const intervals = [
      [7, 8],
      [1, 4],
      [11, 12],
      [1, 1],
      [5, 7]
    ]
    for (let i = 0; i < intervals.length; i++)
      tree.insert(intervals[i] as [number, number], 'val' + i)
    expect(tree.intersectAny([2, 3])).toBe(true)
    expect(tree.intersectAny([4, 4])).toBe(true)
    expect(tree.intersectAny([4, 10])).toBe(true)
    expect(tree.intersectAny([9, 10])).toBe(false)
    expect(tree.intersectAny([-1, 0])).toBe(false)
    expect(tree.intersectAny([15, 20])).toBe(false)
  })
  it('May test if any of great composers lived in second half of XX century', function () {
    const composers = [
      { name: 'Ludwig van Beethoven', period: [1770, 1827] },
      { name: 'Johann Sebastian Bach', period: [1685, 1750] },
      { name: 'Wolfgang Amadeus Mozart', period: [1756, 1791] },
      { name: 'Johannes Brahms', period: [1833, 1897] },
      { name: 'Richard Wagner', period: [1813, 1883] },
      { name: 'Claude Debussy', period: [1862, 1918] },
      { name: 'Pyotr Ilyich Tchaikovsky', period: [1840, 1893] },
      { name: 'Frédéric Chopin', period: [1810, 1849] },
      { name: 'Joseph Haydn', period: [1732, 1809] },
      { name: 'Antonio Vivaldi', period: [1678, 1741] }
    ]
    const tree = new IntervalTree()
    for (const composer of composers)
      tree.insert(composer.period as [number, number], composer.name)
    expect(tree.intersectAny([1950, 2000])).toBe(false)
  })
})
