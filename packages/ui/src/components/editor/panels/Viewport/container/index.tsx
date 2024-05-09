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

import { Engine, getComponent } from '@etherealengine/ecs'
import { SceneElementType } from '@etherealengine/editor/src/components/element/ElementList'
import { ItemTypes } from '@etherealengine/editor/src/constants/AssetTypes'
import { EditorControlFunctions } from '@etherealengine/editor/src/functions/EditorControlFunctions'
import { getCursorSpawnPosition } from '@etherealengine/editor/src/functions/screenSpaceFunctions'
import { EditorState } from '@etherealengine/editor/src/services/EditorServices'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { TransformComponent } from '@etherealengine/spatial'
import { RendererComponent } from '@etherealengine/spatial/src/renderer/WebGLRendererSystem'
import React, { useEffect, useRef } from 'react'
import { useDrop } from 'react-dnd'
import { useTranslation } from 'react-i18next'
import { twMerge } from 'tailwind-merge'
import { Vector2, Vector3 } from 'three'
import GridTool from '../tools/GridTool'
import PlayModeTool from '../tools/PlayModeTool'
import TransformPivotTool from '../tools/TransformPivotTool'
import TransformSnapTool from '../tools/TransformSnapTool'
import TransformSpaceTool from '../tools/TransformSpaceTool'

export const ViewportEngineCanvas = () => {
  const ref = useRef(null as null | HTMLDivElement)

  useEffect(() => {
    if (!ref?.current) return

    const canvas = getComponent(Engine.instance.viewerEntity, RendererComponent).renderer.domElement
    ref.current.appendChild(canvas)

    getComponent(Engine.instance.viewerEntity, RendererComponent).needsResize = true

    // return () => {
    //   const canvas = document.getElementById('engine-renderer-canvas')!
    //   parent.removeChild(canvas)
    // }
  }, [ref])

  return <div ref={ref} className="h-[100%] w-[100%]" />
}
const ViewportDnD = () => {
  const [{ isDragging, isOver }, dropRef] = useDrop({
    accept: [ItemTypes.Component],
    collect: (monitor) => ({
      isDragging: monitor.getItem() !== null && monitor.canDrop(),
      isOver: monitor.isOver()
    }),
    drop(item: SceneElementType, monitor) {
      const vec3 = new Vector3()
      getCursorSpawnPosition(monitor.getClientOffset() as Vector2, vec3)
      EditorControlFunctions.createObjectFromSceneElement([
        { name: item!.componentJsonID },
        { name: TransformComponent.jsonID, props: { position: vec3 } }
      ])
    }
  })

  return (
    <div
      id="viewport-panel"
      ref={dropRef}
      className={twMerge(
        'h-full w-full',
        isDragging && isOver ? 'border-[5px]' : 'border-none',
        isDragging ? 'pointer-events-auto' : 'pointer-events-none'
      )}
    >
      <ViewportEngineCanvas />
    </div>
  )
}

const ViewPortPanelContainer = () => {
  const { t } = useTranslation()
  const sceneName = useHookstate(getMutableState(EditorState).sceneName).value
  return (
    <div className="bg-theme-surface-main flex h-full w-full flex-col">
      <div className="flex gap-1">
        <TransformSpaceTool />
        <TransformPivotTool />
        <GridTool />
        <TransformSnapTool />
        <div className="flex-1" />
        <PlayModeTool />
      </div>
      {sceneName ? (
        <ViewportDnD />
      ) : (
        <div className="z-0 flex h-full w-full flex-col justify-center">
          <img className="mt-[-50px] object-contain opacity-80" src="/static/etherealengine.png" alt="" />
          <h2 className="text-white-400 mt-[30px] w-full text-center font-[normal] text-[100%]">
            {t('editor:selectSceneMsg')}
          </h2>
        </div>
      )}
    </div>
  )
}

export default ViewPortPanelContainer
