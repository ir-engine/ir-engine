import { World } from '../classes/World'
import { System } from '../classes/System'
import { InjectionPoint } from './SystemFunctions'

/**
 * @author Josh Field <github.com/hexafield>
 * @author Gheric Speiginer <github.com/speigg>
 */
export default async function InjectedPipelineSystem(
  world: World,
  args: { injectionPoint: keyof typeof InjectionPoint }
): Promise<System> {
  return () => {
    for (const system of world.injectedSystems[args.injectionPoint]) {
      system()
    }
  }
}
