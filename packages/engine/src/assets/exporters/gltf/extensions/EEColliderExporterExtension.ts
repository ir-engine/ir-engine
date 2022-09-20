import { Event, Object3D } from 'three'

import { getComponent, hasComponent } from '../../../../ecs/functions/ComponentFunctions'
import { ColliderComponent } from '../../../../scene/components/ColliderComponent'
import { Object3DWithEntity } from '../../../../scene/components/GroupComponent'
import { GLTFExporterPlugin, GLTFWriter } from '../GLTFExporter'
import { ExporterExtension } from './ExporterExtension'

export default class EEColliderExporterExtension extends ExporterExtension implements GLTFExporterPlugin {
  constructor(writer: GLTFWriter) {
    super(writer)
    this.name = 'EE_collider'
  }

  beforeParse(input: Object3D<Event> | Object3D<Event>[]) {}

  writeNode(node: Object3DWithEntity, nodeDef) {
    if (!node || !node.isObject3D || !node.entity || !hasComponent(node.entity, ColliderComponent)) return
    const writer = this.writer
    const collider = getComponent(node.entity, ColliderComponent)
    // const groupedColliders = getComponent(node.entity, GroupColliderComponent)
    // groupedColliders
  }
}
