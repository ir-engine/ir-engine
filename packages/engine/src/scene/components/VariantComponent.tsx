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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { useEffect } from 'react'

import { Entity, EntityUUID, Static, UUIDComponent } from '@ir-engine/ecs'
import {
  defineComponent,
  getComponent,
  getMutableComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { createEntity, removeEntity, useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { useHookstate } from '@ir-engine/hyperflux'
import { removeCallback, setCallback } from '@ir-engine/spatial/src/common/CallbackComponent'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { addOBCPlugin } from '@ir-engine/spatial/src/common/functions/OnBeforeCompilePlugin'
import { isMobile } from '@ir-engine/spatial/src/common/functions/isMobile'
import { addObjectToGroup, removeObjectFromGroup } from '@ir-engine/spatial/src/renderer/components/GroupComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { DistanceFromCameraComponent } from '@ir-engine/spatial/src/transform/components/DistanceComponents'
import { EntityTreeComponent, useChildrenWithComponents } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { isMobileXRHeadset } from '@ir-engine/spatial/src/xr/XRState'
import React from 'react'
import { InstancedMesh, Material } from 'three'
import { GLTFComponent } from '../../gltf/GLTFComponent'
import { InstancingComponent } from './InstancingComponent'

export type VariantLevel = {
  src: string
  metadata: Record<string, any>
}

export enum Heuristic {
  DISTANCE = 'DISTANCE',
  MANUAL = 'MANUAL',
  DEVICE = 'DEVICE'
}

export enum Devices {
  DESKTOP = 'DESKTOP',
  MOBILE = 'MOBILE',
  XR = 'XR'
}

const distanceMetadataSchema = S.Object({
  minDistance: S.Optional(S.Number()),
  maxDistance: S.Optional(S.Number())
})

const deviceMetadataSchema = S.Object({
  device: S.Optional(S.Enum(Devices))
})

export type VariantMetadata = Static<typeof distanceMetadataSchema> | Static<typeof deviceMetadataSchema>

export const VariantComponent = defineComponent({
  name: 'EE_variant',
  jsonID: 'EE_variant',

  schema: S.Object({
    levels: S.Array(
      S.Object({
        src: S.String(),
        metadata: S.Union([distanceMetadataSchema, deviceMetadataSchema])
      })
    ),
    heuristic: S.Enum(Heuristic, Heuristic.MANUAL),
    currentLevel: S.NonSerialized(S.Number(0))
  }),

  setDistanceLevel: (entity: Entity) => {
    const variantComponent = getComponent(entity, VariantComponent)
    if (variantComponent.heuristic !== Heuristic.DISTANCE) return
    const distance = DistanceFromCameraComponent.squaredDistance[entity]
    for (let i = 0; i < variantComponent.levels.length; i++) {
      const level = variantComponent.levels[i]
      if ([level.metadata['minDistance'], level.metadata['maxDistance']].includes(undefined)) continue
      const minDistance = Math.pow(level.metadata['minDistance'], 2)
      const maxDistance = Math.pow(level.metadata['maxDistance'], 2)
      if (minDistance <= distance && distance <= maxDistance) {
        getMutableComponent(entity, VariantComponent).currentLevel.set(i)
        break
      }
    }
  },

  reactor: () => {
    const entity = useEntityContext()
    const variantComponent = useComponent(entity, VariantComponent)

    const instancingComponent = useOptionalComponent(entity, InstancingComponent)

    useEffect(() => {
      if (!variantComponent.levels.length) return

      const heuristic = variantComponent.heuristic.value
      if (heuristic === Heuristic.DEVICE) {
        const targetDevice = isMobile || isMobileXRHeadset ? Devices.MOBILE : Devices.DESKTOP
        const levelIndex = variantComponent.levels.value.findIndex((level) => level.metadata['device'] === targetDevice)
        if (levelIndex < 0) {
          console.warn('VariantComponent: No asset found for target device')
          return
        }
        variantComponent.currentLevel.set(levelIndex)
      } else if (heuristic === Heuristic.DISTANCE) {
        setComponent(entity, DistanceFromCameraComponent)
        VariantComponent.setDistanceLevel(entity)
      }
    }, [variantComponent.heuristic.value, variantComponent.levels])

    useEffect(() => {
      if (!variantComponent.levels.length || instancingComponent) return

      const currentLevel = variantComponent.currentLevel.value
      const src = variantComponent.levels[currentLevel].src.value
      if (!src) return

      setComponent(entity, GLTFComponent, { src: src })
    }, [instancingComponent, variantComponent.currentLevel, variantComponent.levels])

    useEffect(() => {
      const levels = variantComponent.levels.length
      for (let level = 0; level < levels; level++) {
        setCallback(entity, `variantLevel${level}`, () => {
          variantComponent.currentLevel.set(level)
        })
      }
      return () => {
        for (let level = 0; level < levels; level++) {
          removeCallback(entity, `variantLevel${level}`)
        }
      }
    }, [variantComponent.levels.length])

    if (!instancingComponent) return null

    return <InstancingVariantReactor entity={entity} />
  }
})

const InstancingVariantReactor = (props: { entity: Entity }) => {
  const variantComponent = useComponent(props.entity, VariantComponent)

  return (
    <>
      {variantComponent.levels.map((level, index) => (
        <VariantInstanceLoadReactor entity={props.entity} level={index} key={index} />
      ))}
    </>
  )
}

const VariantInstanceLoadReactor = (props: { entity: Entity; level: number }) => {
  const variantComponent = useComponent(props.entity, VariantComponent)

  const level = variantComponent.levels[props.level].value

  const modelEntity = useHookstate(() => {
    const entity = createEntity()
    setComponent(
      entity,
      UUIDComponent,
      (getComponent(props.entity, UUIDComponent) + '-LOD-' + props.level) as EntityUUID
    )
    setComponent(entity, NameComponent, getComponent(props.entity, NameComponent) + ' LOD ' + props.level)
    setComponent(entity, TransformComponent)
    setComponent(entity, EntityTreeComponent, { parentEntity: props.entity })
    setComponent(entity, VisibleComponent)
    setComponent(entity, GLTFComponent, { src: level.src })
    return entity
  }).value

  useEffect(() => {
    return () => {
      removeEntity(modelEntity)
    }
  }, [])

  const childMeshEntities = useChildrenWithComponents(modelEntity, [MeshComponent])

  return (
    <>
      {childMeshEntities.map((meshEntity) => (
        <ChildMeshReactor
          variantEntity={props.entity}
          modelEntity={modelEntity}
          meshEntity={meshEntity}
          level={props.level}
          key={meshEntity}
        />
      ))}
    </>
  )
}

const ChildMeshReactor = (props: { variantEntity: Entity; modelEntity: Entity; meshEntity: Entity; level: number }) => {
  useEffect(() => {
    const level = getComponent(props.variantEntity, VariantComponent).levels[props.level]

    const minDistance = level.metadata['minDistance']
    const maxDistance = level.metadata['maxDistance']
    const mesh = getComponent(props.meshEntity, MeshComponent)

    // debug
    // mesh.material = new MeshStandardMaterial({
    //   color: props.level === 0 ? 0xff0000 : props.level === 1 ? 0x00ff00 : 0x0000ff
    // })

    const instancingComponent = getComponent(props.variantEntity, InstancingComponent)

    //convert to instanced mesh, using existing instance matrix
    const instancedMesh =
      mesh instanceof InstancedMesh
        ? mesh
        : new InstancedMesh(mesh.geometry, mesh.material, instancingComponent.instanceMatrix.count)
    instancedMesh.instanceMatrix = instancingComponent.instanceMatrix
    instancedMesh.frustumCulled = false

    //add distance culling shader plugin
    const materials: Material[] = Array.isArray(instancedMesh.material)
      ? instancedMesh.material
      : [instancedMesh.material]
    for (const material of materials) {
      addOBCPlugin(material, {
        id: 'lod-culling',
        priority: 1,
        compile: (shader, renderer) => {
          shader.fragmentShader = shader.fragmentShader.replace(
            'uniform float opacity;',
            `uniform float opacity;
uniform float maxDistance;
uniform float minDistance;`
          )

          // Calculate the camera distance from the geometry
          // Discard fragments outside the minDistance and maxDistance range
          shader.fragmentShader = shader.fragmentShader.replace(
            'void main() {',
            `void main() {
  float cameraDistance = length(vViewPosition);
  if (cameraDistance <= minDistance || cameraDistance >= maxDistance) {
    discard;
  }`
          )
          material.shader.uniforms.minDistance = { value: minDistance }
          material.shader.uniforms.maxDistance = { value: maxDistance }
        }
      })
    }

    /** @todo rather than this, update the mesh component */
    removeObjectFromGroup(props.meshEntity, mesh)
    addObjectToGroup(props.meshEntity, instancedMesh)
  }, [])

  const level = useComponent(props.variantEntity, VariantComponent).levels[props.level].value

  useEffect(() => {
    const mesh = getComponent(props.meshEntity, MeshComponent)
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]

    for (const material of materials) {
      if (!material.shader) continue
      material.shader.uniforms.minDistance.value = level.metadata['minDistance']
    }
  }, [level.metadata['minDistance']])

  useEffect(() => {
    const mesh = getComponent(props.meshEntity, MeshComponent)
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]

    for (const material of materials) {
      if (!material.shader) continue
      material.shader.uniforms.maxDistance.value = level.metadata['maxDistance']
    }
  }, [level.metadata['minDistance']])

  return null
}
