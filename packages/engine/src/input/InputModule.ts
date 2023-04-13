import { InputSystemGroup, insertSystems } from '../ecs/functions/SystemFunctions'
import { ButtonInputSystem } from './systems/ButtonSystem'
import { ClientInputSystem } from './systems/ClientInputSystem'

export const InputSystems = () => {
  insertSystems([ClientInputSystem, ButtonInputSystem], 'with', InputSystemGroup)
}
