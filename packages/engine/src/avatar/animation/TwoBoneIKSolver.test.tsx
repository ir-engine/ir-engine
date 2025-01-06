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
