import { AnimationAction } from 'three'

// BlendSpace 1D allow any number of animations to be blended between based on a input value
export class BlendSpace1D {
  minValue: number
  maxValue: number
  _value: number
  _nodes: any[]

  constructor() {
    this.minValue = 0
    this.maxValue = 100
    this._value = 0
    this._nodes = []
  }

  _sortNodes() {
    this._nodes.sort((a, b) => a.position - b.position)
  }

  /**
   * Adds a node to the graph the position must be between min/max values
   *
   * @param action Animation action of the node
   * @param position Position of the animation action
   * @param data Optional user data
   */
  addNode(action: AnimationAction, position: number, data: any = null) {
    // Test position against min/max values
    if (position < this.minValue || position > this.maxValue) {
      console.warn('BlendSpace1D: Added action position is out of range.', position, this.minValue, this.maxValue)
    }

    this._nodes.push({ action, weight: 0, position, data })
    this._sortNodes()
  }

  set value(input: number) {
    this._value = Math.max(Math.min(this.maxValue, input), this.minValue)
  }

  _findNearestNodes() {
    // Binary search, needs at least 2 nodes to work
    let first = 1,
      last = this._nodes.length - 1,
      count = last - first

    while (count > 0) {
      const step = Math.floor(count / 2)
      const middle = first + step

      if (this._value > this._nodes[middle].position) {
        first = middle + 1
        count -= step + 1
      } else {
        count = step
      }
    }

    return [this._nodes[first - 1], this._nodes[first]]
  }

  _zeroOtherNodesWeight(currentNodes: any[]) {
    this._nodes.filter((x) => !currentNodes.includes(x)).forEach((x) => (x.action.weight = 0))
  }

  update() {
    // At least two nodes should be present
    if (this._nodes.length < 2) {
      return []
    }

    const [nodeA, nodeB] = this._findNearestNodes()

    this._zeroOtherNodesWeight([nodeA, nodeB])

    let diff = nodeB.position - nodeA.position,
      alpha = diff < 0.00001 ? 0 : (this._value - nodeA.position) / diff

    nodeA.action.weight = nodeA.weight = 1 - alpha
    nodeB.action.weight = nodeB.weight = alpha

    return [nodeA, nodeB]
  }
}
