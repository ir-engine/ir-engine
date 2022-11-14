import { EngineActions } from '@xrengine/engine/src/ecs/classes/EngineState'
import {
  Component,
  SerializedComponentType,
  updateComponent
} from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/functions/EntityTree'
import { dispatchAction } from '@xrengine/hyperflux'

import { EditorAction } from '../services/EditorServices'

/**
 * Updates each property specified in 'properties' on the component for each of the specified entity nodes
 * @param nodes
 * @param properties
 * @param component
 */
const modifyProperty = <C extends Component<any, any>>(
  nodes: EntityTreeNode[],
  component: C,
  properties: Partial<SerializedComponentType<C>>
) => {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if (typeof node === 'string') continue
    const entity = node.entity
    updateComponent(entity, component, properties)
  }

  /** @todo remove when all scene components migrated to reactor pattern */
  dispatchAction(
    EngineActions.sceneObjectUpdate({
      entities: nodes.filter((node) => typeof node !== 'string').map((node: EntityTreeNode) => node.entity)
    })
  )
  dispatchAction(EditorAction.sceneModified({ modified: true }))
}

export const EditorControlFunctions = {
  modifyProperty
}
