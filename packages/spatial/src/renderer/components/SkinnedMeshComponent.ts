/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  LineBasicMaterial,
  LineSegments,
  Matrix4,
  SkinnedMesh,
  Vector3
} from 'three'

import {
  createEntity,
  defineComponent,
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeEntity,
  S,
  setComponent,
  useComponent,
  useEntityContext,
  useOptionalComponent
} from '@ir-engine/ecs'
import { getMutableState, useHookstate } from '@ir-engine/hyperflux'
import { useEffect } from 'react'
import { NameComponent } from '../../common/NameComponent'
import { ComputedTransformComponent } from '../../transform/components/ComputedTransformComponent'
import { EntityTreeComponent } from '../../transform/components/EntityTree'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { ObjectLayers } from '../constants/ObjectLayers'
import { RendererState } from '../RendererState'
import { BoneComponent } from './BoneComponent'
import { addObjectToGroup } from './GroupComponent'
import { setObjectLayers } from './ObjectLayerComponent'
import { setVisibleComponent, VisibleComponent } from './VisibleComponent'

export const SkinnedMeshComponent = defineComponent({
  name: 'SkinnedMeshComponent',
  schema: S.Required(S.Type<SkinnedMesh>()),

  reactor: function () {
    const entity = useEntityContext()
    const component = useComponent(entity, SkinnedMeshComponent)
    const debugEnabled = useHookstate(getMutableState(RendererState).avatarDebug)
    const visible = useOptionalComponent(entity, VisibleComponent)

    useEffect(() => {
      if (!visible?.value || !debugEnabled.value) return

      const root = getComponent(entity, SkinnedMeshComponent)
      const bones = root.skeleton.bones //getBoneList(entity)

      const geometry = new BufferGeometry()

      const vertices = [] as number[]
      const colors = [] as number[]

      const color1 = new Color(0, 0, 1)
      const color2 = new Color(0, 1, 0)

      for (let i = 0; i < bones.length; i++) {
        const bone = bones[i]

        const boneParentEntity = getComponent(bone.entity, EntityTreeComponent).parentEntity
        const boneParentComponent = hasComponent(boneParentEntity, BoneComponent)

        if (boneParentComponent) {
          vertices.push(0, 0, 0)
          vertices.push(0, 0, 0)
          colors.push(color1.r, color1.g, color1.b)
          colors.push(color2.r, color2.g, color2.b)
        }
      }

      geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3))
      geometry.setAttribute('color', new Float32BufferAttribute(colors, 3))

      const material = new LineBasicMaterial({
        vertexColors: true,
        depthTest: false,
        depthWrite: false,
        toneMapped: false,
        transparent: true
      })

      const line = new LineSegments(geometry, material)

      line.frustumCulled = false
      line.name = `Skinned Mesh Helper For: ${entity}`

      const helperEntity = createEntity()
      setVisibleComponent(helperEntity, true)
      addObjectToGroup(helperEntity, line)
      setComponent(helperEntity, NameComponent, line.name)
      setObjectLayers(line, ObjectLayers.AvatarHelper)
      setComponent(helperEntity, EntityTreeComponent, { parentEntity: entity })

      setComponent(helperEntity, ComputedTransformComponent, {
        referenceEntities: [entity],
        computeFunction: () => {
          const position = geometry.getAttribute('position')

          _matrixWorldInv.copy(root.matrixWorld).invert()

          for (let i = 0, j = 0; i < bones.length; i++) {
            const bone = bones[i]

            const boneParentEntity = getComponent(bone.entity, EntityTreeComponent).parentEntity
            const boneParentComponent = getOptionalComponent(boneParentEntity, BoneComponent)

            if (boneParentComponent) {
              _boneMatrix.multiplyMatrices(_matrixWorldInv, bone.matrixWorld)
              _vector.setFromMatrixPosition(_boneMatrix)
              position.setXYZ(j, _vector.x, _vector.y, _vector.z)

              _boneMatrix.multiplyMatrices(
                _matrixWorldInv,
                getComponent(boneParentEntity, TransformComponent).matrixWorld
              )
              _vector.setFromMatrixPosition(_boneMatrix)
              position.setXYZ(j + 1, _vector.x, _vector.y, _vector.z)

              j += 2
            }
          }

          geometry.getAttribute('position').needsUpdate = true
        }
      })

      return () => {
        removeEntity(helperEntity)
        geometry.dispose()
        material.dispose()
      }
    }, [visible, debugEnabled, component.skeleton.value])

    return null
  }
})

const _vector = /*@__PURE__*/ new Vector3()
const _boneMatrix = /*@__PURE__*/ new Matrix4()
const _matrixWorldInv = /*@__PURE__*/ new Matrix4()
