import { createMappedComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { ActionKey, ActionSets, ActionState, InputActionMapping } from '../controls/input-mappings'

export type InputComponentType = {
  mappings: Map<ActionSets, InputActionMapping>
  activeMapping: InputActionMapping
  actionState: ActionState
  defaultState: ActionState
  resetKeys: Set<ActionKey>
}

export const InputComponent = createMappedComponent<InputComponentType>('InputComponent')
