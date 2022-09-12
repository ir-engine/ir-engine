import assert from 'assert'
import { Matrix4, Quaternion, Vector3 } from 'three'

import { quaternionEqualsEpsilon } from '../../tests/util/MathTestUtils'
import { V_000, V_010 } from '../common/constants/MathConstants'
import { Engine } from '../ecs/classes/Engine'
import { getComponent } from '../ecs/functions/ComponentFunctions'
import { createEntity } from '../ecs/functions/EntityFunctions'
import { createEngine } from '../initializeEngine'
import { spawnLocalAvatarInWorld } from '../networking/functions/receiveJoinWorld'
import { WorldNetworkAction } from '../networking/functions/WorldNetworkAction'
import { WorldNetworkActionReceptor } from '../networking/functions/WorldNetworkActionReceptor'
import { Physics } from '../physics/classes/Physics'
import { RigidBodyComponent } from '../physics/components/RigidBodyComponent'
import { setTransformComponent, TransformComponent } from '../transform/components/TransformComponent'
import { rotateBodyTowardsVector } from './AvatarControllerSystem'
import { AvatarControllerComponent } from './components/AvatarControllerComponent'
import { createAvatar } from './functions/createAvatar'

describe('AvatarControllerSystem', async () => {
  beforeEach(async () => {
    createEngine()
    await Physics.load()
    Engine.instance.currentWorld.physicsWorld = Physics.createWorld()
  })

  it('check rotateBodyTowardsVector', async () => {
    const world = Engine.instance.currentWorld

    const spawnAvatarAction = WorldNetworkAction.spawnAvatar({})
    WorldNetworkActionReceptor.receiveSpawnObject(spawnAvatarAction)
    const avatarEntity = createAvatar(spawnAvatarAction)
    const ridigbody = getComponent(avatarEntity, RigidBodyComponent)

    const testRotation = new Quaternion().copy(ridigbody.body.rotation() as Quaternion)
    const displace = new Vector3(1, 3, 1)
    const displaceXZ = new Vector3(displace.x, 0, displace.z)
    displaceXZ.applyQuaternion(new Quaternion().copy(testRotation).invert())
    const rotMatrix = new Matrix4().lookAt(displaceXZ, V_000, V_010)
    const targetOrientation = new Quaternion().setFromRotationMatrix(rotMatrix)
    testRotation.slerp(targetOrientation, Math.max(world.deltaSeconds * 2, 3 / 60))

    rotateBodyTowardsVector(avatarEntity, displace)

    assert(quaternionEqualsEpsilon(testRotation, ridigbody.body.rotation() as Quaternion))
  })
})
