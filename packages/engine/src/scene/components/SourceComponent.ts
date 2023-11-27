import { createState, none } from '@etherealengine/hyperflux'
import { Entity } from '../../ecs/classes/Entity'
import { defineComponent } from '../../ecs/functions/ComponentFunctions'
import { SceneID } from '../../schemas/projects/scene.schema'

const entitiesBySource = {} as Record<SceneID, Entity[]>

export const SourceComponent = defineComponent({
  name: 'Source Component',
  onInit: (entity) => '' as SceneID,
  onSet: (entity, component, src: SceneID) => {
    if (typeof src !== 'string') throw new Error('SourceComponent expects a non-empty string')

    const currentSource = component.value

    if (currentSource !== '') {
      const currentEntities = SourceComponent.entitiesBySource[currentSource]
      const entities = currentEntities.filter((currentEntity) => currentEntity !== entity)
      if (entities.length === 0) {
        SourceComponent.entitiesBySourceState[currentSource].set(none)
      } else {
        SourceComponent.entitiesBySourceState[currentSource].set(entities)
      }
    }

    component.set(src)
    SourceComponent.valueMap[entity] = src

    const nuEntities = SourceComponent.entitiesBySource[src] ?? []
    SourceComponent.entitiesBySourceState[src].set([...nuEntities, entity])
  },

  entitiesBySourceState: createState(entitiesBySource),
  entitiesBySource: entitiesBySource as Readonly<typeof entitiesBySource>
})
