import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { IKRigComponent, IKRigTargetComponent } from '../components/IKRigComponent'
import { IKPoseComponent } from '../components/IKPoseComponent'
import { applyIKPoseToIKRig, computeIKPose } from '../functions/IKFunctions'

import { World } from '../../ecs/classes/World'
import { System } from '../../ecs/classes/System'
import { bonesData2 } from '../../avatar/DefaultSkeletonBones'
import { Quaternion, Vector3 } from 'three'
import { dispatchLocal } from '../../networking/functions/dispatchFrom'
import { NetworkWorldAction } from '../../networking/functions/NetworkWorldAction'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'
import { random } from 'lodash'
import { CameraIKComponent } from '../components/CameraIKComponent'
import { applyCameraLook } from '../functions/IKSolvers'

const logCustomTargetRigBones = (targetRig) => {
  if (targetRig.name !== 'custom') {
    return
  }

  console.log('check bones')
  bonesData2.forEach((boneData, index) => {
    const p = new Vector3(...boneData.position)
    const r = new Quaternion(...boneData.quaternion)
    const s = new Vector3(...boneData.scale)
    const tbone = targetRig.tpose!.bones[index]
    console.log(
      '    ',
      boneData.name,
      p.equals(tbone.bone.position),
      r.equals(tbone.bone.quaternion),
      s.equals(tbone.bone.scale)
    )
  })
  console.log('---------')
}

const avatars = ['Gold', 'Green', 'Pink', 'Red', 'Silver', 'Yellow']

const mockAvatars = () => {
  for (let i = 0; i < 50; i++) {
    const cyberbot = avatars[random(avatars.length)]
    const avatarDetail = {
      thumbnailURL: `/projects/default-project/avatars/Cyberbot${cyberbot}.png`,
      avatarURL: `/projects/default-project/avatars/Cyberbot${cyberbot}.glb`,
      avatarId: `Cyberbot${cyberbot}`
    } as any
    const userId = ('user' + i) as UserId
    const parameters = {
      position: new Vector3(0, 0, 0).random().setY(0).multiplyScalar(10),
      rotation: new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.random() * Math.PI * 2)
    }

    const networkId = (1000 + i) as NetworkId

    dispatchLocal(NetworkWorldAction.createClient({ userId, name: 'user', avatarDetail }) as any)
    dispatchLocal({ ...NetworkWorldAction.spawnAvatar({ userId, parameters }), networkId } as any)
  }
}

export default async function SkeletonRigSystem(world: World): Promise<System> {
  const cameraIKQuery = defineQuery([IKRigComponent, CameraIKComponent])
  const ikposeQuery = defineQuery([IKPoseComponent, IKRigComponent, IKRigTargetComponent])
  // mockAvatars()
  return () => {
    // Apply camera IK to the source skeleton
    for (const entity of cameraIKQuery()) {
      const rig = getComponent(entity, IKRigComponent)
      const cameraSolver = getComponent(entity, CameraIKComponent)
      applyCameraLook(rig, cameraSolver)
    }

    for (const entity of ikposeQuery()) {
      const ikPose = getComponent(entity, IKPoseComponent)
      const rig = getComponent(entity, IKRigComponent)
      const targetRig = getComponent(entity, IKRigTargetComponent)

      // logCustomTargetRigBones(targetRig)
      computeIKPose(rig, ikPose)
      applyIKPoseToIKRig(targetRig, ikPose)
    }
  }
}
