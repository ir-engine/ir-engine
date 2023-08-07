import { useEffect } from 'react'

import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { execute } from '../../xrui/WidgetAppService'

const reactor = () => {
  useEffect(() => {
    return () => {}
  }, [])
  return null
}

export const NetworkSystem = defineSystem({
  uuid: 'ee.engine.NetworkSystem',
  execute,
  reactor
})
