import _ from 'lodash'

import { loadDRACODecoderNode } from './assets/loaders/gltf/NodeDracoLoader'
import { Engine } from './ecs/classes/Engine'

/**
 * initializeNode
 *
 * initializes everything for the node context
 */
export const initializeNode = () => {
  loadDRACODecoderNode()
  Engine.instance.engineTimer.start()
}
