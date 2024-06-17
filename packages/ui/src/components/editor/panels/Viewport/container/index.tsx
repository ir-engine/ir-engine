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

import { AdminClientSettingsState } from '@etherealengine/client-core/src/admin/services/Setting/ClientSettingService'
import { LoadingCircle } from '@etherealengine/client-core/src/components/LoadingCircle'
import { Engine, getComponent, useComponent, useQuery } from '@etherealengine/ecs'
import { SceneElementType } from '@etherealengine/editor/src/components/element/ElementList'
import { ItemTypes, SupportedFileTypes } from '@etherealengine/editor/src/constants/AssetTypes'
import { EditorControlFunctions } from '@etherealengine/editor/src/functions/EditorControlFunctions'
import { addMediaNode } from '@etherealengine/editor/src/functions/addMediaNode'
import { getCursorSpawnPosition } from '@etherealengine/editor/src/functions/screenSpaceFunctions'
import { EditorState } from '@etherealengine/editor/src/services/EditorServices'
import { GLTFComponent } from '@etherealengine/engine/src/gltf/GLTFComponent'
import { GLTFModifiedState } from '@etherealengine/engine/src/gltf/GLTFDocumentState'
import { ResourcePendingComponent } from '@etherealengine/engine/src/gltf/ResourcePendingComponent'
import { SourceComponent } from '@etherealengine/engine/src/scene/components/SourceComponent'
import { getMutableState, useHookstate, useMutableState } from '@etherealengine/hyperflux'
import { TransformComponent } from '@etherealengine/spatial'
import { RendererComponent } from '@etherealengine/spatial/src/renderer/WebGLRendererSystem'
import React, { useEffect } from 'react'
import { useDrop } from 'react-dnd'
import { useTranslation } from 'react-i18next'
import { twMerge } from 'tailwind-merge'
import { Vector2, Vector3 } from 'three'
import Text from '../../../../../primitives/tailwind/Text'
import { DnDFileType, FileType } from '../../Files/container'
import GizmoTool from '../tools/GizmoTool'
import GridTool from '../tools/GridTool'
import PlayModeTool from '../tools/PlayModeTool'
import RenderModeTool from '../tools/RenderTool'
import TransformPivotTool from '../tools/TransformPivotTool'
import TransformSnapTool from '../tools/TransformSnapTool'
import TransformSpaceTool from '../tools/TransformSpaceTool'

const ViewportDnD = () => {
  const [{ isDragging }, dropRef] = useDrop({
    accept: [ItemTypes.Component, ...SupportedFileTypes],
    collect: (monitor) => ({
      isDragging: monitor.getItem() !== null && monitor.canDrop() && monitor.isOver()
    }),
    drop(item: SceneElementType | FileType | DnDFileType, monitor) {
      const vec3 = new Vector3()
      getCursorSpawnPosition(monitor.getClientOffset() as Vector2, vec3)
      if ('componentJsonID' in item) {
        EditorControlFunctions.createObjectFromSceneElement([
          { name: item.componentJsonID },
          { name: TransformComponent.jsonID, props: { position: vec3 } }
        ])
      } else if ('url' in item) {
        addMediaNode(item.url, undefined, undefined, [{ name: TransformComponent.jsonID, props: { position: vec3 } }])
      }
    }
  })

  useEffect(() => {
    const viewportPanelNode = document.getElementById('viewport-panel')
    if (!viewportPanelNode) return

    const canvas = getComponent(Engine.instance.viewerEntity, RendererComponent).renderer.domElement
    viewportPanelNode.appendChild(canvas)

    getComponent(Engine.instance.viewerEntity, RendererComponent).needsResize = true

    const observer = new ResizeObserver(() => {
      getComponent(Engine.instance.viewerEntity, RendererComponent).needsResize = true
    })

    observer.observe(viewportPanelNode)
    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <div
      id="viewport-panel"
      ref={dropRef}
      className={twMerge(
        'h-full w-full border border-white',
        isDragging ? 'pointer-events-auto border-4' : 'pointer-events-none border-none'
      )}
    />
  )
}
const LoadedScene = ({ rootEntity }) => {
  const progress = useComponent(rootEntity, GLTFComponent).progress.value
  const resourcePendingQuery = useQuery([ResourcePendingComponent])
  const src = getComponent(rootEntity, SourceComponent)
  const sceneModified = useHookstate(getMutableState(GLTFModifiedState)[src]).value

  useEffect(() => {
    if (!sceneModified) return
    const onBeforeUnload = (e) => {
      alert('You have unsaved changes. Please save before leaving.')
      e.preventDefault()
      e.returnValue = ''
    }

    window.addEventListener('beforeunload', onBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload)
    }
  }, [sceneModified])

  if (progress === 100) return null

  return (
    <div>
      <div className="flex h-full w-full flex-col items-center justify-center text-center">
        <div className="p-4 text-xs text-white">
          {`Scene Loading... ${progress}% - ${resourcePendingQuery.length} assets left`}
        </div>
        <LoadingCircle />
      </div>
    </div>
  )
}

const ViewPortPanelContainer = () => {
  const { sceneName, rootEntity } = useMutableState(EditorState)

  const { t } = useTranslation()
  const clientSettingState = useMutableState(AdminClientSettingsState)
  const [clientSetting] = clientSettingState?.client?.value || []
  return (
    <div className="relative z-30 flex h-full w-full flex-col bg-theme-surface-main">
      <div className="flex gap-1 p-1">
        <TransformSpaceTool />
        <TransformPivotTool />
        <GridTool />
        <TransformSnapTool />
        <div className="flex-1" />
        <RenderModeTool />
        <PlayModeTool />
      </div>
      {sceneName.value ? <GizmoTool /> : null}
      {sceneName.value ? (
        <>
          {rootEntity.value && <LoadedScene key={rootEntity.value} rootEntity={rootEntity.value} />}
          <ViewportDnD />
        </>
      ) : (
        <div className="flex h-full w-full flex-col justify-center gap-2">
          <img src={clientSetting.appTitle} className="block scale-[.8]" />
          <Text className="text-center">{t('editor:selectSceneMsg')}</Text>
        </div>
      )}
    </div>
  )
}

export default ViewPortPanelContainer
