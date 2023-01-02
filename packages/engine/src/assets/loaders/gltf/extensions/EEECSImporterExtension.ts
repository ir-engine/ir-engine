import { Event, Object3D } from 'three'

import { Entity } from '../../../../ecs/classes/Entity'
import { addComponent } from '../../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../../ecs/functions/EntityFunctions'
import { NameComponent } from '../../../../scene/components/NameComponent'
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
    const containsECSData = !!extensionDef.data && Object.keys(extensionDef.data).some((k) => k.startsWith('xrengine.'))
    if (!containsECSData) return null
    const entity = createEntity()
    parseECSData(entity, Object.entries(extensionDef.data))
    return null
  }
}
