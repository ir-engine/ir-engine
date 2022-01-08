import { Object3D } from 'three'

import { SystemUpdateType } from '@xrengine/engine/src/ecs/functions/SystemUpdateType'

import EditorNodeMixin from './EditorNodeMixin'

/**
 * @author Hanzla Mateen <hanzlamateen@live.com>
 */
export default class SystemNode extends EditorNodeMixin(Object3D) {
  static legacyComponentName = 'system'
  static nodeName = 'System'
  static disableTransform = true
  static haveStaticTags = false

  filePath: string
  systemUpdateType: keyof typeof SystemUpdateType
  enableClient: boolean
  enableServer: boolean
  args: string // as JSON - TODO: improve this

  static async deserialize(json) {
    const node = await super.deserialize(json)
    const system = json.components.find((c) => c.name === 'system')
    if (system) {
      const { filePath, systemUpdateType, enableClient, enableServer, args } = system.props
      node.filePath = filePath
      node.systemUpdateType = systemUpdateType
      node.enableClient = enableClient
      node.enableServer = enableServer
      node.args = args
    }
    return node
  }

  copy(source, recursive = true) {
    this.filePath = source.filePath
    this.systemUpdateType = source.systemUpdateType
    this.enableClient = source.enableClient
    this.enableServer = source.enableServer
    this.args = source.args
    return this
  }

  async serialize(projectID) {
    return await super.serialize(projectID, {
      system: {
        filePath: this.filePath,
        systemUpdateType: this.systemUpdateType,
        enableClient: this.enableClient,
        enableServer: this.enableServer,
        args: this.args
      }
    })
  }
}
