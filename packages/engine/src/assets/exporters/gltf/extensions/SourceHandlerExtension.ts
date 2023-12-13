import { Object3D } from 'three'
import { Entity } from '../../../../ecs/classes/Entity'
import { getComponent, setComponent } from '../../../../ecs/functions/ComponentFunctions'
import { EntityTreeComponent, iterateEntityNode } from '../../../../ecs/functions/EntityTree'
import { Object3DWithEntity } from '../../../../scene/components/GroupComponent'
import { SourceComponent } from '../../../../scene/components/SourceComponent'
import { getModelSceneID } from '../../../../scene/functions/loaders/ModelFunctions'
import { SceneID } from '../../../../schemas/projects/scene.schema'
import { GLTFExporterPlugin, GLTFWriter } from '../GLTFExporter'
import { ExporterExtension } from './ExporterExtension'

export default class SourceHandlerExtension extends ExporterExtension implements GLTFExporterPlugin {
  entitySet: { entity: Entity; parent: Entity }[]
  constructor(writer: GLTFWriter) {
    super(writer)
    this.name = 'EE_sourceHandler'
    this.entitySet = [] as { entity: Entity; parent: Entity }[]
  }

  beforeParse(input: Object3D | Object3D[]) {
    //we allow saving of any object that has a source equal to or parent of the root's source
    const validSrcs: Set<SceneID> = new Set()
    validSrcs.add(getModelSceneID(this.writer.options.srcEntity!))
    const root = (Array.isArray(input) ? input[0] : input) as Object3DWithEntity
    let walker: Entity | null = root.entity
    while (walker !== null) {
      const src = getComponent(walker, SourceComponent)
      if (src) validSrcs.add(src)
      walker = getComponent(walker, EntityTreeComponent)?.parentEntity ?? null
    }
    iterateEntityNode(
      root.entity,
      (entity) => {
        const entityTree = getComponent(entity, EntityTreeComponent)
        if (!entityTree || !entityTree.parentEntity) return
        this.entitySet.push({ entity, parent: entityTree.parentEntity })
        setComponent(entity, EntityTreeComponent, { parentEntity: null })
      },
      (entity) => {
        const src = getComponent(entity, SourceComponent)
        return src && !validSrcs.has(src)
      }
    )
  }

  afterParse(input: Object3D) {
    this.entitySet.forEach(({ entity, parent }) => {
      setComponent(entity, EntityTreeComponent, { parentEntity: parent })
    })
  }
}
