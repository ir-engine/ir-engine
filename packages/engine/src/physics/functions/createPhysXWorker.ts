import { PhysXInstance } from '../../physics/physx'
import { Engine } from '../../ecs/classes/Engine'

export const createPhysXWorker = async () => {
  await PhysXInstance.instance.initPhysX(Engine.initOptions.physics.settings)
}
