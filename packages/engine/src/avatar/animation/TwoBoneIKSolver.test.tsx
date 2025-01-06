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

import { createEngine, destroyEngine, EntityUUID, setComponent, SystemDefinitions, UUIDComponent } from '@ir-engine/ecs'
import { dispatchAction, startReactor } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { act, render } from '@testing-library/react'
import { assert } from 'console'
import React from 'react'
import { Vector3 } from 'three'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { overrideFileLoaderLoad } from '../../../tests/util/loadGLTFAssetNode'
import { mockAnimatedAvatar } from '../components/AnimationComponent.test'
import { AvatarIkComponent } from '../components/AvatarIKComponents'
import { AvatarNetworkAction } from '../state/AvatarNetworkActions'
import { AvatarIkReactor, AvatarIkSystem } from '../systems/AvatarIkSystem'

const default_url = 'packages/projects/default-project/assets'
const vrm = default_url + '/avatars/male_01.vrm'
describe('TwoBoneIKSolver', () => {
  describe('solveIK', () => {
    overrideFileLoaderLoad()

    beforeEach(() => {
      createEngine()
    })

    afterEach(() => {
      return destroyEngine()
    })

    it('should solve IK such that the hand is at the target position', async () => {
      const { rerender, unmount } = render(<></>)
      const avatarUuid = 'mock-avatar-uuid' as EntityUUID
      const entity = await mockAnimatedAvatar()
      setComponent(entity, UUIDComponent, avatarUuid)
      const ikComponent = setComponent(entity, AvatarIkComponent)
      startReactor(AvatarIkReactor)
      await act(async () => rerender(<></>))
      /**ensure the matrices are generated */
      assert(ikComponent.ikMatrices.rightHand.local && ikComponent.ikMatrices.rightHand.world)
      assert(ikComponent.ikMatrices.rightLowerArm.local && ikComponent.ikMatrices.rightLowerArm.world)
      assert(ikComponent.ikMatrices.rightUpperArm.local && ikComponent.ikMatrices.rightUpperArm.world)
      assert(ikComponent.ikMatrices.leftHand.local && ikComponent.ikMatrices.leftHand.world)
      assert(ikComponent.ikMatrices.leftLowerArm.local && ikComponent.ikMatrices.leftLowerArm.world)
      assert(ikComponent.ikMatrices.leftUpperArm.local && ikComponent.ikMatrices.leftUpperArm.world)
      assert(ikComponent.ikMatrices.rightFoot.local && ikComponent.ikMatrices.rightFoot.world)
      assert(ikComponent.ikMatrices.rightLowerLeg.local && ikComponent.ikMatrices.rightLowerLeg.world)
      assert(ikComponent.ikMatrices.rightUpperLeg.local && ikComponent.ikMatrices.rightUpperLeg.world)
      assert(ikComponent.ikMatrices.leftFoot.local && ikComponent.ikMatrices.leftFoot.world)
      assert(ikComponent.ikMatrices.leftLowerLeg.local && ikComponent.ikMatrices.leftLowerLeg.world)
      assert(ikComponent.ikMatrices.leftUpperLeg.local && ikComponent.ikMatrices.leftUpperLeg.world)

      /**now test the solve hits its target position */
      const rightHandUuid = (avatarUuid + '_rightHand') as EntityUUID
      dispatchAction(
        AvatarNetworkAction.spawnIKTarget({
          parentUUID: avatarUuid,
          entityUUID: rightHandUuid,
          name: 'rightHand',
          blendWeight: 1
        })
      )

      /**@todo ik system should NOT depend on a networked avatar */
      SystemDefinitions.get(AvatarIkSystem)?.execute()

      console.log(TransformComponent.getWorldPosition(entity, new Vector3()))

      console.log(ikComponent)
    })
  })
})
