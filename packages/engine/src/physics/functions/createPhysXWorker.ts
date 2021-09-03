import { PhysXInstance } from 'three-physx'
import { Engine } from '../../ecs/classes/Engine'
import Worker from 'web-worker'

export const createPhysXWorker = async () => {
  const worker = new Worker(new URL('./loadPhysX.js', import.meta.url), { type: 'module' })
  await PhysXInstance.instance.initPhysX(worker, Engine.initOptions.physics.settings)
  Engine.physxWorker = worker
  Engine.workers.push(Engine.physxWorker)
  return worker
}
