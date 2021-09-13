import { PhysXInstance } from 'three-physx'
import { Engine } from '../../ecs/classes/Engine'
import { isClient } from '../../common/functions/isClient'
import Worker from 'web-worker'

export const createPhysXWorker = async () => {
  console.log('createPhysXWorker')
  let worker
  if (isClient) {
    // module workers currently don't work in safari and firefox
    // const { default: Worker } = await import('./loadPhysX?worker')
    //@ts-ignore
    worker = new Worker('/workers/loadPhysXClassic.js')
  } else {
    console.log('NOT a client!')
    const path = await import('path')
    console.log('path import to use', path)
    console.log('__dirname', __dirname)
    //@ts-ignore
    console.log('resolved path', path.resolve(__dirname, './loadPhysXNode.js'))
    worker = new Worker(path.resolve(__dirname, './loadPhysXNode.js'))
    console.log('New worker', worker)
    // worker = new Worker(new URL('./loadPhysXNode.js', import.meta.url))
  }
  console.log('initPhysX', Engine.initOptions.physics.settings)
  await PhysXInstance.instance.initPhysX(worker, Engine.initOptions.physics.settings)
  console.log('PhysX inited!')
  Engine.physxWorker = worker
  Engine.workers.push(Engine.physxWorker)
  return worker
}
