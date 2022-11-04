import { Event, Object3D } from 'three'

import { parseECSData } from '../../../../scene/functions/loadGLTFModel'
import { GLTF, GLTFLoaderPlugin } from '../GLTFLoader'
import { ImporterExtension } from './ImporterExtension'

export type EE_ecs = {
  data: Record<string, any>
}

export default class EEECSImporterExtension extends ImporterExtension implements GLTFLoaderPlugin {
  name = 'EE_ecs'

  createNodeAttachment(nodeIndex: number) {
    const parser = this.parser
    const json = parser.json
    const nodeDef = json.nodes[nodeIndex]
    if (!nodeDef.extensions?.[this.name]) return null
    const extensionDef: EE_ecs = nodeDef.extensions[this.name]
    if (!parser.options.entity) throw Error('error loading ecs data')
    parseECSData(parser.options.entity, Object.entries(extensionDef.data))
    return null
  }
}
