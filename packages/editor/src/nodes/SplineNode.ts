import { Object3D } from 'three'

import Spline from '@xrengine/engine/src/scene/classes/Spline'

import { NodeManager } from '../managers/NodeManager'
import EditorNodeMixin from './EditorNodeMixin'
import SplineHelperNode from './SplineHelperNode'

export default class SplineNode extends EditorNodeMixin(Object3D) {
  static legacyComponentName = 'spline'
  static nodeName = 'Spline'
  helper = null
  loadedSplinePositions = null
  static async deserialize(json) {
    const node = await super.deserialize(json)
    const { splinePositions } = json.components.find((c) => c.name === 'spline').props
    node.loadedSplinePositions = splinePositions
    return node
  }
  constructor() {
    super()
    this.helper = new Spline(SplineHelperNode)

    super.add(this.helper)
  }
  onAdd() {
    this.helper.init(this.loadedSplinePositions)
    const initialSplineHelperObjects = this.helper.getCurrentSplineHelperObjects()
    for (let index = 0; index < initialSplineHelperObjects.length; index++) {
      const object = initialSplineHelperObjects[index]
      this.addSplineHelperObjectToEditorNodes(object)
    }
  }
  onChange() {}
  onSelect() {}
  onDeselect() {}
  onAddNodeToSpline() {
    const newSplineObject = this.helper.addPoint()

    this.addSplineHelperObjectToEditorNodes(newSplineObject)
  }
  addSplineHelperObjectToEditorNodes(splineHelperObject) {
    super.add(splineHelperObject)
    // Maybe this should not be done here?
    NodeManager.instance.add(splineHelperObject)
  }

  copy(source): this {
    return super.copy(source, false)
  }
  async serialize(projectID) {
    const splineExportInfo = this.helper.exportSpline()
    console.log(splineExportInfo)
    return await super.serialize(projectID, {
      spline: {
        splinePositions: splineExportInfo
      }
    })
  }
  prepareForExport() {
    super.prepareForExport()
  }
}
