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

import { getComponent, getOptionalMutableComponent, hasComponent } from '@ir-engine/ecs'
import { getMutableState, getState, none } from '@ir-engine/hyperflux'
import { useEffect } from 'react'

import { useMutableState } from '@ir-engine/hyperflux'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/WebGLRendererSystem'
import { initializeSpatialViewer } from '../../initializeEngine'
import { ReferenceSpaceState } from '../../ReferenceSpaceState'
import { EngineCanvasState } from '../EngineCanvasState'

export const useEngineCanvas = (ref: React.RefObject<HTMLElement> | null) => {
  useEffect(() => {
    // Create canvas if it doesn't exist
    let canvas = document.getElementById('engine-renderer-canvas') as HTMLCanvasElement
    if (!canvas) {
      canvas = document.createElement('canvas')
      canvas.id = 'engine-renderer-canvas'
      canvas.style.width = '100%'
      canvas.style.height = '100%'
      document.body.appendChild(canvas)
    }

    // Ensure the spatial viewer is initialized
    if (!getState(ReferenceSpaceState).viewerEntity) {
      initializeSpatialViewer(canvas)
    }

    const engineCanvasState = getMutableState(EngineCanvasState)

    // Handle parent changes
    if (ref?.current) {
      const parent = ref.current as HTMLElement

      // Store previous parent before moving
      if (canvas.parentElement && canvas.parentElement !== parent) {
        engineCanvasState.previousEngineCanvasParent.set(canvas.parentElement)
      }

      // Only append if not already a child of this parent
      if (canvas.parentElement !== parent) {
        canvas.hidden = false
        parent.appendChild(canvas)
      }

      const observer = new ResizeObserver(() => {
        const viewerEntity = getState(ReferenceSpaceState).viewerEntity
        if (viewerEntity && hasComponent(viewerEntity, RendererComponent)) {
          getComponent(viewerEntity, RendererComponent).needsResize = true
        }
      })

      observer.observe(parent)
      return () => {
        observer.disconnect()
        // Only remove if still a child of this parent
        if (canvas.parentElement === parent) {
          parent.removeChild(canvas)
          // Return to previous parent if available
          const previousParent = engineCanvasState.previousEngineCanvasParent.value
          if (previousParent && previousParent.isConnected) {
            previousParent.appendChild(canvas)
          } else {
            // If no previous parent or it's no longer in DOM, hide canvas
            canvas.hidden = true
            document.body.appendChild(canvas)
          }
        }
      }
    } else {
      // No ref - check if we have a previous parent to return to
      const previousParent = engineCanvasState.previousEngineCanvasParent.value
      if (previousParent && previousParent.isConnected && canvas.parentElement !== previousParent) {
        if (canvas.parentElement) {
          canvas.parentElement.removeChild(canvas)
        }
        previousParent.appendChild(canvas)
        canvas.hidden = false
      } else if (canvas.parentElement !== document.body) {
        // No valid previous parent - move to body and hide
        if (canvas.parentElement) {
          canvas.parentElement.removeChild(canvas)
        }
        document.body.appendChild(canvas)
        canvas.hidden = true
      }
    }
  }, [ref?.current])

  /**
   * Since the viewer and XR reference spaces can technically exist without the other,
   * we need to reactively update the core renderer's scenes
   */
  const { viewerEntity, originEntity, localFloorEntity } = useMutableState(ReferenceSpaceState).value

  useEffect(() => {
    if (!viewerEntity || !originEntity) return

    const rendererComponent = getOptionalMutableComponent(viewerEntity, RendererComponent)
    if (!rendererComponent) return

    rendererComponent.scenes.merge([originEntity])

    return () => {
      if (!hasComponent(viewerEntity, RendererComponent)) return
      const index = rendererComponent.scenes.value.indexOf(originEntity)
      if (index >= 0) {
        rendererComponent.scenes[index].set(none)
      }
    }
  }, [viewerEntity, originEntity])

  useEffect(() => {
    if (!viewerEntity || !localFloorEntity) return

    const rendererComponent = getOptionalMutableComponent(viewerEntity, RendererComponent)
    if (!rendererComponent) return

    rendererComponent.scenes.merge([localFloorEntity])

    return () => {
      if (!hasComponent(viewerEntity, RendererComponent)) return
      const index = rendererComponent.scenes.value.indexOf(localFloorEntity)
      if (index >= 0) {
        rendererComponent.scenes[index].set(none)
      }
    }
  }, [viewerEntity, localFloorEntity])
}

export const useRemoveEngineCanvas = () => {
  useEffect(() => {
    const canvas = document.getElementById('engine-renderer-canvas')
    if (!canvas) return

    const parent = canvas.parentElement
    const previousEngineCanvasParent = getMutableState(EngineCanvasState).previousEngineCanvasParent

    if (parent) {
      // Store the current parent before removing
      previousEngineCanvasParent.set(parent)
      parent.removeChild(canvas)
    }

    canvas.hidden = true

    return () => {
      // On cleanup, if we have a stored parent, reattach
      if (previousEngineCanvasParent.value) {
        previousEngineCanvasParent.value.appendChild(canvas)
        canvas.hidden = false
      }
    }
  }, [])

  return null
}
