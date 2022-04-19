import { random } from 'lodash'
import { Quaternion, Vector3 } from 'three'

import { NetworkId } from '@xrengine/common/src/interfaces/NetworkId'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { dispatchAction } from '@xrengine/hyperflux'

import { defaultBonesData } from '../../avatar/DefaultSkeletonBones'
import { Engine } from '../../ecs/classes/Engine'
import { World } from '../../ecs/classes/World'
import { defineQuery } from '../../ecs/functions/ComponentFunctions'
import { NetworkWorldAction } from '../../networking/functions/NetworkWorldAction'

const logCustomTargetRigBones = (targetRig) => {
  if (targetRig.name !== 'custom') {
    return
  }

  console.log('check bones')
  defaultBonesData.forEach((boneData, index) => {
    const p = new Vector3(...boneData.position)
    const r = new Quaternion(...boneData.quaternion)
    const tbone = targetRig.tpose!.bones[index]
    console.log('    ', boneData.name, p.equals(tbone.bone.position), r.equals(tbone.bone.quaternion))
  })
  console.log('---------')
}

const avatars = ['Gold', 'Green', 'Pink', 'Red', 'Silver', 'Yellow']

const mockAvatars = () => {
  for (let i = 0; i < 100; i++) {
    const cyberbot = avatars[random(avatars.length)]
    const avatarDetail = {
      thumbnailURL: `/projects/default-project/avatars/Cyberbot${cyberbot}.png`,
      avatarURL: `/projects/default-project/avatars/Cyberbot${cyberbot}.glb`,
      avatarId: `Cyberbot${cyberbot}`
    }
    const userId = ('user' + i) as UserId
    const parameters = {
      position: new Vector3(0, 0, 0).random().setY(0).multiplyScalar(10),
      rotation: new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.random() * Math.PI * 2)
    }

    const networkId = (1000 + i) as NetworkId

    const world = Engine.currentWorld

    dispatchAction(world.store, {
      ...NetworkWorldAction.createClient({ name: 'user', index: networkId }),
      $from: userId
    })
    dispatchAction(world.store, {
      ...NetworkWorldAction.spawnAvatar({ parameters, prefab: 'avatar' }),
      networkId,
      $from: userId
    })
    dispatchAction(world.store, { ...NetworkWorldAction.avatarDetails({ avatarDetail }), $from: userId })
  }
}

export default async function SkeletonRigSystem(world: World) {
  // receiveActionOnce(Engine.store, EngineEvents.EVENTS.JOINED_WORLD, () => {
  //   mockAvatars()
  // })
  return () => {}
}
