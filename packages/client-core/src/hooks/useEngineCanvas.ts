/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { getComponent } from '@ir-engine/ecs'
import { getState, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { EngineState } from '@ir-engine/spatial/src/EngineState'
import { destroySpatialViewer, initializeSpatialViewer } from '@ir-engine/spatial/src/initializeEngine'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/WebGLRendererSystem'
import { useEffect, useLayoutEffect } from 'react'

export const useEngineCanvas = (ref: React.RefObject<HTMLElement>) => {
  const lastRef = useHookstate(() => ref.current)

  const engineState = useMutableState(EngineState)

  useLayoutEffect(() => {
    if (ref.current !== lastRef.value) {
      lastRef.set(ref.current)
    }
  }, [ref.current])

  useLayoutEffect(() => {
    if (!lastRef.value) return
    if (!engineState.localFloorEntity || !engineState.originEntity) return

    const parent = lastRef.value as HTMLElement

    const canvas = document.getElementById('engine-renderer-canvas') as HTMLCanvasElement
    const originalParent = canvas.parentElement
    initializeSpatialViewer(canvas)
    parent.appendChild(canvas)

    const observer = new ResizeObserver(() => {
      getComponent(getState(EngineState).viewerEntity, RendererComponent).needsResize = true
    })

    observer.observe(parent)

    return () => {
      destroySpatialViewer()
      observer.disconnect()
      parent.removeChild(canvas)
      originalParent?.appendChild(canvas)
    }
  }, [lastRef.value, engineState.localFloorEntity, engineState.originEntity])
}

export const useRemoveEngineCanvas = () => {
  useEffect(() => {
    const canvas = document.getElementById('engine-renderer-canvas')!
    const parent = canvas.parentElement
    parent?.removeChild(canvas)

    return () => {
      parent?.appendChild(canvas)
    }
  }, [])

  return null
}
