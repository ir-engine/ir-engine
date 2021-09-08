import { createMappedComponent } from '../../../ecs/functions/EntityFunctions'

type TimerComponentType = {
  currentTimer: number
  timer: number
  callback: (dt) => void
}

export const TimerComponent = createMappedComponent<TimerComponentType>()
