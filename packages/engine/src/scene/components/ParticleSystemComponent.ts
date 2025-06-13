/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and
provide for limited attribution for the Original Developer. In addition,
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { useEffect } from 'react'
import { Blending, DoubleSide, Matrix4, MeshBasicMaterial, Object3D, Vector3 } from 'three'
import { BatchedRenderer, Behavior, BehaviorFromJSON, ParticleSystem } from 'three.quarks'

import {
  Entity,
  EntityTreeComponent,
  UUIDComponent,
  createEntity,
  getAncestorWithComponents,
  getChildrenWithComponents,
  removeEntity,
  useEntityContext
} from '@ir-engine/ecs'
import {
  defineComponent,
  entityExists,
  getComponent,
  removeComponent,
  setComponent,
  useComponent,
  useHasComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { AssetType } from '@ir-engine/engine/src/assets/constants/AssetType'
import { NO_PROXY, getMutableState, none, useHookstate } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { Vector3_One } from '@ir-engine/spatial/src/common/constants/MathConstants'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { getRendererEntity, useRendererEntity } from '@ir-engine/spatial/src/renderer/functions/useRendererEntity'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { AssetLoader } from '../../assets/classes/AssetLoader'
import { useGLTFComponent, useTexture } from '../../assets/functions/resourceLoaderHooks'
import {
  BehaviorJSON,
  DEFAULT_PARTICLE_SYSTEM_PARAMETERS,
  ExpandedSystemJSON,
  ParticleState,
  ParticleSystemMetadata,
  ParticleSystemRendererInstance
} from '../types/ParticleSystemTypes'
import { mergeGeometries } from '../util/meshUtils'

const createBatchedRenderer = (entity: Entity) => {
  const rendererEntity = getRendererEntity(entity)
  const particleState = getMutableState(ParticleState)
  if (particleState.renderers.value[rendererEntity]) {
    const instance = particleState.renderers[rendererEntity].get(NO_PROXY) as ParticleSystemRendererInstance
    instance.instanceCount++
    return instance
  } else {
    const renderer = new BatchedRenderer()
    const particleRendererEntity = createEntity()
    setComponent(particleRendererEntity, VisibleComponent)
    setComponent(particleRendererEntity, NameComponent, 'Particle Renderer')
    const sceneEntity = getAncestorWithComponents(entity, [SceneComponent])
    const uuidComponent = getComponent(sceneEntity, UUIDComponent)

    setComponent(particleRendererEntity, UUIDComponent, {
      entitySourceID: uuidComponent.entitySourceID,
      entityID: UUIDComponent.generateUUID()
    })

    setComponent(particleRendererEntity, EntityTreeComponent, { parentEntity: sceneEntity })
    renderer.preserveChildren = true
    renderer.parent = {
      type: 'Scene',
      matrix: new Matrix4().identity(),
      matrixWorld: new Matrix4().identity(),
      remove: () => {},
      removeFromParent: () => {}
    } as Object3D
    renderer.matrixWorld = new Matrix4().identity()
    setComponent(particleRendererEntity, ObjectComponent, renderer)
    const instance: ParticleSystemRendererInstance = {
      renderer,
      rendererEntity: particleRendererEntity,
      instanceCount: 1
    }
    particleState.renderers[rendererEntity].set(instance)
    return instance
  }
}

const removeBatchedRenderer = (rendererEntity: Entity) => {
  const particleState = getMutableState(ParticleState)
  if (particleState.renderers[rendererEntity].value) {
    const instance = particleState.renderers[rendererEntity].get(NO_PROXY) as ParticleSystemRendererInstance
    if (instance.instanceCount <= 1) {
      removeComponent(instance.rendererEntity, ObjectComponent)
      for (const batch of instance.renderer.batches) {
        batch.geometry.dispose()
        batch.dispose()
      }
      removeEntity(instance.rendererEntity)
      particleState.renderers[rendererEntity].set(none)
    } else {
      instance.instanceCount--
    }
  }
}

export const ParticleSystemComponent = defineComponent({
  name: 'ParticleSystemComponent',
  jsonID: 'EE_particle_system',

  schema: S.Object({
    systemParameters: DEFAULT_PARTICLE_SYSTEM_PARAMETERS,
    behaviorParameters: S.Array(S.Type<BehaviorJSON>()),
    behaviors: S.Optional(S.Array(S.Type<Behavior>()), { serialized: false }),
    system: S.Type<ParticleSystem>({ serialized: false } as any)
  }),

  onSet: (entity, component, json) => {
    !!json?.systemParameters &&
      component.systemParameters.set({
        ...JSON.parse(JSON.stringify(component.systemParameters.value)),
        ...json.systemParameters
      })

    !!json?.behaviorParameters && component.behaviorParameters.set(JSON.parse(JSON.stringify(json.behaviorParameters)))
  },

  toJSON: (component) => ({
    systemParameters: JSON.parse(JSON.stringify(component.systemParameters)),
    behaviorParameters: JSON.parse(JSON.stringify(component.behaviorParameters))
  }),

  reactor: function () {
    const entity = useEntityContext()
    const componentState = useComponent(entity, ParticleSystemComponent)
    const metadata = useHookstate({ textures: {}, geometries: {}, materials: {} } as ParticleSystemMetadata)

    // for particle meshes
    const geoDependencyEntity = useGLTFComponent(componentState.value.systemParameters.instancingGeometry, entity)

    /** @todo track this in resource manager */
    const dudMaterial = useHookstate(
      () =>
        new MeshBasicMaterial({
          color: 0xff0000,
          transparent: componentState.value.systemParameters.transparent ?? true,
          blending: componentState.value.systemParameters.blending as Blending,
          side: DoubleSide
        })
    ).value as MeshBasicMaterial

    useEffect(() => {
      // add dud material
      componentState.systemParameters.material.set('dud')
      metadata.materials.nested('dud').set(dudMaterial)
    }, [])

    // for particle meshes
    useEffect(() => {
      if (!geoDependencyEntity) return
      const meshEntity = getChildrenWithComponents(geoDependencyEntity, [MeshComponent])[0]
      if (!meshEntity) return

      const mesh = getComponent(meshEntity, MeshComponent)
      const scaledGeometry = mesh.geometry.clone()
      const scale = getNestedScale(mesh)
      scaledGeometry.scale(scale.x, scale.y, scale.z)
      if (scaledGeometry) {
        metadata.geometries.nested(componentState.value.systemParameters.instancingGeometry).set(scaledGeometry)

        return () => {
          metadata.geometries.nested(componentState.value.systemParameters.instancingGeometry).set(none)
        }
      }
    }, [geoDependencyEntity])

    // for mesh shape emitters
    const shapeMeshEntity = useGLTFComponent(componentState.value.systemParameters.shape.mesh ?? '', entity)

    // for mesh shape emitters
    useEffect(() => {
      if (!shapeMeshEntity) return
      const meshEntities = getChildrenWithComponents(shapeMeshEntity, [MeshComponent])
      if (!meshEntities.length) return

      const meshes = meshEntities.map((entity) => getComponent(entity, MeshComponent))

      const geometries = meshes.map((mesh) => {
        const scaledGeometry = mesh.geometry.clone()
        const scale = getNestedScale(mesh)
        scaledGeometry.scale(scale.x, scale.y, scale.z)
        return scaledGeometry
      })
      const mergedGeometry = mergeGeometries(geometries)

      if (mergedGeometry) {
        componentState.systemParameters.shape.geometry.set(componentState.value.systemParameters.shape.mesh!)
        metadata.geometries.nested(componentState.value.systemParameters.shape.mesh!).set(mergedGeometry)

        return () => {
          if (componentState.value.systemParameters.shape.mesh) {
            metadata.geometries.nested(componentState.value.systemParameters.shape.mesh!).set(none)
          }
        }
      }
    }, [shapeMeshEntity])

    const [texture] = useTexture(componentState.value.systemParameters.texture!, entity, (url) => {
      if (!entityExists(entity)) return
      metadata.textures.nested(url).set(none)
      dudMaterial.map = null
    })

    useEffect(() => {
      if (!texture) return
      metadata.textures.nested(componentState.value.systemParameters.texture!).set(texture)
      dudMaterial.map = texture
      dudMaterial.needsUpdate = true
    }, [texture])

    const doLoadEmissionGeo =
      componentState.systemParameters.shape.type.value === 'mesh_surface' &&
      AssetLoader.getAssetClass(componentState.systemParameters.shape.mesh.value ?? '') === AssetType.Model

    const doLoadInstancingGeo =
      componentState.systemParameters.instancingGeometry.value &&
      AssetLoader.getAssetClass(componentState.systemParameters.instancingGeometry.value) === AssetType.Model

    const doLoadTexture =
      componentState.systemParameters.texture.value &&
      AssetLoader.getAssetClass(componentState.systemParameters.texture.value) === AssetType.Image

    const loadedEmissionGeo = !!shapeMeshEntity || !doLoadEmissionGeo
    const loadedInstanceGeo = !!geoDependencyEntity || !doLoadInstancingGeo
    const loadedTexture = !!texture || !doLoadTexture

    const dependenciesLoaded = loadedEmissionGeo && loadedInstanceGeo && loadedTexture

    const rendererEntity = useRendererEntity(entity)
    const visible = useHasComponent(entity, VisibleComponent)

    useEffect(() => {
      if (!dependenciesLoaded || !rendererEntity || !visible) return

      const component = componentState.get(NO_PROXY)
      const rendererInstance = createBatchedRenderer(entity)
      const renderer = rendererInstance.renderer

      const systemParameters = JSON.parse(JSON.stringify(component.systemParameters)) as ExpandedSystemJSON
      const system = ParticleSystem.fromJSON(systemParameters, metadata.value as ParticleSystemMetadata, {})
      renderer.addSystem(system)
      const behaviors = component.behaviorParameters.map((behaviorJSON) => {
        const behavior = BehaviorFromJSON(behaviorJSON, system)!
        system.addBehavior(behavior)
        return behavior
      })
      componentState.behaviors.set(behaviors)

      const emitterAsObj3D = system.emitter
      emitterAsObj3D.parent = renderer
      setComponent(entity, EntityTreeComponent, { parentEntity: renderer.entity })
      setComponent(entity, ObjectComponent, emitterAsObj3D)
      // quarks expects the parent property on the emitter object to be the renderer, otherwise it will dispose the emitter
      Object.defineProperties(emitterAsObj3D, {
        parent: {
          get() {
            return renderer
          },
          set(value) {
            if (value != undefined) throw new Error('Cannot set parent of proxified object')
            console.warn('Setting to nil value is not supported ObjectComponent.ts')
          }
        }
      })
      const transformComponent = getComponent(entity, TransformComponent)
      emitterAsObj3D.matrix = transformComponent.matrix
      componentState.system.set(system)

      return () => {
        const index = renderer.systemToBatchIndex.get(system)
        if (typeof index !== 'undefined') {
          renderer.deleteSystem(system)
          renderer.children.splice(index, 1)
          const [batch] = renderer.batches.splice(index, 1)
          batch.dispose()
          renderer.systemToBatchIndex.clear()
          for (let i = 0; i < renderer.batches.length; i++) {
            for (const system of renderer.batches[i].systems) {
              renderer.systemToBatchIndex.set(system, i)
            }
          }
        }
        removeComponent(entity, ObjectComponent)
        if (entityExists(entity)) setComponent(entity, ObjectComponent, new Object3D())

        system.dispose()
        emitterAsObj3D.dispose()
        removeBatchedRenderer(rendererEntity!)
      }
    }, [
      componentState.systemParameters,
      componentState.behaviorParameters,
      dependenciesLoaded,
      rendererEntity,
      visible
    ])

    return null
  }
})

function getNestedScale(node: Object3D): Vector3 {
  const scale = node.scale?.clone() ?? Vector3_One

  if (node.parent) {
    scale.multiply(getNestedScale(node.parent))
  }

  return scale
}
