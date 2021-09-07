import { PhysXInstance } from 'three-physx'
import { Engine } from '../../ecs/classes/Engine'
import Worker from 'web-worker'
import { isClient } from '../../common/functions/isClient'

export const createPhysXWorker = async () => {
  let worker
  if (isClient) {
    // module workers currently don't work in safari and firefox
    // const { default: Worker } = await import('./loadPhysX?worker')
    //@ts-ignore
    worker = new Worker('/workers/loadPhysXClassic.js')
  } else {
    //@ts-ignore
    worker = new Worker(new URL('./loadPhysXNode.js', import.meta.url))
  }
  await PhysXInstance.instance.initPhysX(worker, Engine.initOptions.physics.settings)
  Engine.physxWorker = worker
  Engine.workers.push(Engine.physxWorker)
  return worker
}
