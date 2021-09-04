import { PhysXInstance } from 'three-physx'
import { Engine } from '../../ecs/classes/Engine'
import Worker from 'web-worker'
import { isClient } from '../../common/functions/isClient'

export const createPhysXWorker = async () => {
  let worker
  if (isClient) {
    //@ts-ignore
    const { default: Worker } = await import('./loadPhysX?worker')
    worker = new Worker()
  } else {
    //@ts-ignore
    worker = new Worker(new URL('./loadPhysXNode.js', import.meta.url), { type: 'module' })
  }
  await PhysXInstance.instance.initPhysX(worker, Engine.initOptions.physics.settings)
  Engine.physxWorker = worker
  Engine.workers.push(Engine.physxWorker)
  return worker
}
