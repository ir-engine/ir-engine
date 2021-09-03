import { PhysXInstance } from 'three-physx'
import { Engine } from '../../ecs/classes/Engine'
import Worker from 'web-worker'
import { isClient } from '../../common/functions/isClient'

export const createPhysXWorker = async () => {
  //@ts-ignore
  const worker = new Worker(new URL(isClient ? './loadPhysX.js' : './loadPhysXNode.js', import.meta.url), {
    type: 'module'
  })
  await PhysXInstance.instance.initPhysX(worker, Engine.initOptions.physics.settings)
  Engine.physxWorker = worker
  Engine.workers.push(Engine.physxWorker)
  return worker
}
