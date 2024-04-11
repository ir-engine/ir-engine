import { Entity, createEntity, removeEntity, setComponent } from '@etherealengine/ecs'
import { State, useHookstate } from '@etherealengine/hyperflux'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { addObjectToGroup, removeObjectFromGroup } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { ObjectLayerMaskComponent } from '@etherealengine/spatial/src/renderer/components/ObjectLayerComponent'
import { setVisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayers } from '@etherealengine/spatial/src/renderer/constants/ObjectLayers'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { useEffect } from 'react'
import { Object3D } from 'three'

export function useHelperEntity<T extends Object3D, T2 extends State<Partial<{ name: string; entity: Entity }>>>(
  entity: Entity,
  helper: T,
  component: T2
): Entity {
  const helperEntityState = useHookstate<Entity>(createEntity())

  useEffect(() => {
    helper.name = `${component.name.value}-${entity}`
    const helperEntity = helperEntityState.value
    addObjectToGroup(helperEntity, helper)
    setComponent(helperEntity, NameComponent, helper.name)
    setComponent(helperEntity, EntityTreeComponent, { parentEntity: entity })
    setVisibleComponent(helperEntity, true)
    setComponent(helperEntity, ObjectLayerMaskComponent, ObjectLayers.NodeHelper)
    component.entity.set(helperEntity)

    return () => {
      removeObjectFromGroup(helperEntity, helper)
      removeEntity(helperEntity)
    }
  }, [])

  return helperEntityState.value
}
