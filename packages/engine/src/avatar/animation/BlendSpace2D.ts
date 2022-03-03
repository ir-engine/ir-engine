// TODO: Add Delaunay triangulation to sample points and interpolate samples based on nearest triangles
// https://arrowinmyknee.com/2020/10/13/deep-dive-into-blendspace-in-ue4/
import { AnimationAction, Vector2 } from 'three'

// BlendSpace 2D allow any number of animations to be blended between based on a 2D input value
export class BlendSpace2D {
  minValue: Vector2
  maxValue: Vector2
  _gridDivisions: Vector2
  _gridSize: Vector2

  _normalizedValue: Vector2
  _value: Vector2
  _nodes: any[][]
  _flatNodeList: any[]

  // temp vectors
  _tempVec1: Vector2
  _tempVec2: Vector2

  constructor() {
    // TODO: Add validation for min/max values
    this.minValue = new Vector2()
    this.maxValue = new Vector2()
    this._gridDivisions = new Vector2()
    this._value = new Vector2()
    this._normalizedValue = new Vector2()
    this._gridSize = new Vector2(1, 1)
    this._tempVec1 = new Vector2()
    this._tempVec2 = new Vector2()
    this._nodes = []
    this._flatNodeList = []
  }

  setGridDivisions(divisions: Vector2) {
    if (divisions.x < 1 || divisions.y < 1) {
      console.warn('Invalid grid divisions', divisions)
      return
    }

    this._gridDivisions.copy(divisions)
    this._gridSize.copy(this.maxValue).sub(this.minValue).divide(divisions)
  }

  set value(input: Vector2) {
    this._value.copy(input)
  }

  _getNormalizedValue() {
    return this._normalizedValue
      .copy(this._value)
      .clamp(this.minValue, this.maxValue)
      .sub(this.minValue)
      .divide(this._gridSize)
  }

  _getGridNode(x: number, y: number) {
    const xArr = this._nodes[x]
    if (!xArr) return null
    return xArr[y]
  }

  /**
   * Adds an action to one of the grid nodes
   * @param action Animation action
   * @param position Grid index
   * @param data optional data to attach to this node
   */
  addNode(action: AnimationAction, position: Vector2, data: any = null) {
    const x = Math.floor(position.x),
      y = Math.floor(position.y)
    if (x < 0 || x > this._gridDivisions.x || y < 0 || y > this._gridDivisions.y) {
      console.warn('Invalid node position', position)
      return
    }

    const node = { action, position, data }
    this._flatNodeList.push(node)
    this._setNodeValue(node, x, y)
  }

  _setNodeValue(node, x, y) {
    if (!this._nodes[x]) {
      this._nodes[x] = []
    }
    this._nodes[x][y] = node
  }

  _zeroOtherNodesWeight(currentNodes: any[]) {
    this._flatNodeList.filter((x) => !currentNodes.includes(x)).forEach((x) => (x.action.weight = 0))
  }

  update() {
    // bi-linear interpolation
    const normalizedValue = this._getNormalizedValue()
    const gridIndex = this._tempVec1.set(Math.floor(normalizedValue.x), Math.floor(normalizedValue.y))
    const frac = this._tempVec2.copy(normalizedValue).sub(gridIndex)

    const bottomLeft = this._getGridNode(gridIndex.x, gridIndex.y)
    if (bottomLeft) {
      bottomLeft.action.weight = (1 - frac.x) * (1 - frac.y)
    }

    const topLeft = this._getGridNode(gridIndex.x, gridIndex.y + 1)
    if (topLeft) {
      topLeft.action.weight = (1 - frac.x) * frac.y
    }

    const bottomRight = this._getGridNode(gridIndex.x + 1, gridIndex.y)
    if (bottomRight) {
      bottomRight.action.weight = frac.x * (1 - frac.y)
    }

    const topRight = this._getGridNode(gridIndex.x + 1, gridIndex.y + 1)
    if (topRight) {
      topRight.action.weight = frac.x * frac.y
    }

    const returnNodes = [bottomLeft, topLeft, topRight, bottomRight]
    this._zeroOtherNodesWeight(returnNodes)

    return returnNodes
  }
}
