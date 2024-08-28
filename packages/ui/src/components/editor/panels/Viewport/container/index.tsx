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

import { NotificationService } from '@ir-engine/client-core/src/common/services/NotificationService'
import { useEngineCanvas } from '@ir-engine/client-core/src/hooks/useEngineCanvas'
import useFeatureFlags from '@ir-engine/client-core/src/hooks/useFeatureFlags'
import { uploadToFeathersService } from '@ir-engine/client-core/src/util/upload'
import { FeatureFlags } from '@ir-engine/common/src/constants/FeatureFlags'
import { clientSettingPath, fileBrowserUploadPath } from '@ir-engine/common/src/schema.type.module'
import { processFileName } from '@ir-engine/common/src/utils/processFileName'
import { useComponent, useQuery } from '@ir-engine/ecs'
import { ItemTypes, SupportedFileTypes } from '@ir-engine/editor/src/constants/AssetTypes'
import { EditorControlFunctions } from '@ir-engine/editor/src/functions/EditorControlFunctions'
import { addMediaNode } from '@ir-engine/editor/src/functions/addMediaNode'
import { getCursorSpawnPosition } from '@ir-engine/editor/src/functions/screenSpaceFunctions'
import { EditorState } from '@ir-engine/editor/src/services/EditorServices'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { ResourcePendingComponent } from '@ir-engine/engine/src/gltf/ResourcePendingComponent'
import { useMutableState } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { useFind } from '@ir-engine/spatial/src/common/functions/FeathersHooks'
import React from 'react'
import { useDrop } from 'react-dnd'
import { useTranslation } from 'react-i18next'
import { twMerge } from 'tailwind-merge'
import { Vector2, Vector3 } from 'three'
import LoadingView from '../../../../../primitives/tailwind/LoadingView'
import Text from '../../../../../primitives/tailwind/Text'
import { DnDFileType, FileType } from '../../Files/container'
import { SceneElementType } from '../../Properties/elementList'
import GizmoTool from '../tools/GizmoTool'
import GridTool from '../tools/GridTool'
import PlayModeTool from '../tools/PlayModeTool'
import RenderModeTool from '../tools/RenderTool'
import SceneHelpersTool from '../tools/SceneHelpersTool'
import TransformPivotTool from '../tools/TransformPivotTool'
import TransformSnapTool from '../tools/TransformSnapTool'
import TransformSpaceTool from '../tools/TransformSpaceTool'

const ViewportDnD = ({ children }: { children: React.ReactNode }) => {
  const projectName = useMutableState(EditorState).projectName

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
      } else if ('files' in item) {
        const dropDataTransfer: DataTransfer = monitor.getItem()

        Promise.all(
          Array.from(dropDataTransfer.files).map(async (file) => {
            try {
              const name = processFileName(file.name)
              return uploadToFeathersService(fileBrowserUploadPath, [file], {
                args: [
                  {
                    project: projectName.value,
                    path: `assets/` + name,
                    contentType: file.type
                  }
                ]
              }).promise as Promise<string[]>
            } catch (err) {
              NotificationService.dispatchNotify(err.message, { variant: 'error' })
            }
          })
        ).then((urls) => {
          const vec3 = new Vector3()
          urls.forEach((url) => {
            if (!url || url.length < 1 || !url[0] || url[0] === '') return
            addMediaNode(url[0], undefined, undefined, [{ name: TransformComponent.jsonID, props: { position: vec3 } }])
          })
        })
      }
    }
  })

  return (
    <div
      ref={dropRef}
      className={twMerge('h-full w-full border border-white', isDragging ? 'border-4' : 'border-none')}
    >
      {children}
    </div>
  )
}

const SceneLoadingProgress = ({ rootEntity }) => {
  const { t } = useTranslation()
  const progress = useComponent(rootEntity, GLTFComponent).progress.value
  const loaded = GLTFComponent.useSceneLoaded(rootEntity)
  const resourcePendingQuery = useQuery([ResourcePendingComponent])

  if (loaded) return null

  return (
    <LoadingView
      fullSpace
      className="block h-12 w-12"
      containerClassName="absolute bg-black bg-opacity-70"
      title={t('editor:loadingScenesWithProgress', { progress, assetsLeft: resourcePendingQuery.length })}
    />
  )
}

const ViewPortPanelContainer = () => {
  const { sceneName, rootEntity } = useMutableState(EditorState)

  const { t } = useTranslation()
  const clientSettingQuery = useFind(clientSettingPath)
  const clientSettings = clientSettingQuery.data[0]

  const ref = React.useRef<HTMLDivElement>(null)
  const toolbarRef = React.useRef<HTMLDivElement>(null)

  useEngineCanvas(ref)

  const [transformPivotFeatureFlag] = useFeatureFlags([FeatureFlags.Studio.UI.TransformPivot])

  return (
    <ViewportDnD>
      <div className="relative z-30 flex h-full w-full flex-col">
        <div ref={toolbarRef} className="z-10 flex gap-1 bg-theme-studio-surface p-1">
          <TransformSpaceTool />
          {transformPivotFeatureFlag && <TransformPivotTool />}
          <GridTool />
          <TransformSnapTool />
          <SceneHelpersTool />
          <div className="flex-1" />
          <RenderModeTool />
          <PlayModeTool />
        </div>
        {sceneName.value ? <GizmoTool viewportRef={ref} toolbarRef={toolbarRef} /> : null}
        {sceneName.value ? (
          <>
            <div id="engine-renderer-canvas-container" ref={ref} className="absolute h-full w-full" />
            {rootEntity.value && <SceneLoadingProgress key={rootEntity.value} rootEntity={rootEntity.value} />}
          </>
        ) : (
          <div className="flex h-full w-full flex-col justify-center gap-2">
            <img src={clientSettings?.appTitle} className="block scale-[.8]" />
            <Text className="text-center">{t('editor:selectSceneMsg')}</Text>
          </div>
        )}
      </div>
    </ViewportDnD>
  )
}

export default ViewPortPanelContainer
