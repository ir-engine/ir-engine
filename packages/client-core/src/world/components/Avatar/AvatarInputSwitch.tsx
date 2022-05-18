import { AvatarInputSchema } from '@xrengine/engine/src/avatar/AvatarInputSchema'
import { addComponent, hasComponent, removeComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import { InputComponent } from '@xrengine/engine/src/input/components/InputComponent'

import React, { useEffect } from 'react'

interface Props {
  enabled?: boolean
  joinedWorld?: boolean
}

export const AvatarInputSwitch = (props: Props) => {
  const enabled = props.enabled !== undefined ? props.enabled : true
  const joinedWorld = props.joinedWorld !== undefined ? props.joinedWorld : false

  useEffect(() => {
    if (!joinedWorld) return

    const world = useWorld()

    if (enabled) {
      if (!hasComponent(world.localClientEntity, InputComponent))
        addComponent(world.localClientEntity, InputComponent, {
          schema: AvatarInputSchema,
          data: new Map()
        })
    } else {
      removeComponent(world.localClientEntity, InputComponent)
    }
  }, [enabled, joinedWorld])

  return <></>
}

export default AvatarInputSwitch
