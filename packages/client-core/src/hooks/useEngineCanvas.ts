/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { getComponent } from '@etherealengine/ecs'
import { getState } from '@etherealengine/hyperflux'
import { EngineState } from '@etherealengine/spatial/src/EngineState'
import { destroySpatialEngine, initializeSpatialEngine } from '@etherealengine/spatial/src/initializeEngine'
import { RendererComponent } from '@etherealengine/spatial/src/renderer/WebGLRendererSystem'
import { useEffect } from 'react'

export const useEngineCanvas = (ref: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    if (!ref.current) return

    const parent = ref.current

    const canvas = document.getElementById('engine-renderer-canvas') as HTMLCanvasElement
    const originalParent = canvas.parentElement
    console.log(originalParent, parent, canvas)
    initializeSpatialEngine(canvas)
    parent.appendChild(canvas)

    const observer = new ResizeObserver(() => {
      getComponent(getState(EngineState).viewerEntity, RendererComponent).needsResize = true
    })

    observer.observe(ref.current)

    return () => {
      destroySpatialEngine()
      observer.disconnect()
      parent.removeChild(canvas)
      originalParent?.appendChild(canvas)
    }
  }, [ref.current])
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
