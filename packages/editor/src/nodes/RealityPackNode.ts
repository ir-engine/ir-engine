import { SystemUpdateType } from '@xrengine/engine/src/ecs/functions/SystemUpdateType'
import { Object3D } from 'three'
import EditorNodeMixin from './EditorNodeMixin'

/**
 * @author Abhishek Pathak <abhi.pathak401@gmail.com>
 */
export default class ProjectNode extends EditorNodeMixin(Object3D) {
  static legacyComponentName = 'project'
  static nodeName = 'Project'
  static disableTransform = true
  static haveStaticTags = false

  packName: string
  entryPoints: {
    systemUpdateType: keyof typeof SystemUpdateType
    entryPoint: string
  }[] = []

  static async deserialize(json) {
    const node = await super.deserialize(json)
    const { packName, entryPoints } = json.components.find((c) => c.name === 'project').props
    node.packName = packName
    node.entryPoints = entryPoints ?? []
    return node
  }

  async serialize(projectID) {
    return await super.serialize(projectID, {
      project: {
        packName: this.packName,
        entryPoints: this.entryPoints
      }
    })
  }
}
