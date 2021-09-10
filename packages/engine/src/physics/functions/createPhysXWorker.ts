import { PhysXInstance } from 'three-physx'
import { Engine } from '../../ecs/classes/Engine'
import { isClient } from '../../common/functions/isClient'
import Worker from 'web-worker'

export const createPhysXWorker = async () => {
  let worker
  if (isClient) {
    // module workers currently don't work in safari and firefox
    // const { default: Worker } = await import('./loadPhysX?worker')
    //@ts-ignore
    worker = new Worker('/workers/loadPhysXClassic.js')
  } else {
    const path = await import('path')
    //@ts-ignore
    worker = new Worker(path.resolve(__dirname, './loadPhysXNode.js'))
    // worker = new Worker(new URL('./loadPhysXNode.js', import.meta.url))
  }
  await PhysXInstance.instance.initPhysX(worker, Engine.initOptions.physics.settings)
  Engine.physxWorker = worker
  Engine.workers.push(Engine.physxWorker)
  return worker
}
