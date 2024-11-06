import { getComponent, getOptionalComponent, hasComponent } from '@ir-engine/ecs'
import { Object3D } from 'three'
import { EntityTreeComponent } from '../../transform/components/EntityTree'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { RendererComponent } from '../WebGLRendererSystem'
import { GroupComponent } from '../components/GroupComponent'
import { MeshComponent } from '../components/MeshComponent'
import { Object3DComponent } from '../components/Object3DComponent'

export const proxifyParentChildRelationships = (obj: Object3D) => {
  const objEntity = obj.entity
  Object.defineProperties(obj, {
    matrixWorld: {
      get() {
        return getComponent(objEntity, TransformComponent).matrixWorld
      },
      set(value) {
        if (value != undefined) throw new Error('Cannot set matrixWorld of proxified object')
        console.warn('Setting to nil value is not supported proxifyParentChildRelationships.ts')
      }
    },
    parent: {
      get() {
        if (RendererComponent.activeRender) return null // hack to check if renderer is rendering
        if (getOptionalComponent(objEntity, EntityTreeComponent)?.parentEntity) {
          const result = getOptionalComponent(
            getComponent(objEntity, EntityTreeComponent).parentEntity!,
            GroupComponent
          )?.[0]
          return result ?? null
        }
        return null
      },
      set(value) {
        if (value != undefined) throw new Error('Cannot set parent of proxified object')
        console.warn('Setting to nil value is not supported proxifyParentChildRelationships.ts')
      }
    },
    children: {
      get() {
        if (RendererComponent.activeRender) return [] // hack to check if renderer is rendering
        if (hasComponent(objEntity, EntityTreeComponent)) {
          const childEntities = getComponent(objEntity, EntityTreeComponent).children
          const result: Object3D[] = []
          for (const childEntity of childEntities) {
            if (hasComponent(childEntity, MeshComponent)) {
              result.push(getComponent(childEntity, MeshComponent))
            } else if (hasComponent(childEntity, Object3DComponent)) {
              result.push(getComponent(childEntity, Object3DComponent))
            }
          }
          return result
        } else {
          return []
        }
      },
      set(value) {
        if (value != undefined) throw new Error('Cannot set children of proxified object')
        console.warn('Setting to nil value is not supported proxifyParentChildRelationships.ts')
      }
    },
    isProxified: {
      value: true
    }
  })
}
