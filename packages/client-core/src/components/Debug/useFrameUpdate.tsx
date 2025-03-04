import { PresentationSystemGroup, useExecute } from '@ir-engine/ecs'
import { useForceUpdate } from '@ir-engine/hyperflux'
/**
 * WARNING - to be used for debug purposes only - will cause performance issues
 */
export const useFrameUpdate = () => {
  const force = useForceUpdate()
  useExecute(
    () => {
      force()
    },
    { after: PresentationSystemGroup }
  )
}
