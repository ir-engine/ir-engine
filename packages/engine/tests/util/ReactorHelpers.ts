import { act } from '@testing-library/react'

import { ReactorRoot } from '@etherealengine/hyperflux'

import { Entity } from '../../src/ecs/classes/Entity'
import { Component } from '../../src/ecs/functions/ComponentFunctions'

export const renderComponentReactor = (entity: Entity, component: Component<any, any>) => {
  const reactorRoot = component.reactorMap.get(entity) as ReactorRoot
  return act(() => reactorRoot.forceRender())
}
