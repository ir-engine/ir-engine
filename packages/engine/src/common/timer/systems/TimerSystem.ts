import { defineQuery } from 'bitecs'
import { System } from '../../../ecs/classes/System'
import { getComponent } from '../../../ecs/functions/EntityFunctions'
import { TimerComponent } from '../components/timerComponent'

export const TimerSystem = async (): Promise<System> => {
  const timerQuery = defineQuery([TimerComponent])

  return (world) => {
    for (const eid of timerQuery(world)) {
      const { currentTimer, timer, callback } = getComponent(eid, TimerComponent)
      let ran: boolean = false

      if (currentTimer + world.ecsWorld.delta >= timer) {
        ran = true
        callback(world.ecsWorld.delta)
      }

      getComponent(eid, TimerComponent).currentTimer = ran ? 0 : currentTimer + world.ecsWorld.delta
    }
  }
}
