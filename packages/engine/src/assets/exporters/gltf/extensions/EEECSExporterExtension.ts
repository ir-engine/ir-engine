import { Event, Object3D } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { ComponentMap, getComponent, hasComponent } from '../../../../ecs/functions/ComponentFunctions'
import { ColliderComponent } from '../../../../scene/components/ColliderComponent'
import { GLTFLoadedComponent } from '../../../../scene/components/GLTFLoadedComponent'
import { Object3DWithEntity } from '../../../../scene/components/GroupComponent'
import { NameComponent } from '../../../../scene/components/NameComponent'
import { EE_ecs } from '../../../loaders/gltf/extensions/EEECSImporterExtension'
import { GLTFExporterPlugin } from '../GLTFExporter'
import { ExporterExtension } from './ExporterExtension'

export class EEECSExporterExtension extends ExporterExtension implements GLTFExporterPlugin {
  name = 'EE_ecs'

  writeNode(object: Object3DWithEntity, nodeDef: { [key: string]: any }) {
    if (!object.entity) return
    const entity = object.entity
    if (!hasComponent(entity, GLTFLoadedComponent)) return
    const gltfLoaded = getComponent(entity, GLTFLoadedComponent)
    const data = new Array<[string, any]>()
    for (const field of gltfLoaded) {
      switch (field) {
        case 'entity':
          const name = getComponent(entity, NameComponent)
          data.push(['xrengine.entity', name])
          break
        default:
          const component = ComponentMap.has(field)
      }
    }
  }
}
