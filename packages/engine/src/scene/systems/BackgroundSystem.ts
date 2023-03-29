import { useEffect } from 'react'

import { getMutableState, startReactor, useHookstate } from '@etherealengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { SceneState } from '../../ecs/classes/Scene'
import { XRState } from '../../xr/XRState'

export default async function BackgroundSystem() {
  const reactor = startReactor(() => {
    const background = useHookstate(getMutableState(SceneState).background)
    const sessionMode = useHookstate(getMutableState(XRState).sessionMode)

    useEffect(() => {
      Engine.instance.scene.background = sessionMode.value === 'immersive-ar' ? null : background.value
    }, [background, sessionMode])

    return null
  })

  const execute = () => {}

  const cleanup = async () => {
    await reactor.stop
  }

  return { execute, cleanup }
}
