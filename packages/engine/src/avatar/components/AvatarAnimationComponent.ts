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

import { VRM, VRMHumanBoneName, VRMHumanBones } from '@pixiv/three-vrm'
import { useEffect } from 'react'
import { AnimationAction, Group, Matrix4, SkeletonHelper } from 'three'

import {
  defineComponent,
  getComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { createEntity, entityExists, removeEntity, useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'
import { getMutableState, useHookstate } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { addObjectToGroup } from '@ir-engine/spatial/src/renderer/components/GroupComponent'
import { setObjectLayers } from '@ir-engine/spatial/src/renderer/components/ObjectLayerComponent'
import { setVisibleComponent, VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'
import { ComputedTransformComponent } from '@ir-engine/spatial/src/transform/components/ComputedTransformComponent'

import { UUIDComponent } from '@ir-engine/ecs'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { ModelComponent } from '../../scene/components/ModelComponent'
import { addError, removeError } from '../../scene/functions/ErrorFunctions'
import { preloadedAnimations } from '../animation/Util'
import { AnimationState } from '../AnimationManager'
import {
  retargetAvatarAnimations,
  setAvatarSpeedFromRootMotion,
  setupAvatarForUser,
  setupAvatarProportions
} from '../functions/avatarFunctions'
import { AvatarPendingComponent } from './AvatarPendingComponent'

export const AvatarAnimationComponent = defineComponent({
  name: 'AvatarAnimationComponent',

  schema: S.Object({
    animationGraph: S.Object({
      blendAnimation: S.Optional(S.Type<AnimationAction>()),
      fadingOut: S.Bool(false),
      blendStrength: S.Number(0),
      layer: S.Number(0)
    }),
    /** ratio between original and target skeleton's root.position.y */
    rootYRatio: S.Number(1),
    /** The input vector for 2D locomotion blending space */
    locomotion: S.Vec3(),
    /** Time since the last update */
    deltaAccumulator: S.Number(0),
    /** Tells us if we are suspended in midair */
    isGrounded: S.Bool(true)
  })
})

export type Matrices = { local: Matrix4; world: Matrix4 }
export const AvatarRigComponent = defineComponent({
  name: 'AvatarRigComponent',

  schema: S.Object({
    /** rig bones with quaternions relative to the raw bones in their bind pose */
    normalizedRig: S.Type<VRMHumanBones>(),
    /** contains the raw bone quaternions */
    rawRig: S.Type<VRMHumanBones>(),
    /** contains ik solve data */
    ikMatrices: S.Record(
      S.LiteralUnion(Object.values(VRMHumanBoneName)),
      S.Object({
        local: S.Mat4(),
        world: S.Mat4()
      }),
      {}
    ),
    /** The VRM model */
    vrm: S.Type<VRM>(),
    avatarURL: S.Nullable(S.String())
  }),

  reactor: function () {
    const entity = useEntityContext()
    const rendererState = useHookstate(getMutableState(RendererState))
    const areNodeHelpersVisible = rendererState.nodeHelperVisibility
    const isEntityHelperVisible = rendererState.selectedEntityUUIDs.value.has(getComponent(entity, UUIDComponent))
    const rigComponent = useComponent(entity, AvatarRigComponent)
    const pending = useOptionalComponent(entity, AvatarPendingComponent)
    const visible = useOptionalComponent(entity, VisibleComponent)
    const modelComponent = useOptionalComponent(entity, ModelComponent)
    const locomotionAnimationState = useHookstate(
      getMutableState(AnimationState).loadedAnimations[preloadedAnimations.locomotion]
    )

    useEffect(() => {
      if (
        !visible?.value ||
        !(areNodeHelpersVisible || isEntityHelperVisible) ||
        pending?.value ||
        !rigComponent.value.normalizedRig?.hips?.node
      )
        return

      const helper = new SkeletonHelper(rigComponent.value.vrm.scene as Group)
      helper.frustumCulled = false
      helper.name = `target-rig-helper-${entity}`

      const helperEntity = createEntity()
      setVisibleComponent(helperEntity, true)
      addObjectToGroup(helperEntity, helper)
      setComponent(helperEntity, NameComponent, helper.name)
      setObjectLayers(helper, ObjectLayers.AvatarHelper)

      setComponent(helperEntity, ComputedTransformComponent, {
        referenceEntities: [entity],
        computeFunction: () => {
          // this updates the bone helper lines
          helper.updateMatrixWorld(true)
        }
      })

      return () => {
        removeEntity(helperEntity)
      }
    }, [visible, isEntityHelperVisible, areNodeHelpersVisible, pending, rigComponent.normalizedRig])

    useEffect(() => {
      if (!modelComponent?.asset?.value) return
      const model = getComponent(entity, ModelComponent)
      setupAvatarProportions(entity, model.asset as VRM)
      setComponent(entity, AvatarRigComponent, {
        vrm: model.asset as VRM,
        avatarURL: model.src
      })
      return () => {
        if (!entityExists(entity)) return
        setComponent(entity, AvatarRigComponent, {
          vrm: null!,
          avatarURL: null
        })
      }
    }, [modelComponent?.asset])

    useEffect(() => {
      if (
        !rigComponent.value ||
        !rigComponent.value.vrm ||
        !rigComponent.value.avatarURL ||
        !locomotionAnimationState?.value
      )
        return
      const rig = getComponent(entity, AvatarRigComponent)
      try {
        setupAvatarForUser(entity, rig.vrm)
        retargetAvatarAnimations(entity)
      } catch (e) {
        console.error('Failed to load avatar', e)
        addError(entity, AvatarRigComponent, 'UNSUPPORTED_AVATAR')
        return () => {
          removeError(entity, AvatarRigComponent, 'UNSUPPORTED_AVATAR')
        }
      }
    }, [rigComponent.vrm])

    useEffect(() => {
      if (!locomotionAnimationState?.value) return
      setAvatarSpeedFromRootMotion()
    }, [locomotionAnimationState])

    return null
  },

  errors: ['UNSUPPORTED_AVATAR']
})
