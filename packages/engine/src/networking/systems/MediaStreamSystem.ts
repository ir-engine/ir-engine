import { World } from '../../ecs/classes/World'

export default async function MediaStreamSystem(world: World) {
  let executeInProgress = false

  const execute = () => {
    const network = world.mediaNetwork
    if (!network) return

    if (network?.mediasoupOperationQueue.getBufferLength() > 0 && !executeInProgress) {
      executeInProgress = true
      const buffer = network.mediasoupOperationQueue.pop() as any
      if (buffer.object && buffer.object.closed !== true && buffer.object._closed !== true) {
        try {
          if (buffer.action === 'resume') buffer.object.resume()
          else if (buffer.action === 'pause') buffer.object.pause()
          executeInProgress = false
        } catch (err) {
          executeInProgress = false
          console.log('Pause or resume error')
          console.log(err)
          console.log(buffer.object)
        }
      } else {
        executeInProgress = false
      }
    }
  }

  const cleanup = async () => {}

  return { execute, cleanup }
}
