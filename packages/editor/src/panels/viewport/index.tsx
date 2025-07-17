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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { NotificationService } from '@ir-engine/client-core/src/common/services/NotificationService'
import useFeatureFlags from '@ir-engine/client-core/src/hooks/useFeatureFlags'
import { ShadowMapResolutionOptions } from '@ir-engine/client-core/src/user/menus/SettingsMenu'
import { uploadToFeathersService } from '@ir-engine/client-core/src/util/upload'
import { useFind } from '@ir-engine/common'
import { EngineSettings } from '@ir-engine/common/src/constants/EngineSettings'
import { FeatureFlags } from '@ir-engine/common/src/constants/FeatureFlags'
import { engineSettingPath, fileBrowserUploadPath } from '@ir-engine/common/src/schema.type.module'
import { cleanFileNameFile } from '@ir-engine/common/src/utils/cleanFileName'
import { useComponent } from '@ir-engine/ecs'
import { AuthoringState } from '@ir-engine/engine/src/authoring/AuthoringState'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { ErrorBoundary, getState, useMutableState } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { RenderModes } from '@ir-engine/spatial/src/renderer/constants/RenderModes'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'
import { ResourceProgressComponent } from '@ir-engine/spatial/src/resources/ResourceProgressComponent'
import { Checkbox, Select } from '@ir-engine/ui'
import InputGroup from '@ir-engine/ui/src/components/editor/input/Group'
import { PanelDragContainer, PanelTitle } from '@ir-engine/ui/src/components/editor/layout/Panel'
import { Popup } from '@ir-engine/ui/src/components/tailwind/Popup'
import { ChevronDownMd } from '@ir-engine/ui/src/icons'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import { TabData } from 'rc-dock'
import React, { Suspense, useEffect } from 'react'
import { useDrop } from 'react-dnd'
import { useTranslation } from 'react-i18next'
import { twMerge } from 'tailwind-merge'
import { Vector2, Vector3 } from 'three'
import { DnDFileType, FileDataType, ItemTypes, SceneElementType, SupportedFileTypes } from '../../constants/AssetTypes'
import { addMediaNode } from '../../functions/addMediaNode'
import { EditorControlFunctions } from '../../functions/EditorControlFunctions'
import { getCursorPositionNormalized, getScreenSpacePosition } from '../../functions/screenSpaceFunctions'
import { EditorState } from '../../services/EditorServices'
import CameraGizmoTool from './tools/CameraGizmoTool'
import RenderModeTool from './tools/RenderTool'
import SceneHelpersTool from './tools/SceneHelpersTool'
import ScenePlaybackTool from './tools/ScenePlaybackTool'
import SelectionBox from './tools/SelectionBoxTool'
import TransformGizmoTool from './tools/TransformGizmoTool'
import TransformPivotTool from './tools/TransformPivotTool'
import TransformSnapTool from './tools/TransformSnapTool'
import TransformSpaceTool from './tools/TransformSpaceTool'

const useIntersectionObserver = (ref, handleIntersection, handleObserve, options = {}) => {
  React.useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, {
      root: ref.current,
      threshold: 1,
      ...options
    })

    handleObserve(observer)

    return () => observer.disconnect()
  }, [ref.current, options])
}

const useVisibleByIndex = (items) => {
  return React.useState(
    items.map((element, index) => {
      return true
    })
  )
}

const ViewportDnD = ({ children }: { children: React.ReactNode }) => {
  const projectName = useMutableState(EditorState).projectName

  const [{ isDragging }, dropRef] = useDrop({
    accept: [ItemTypes.Component, ...SupportedFileTypes],
    collect: (monitor) => ({
      isDragging: monitor.getItem() !== null && monitor.canDrop() && monitor.isOver()
    }),
    drop(item: SceneElementType | FileDataType | DnDFileType, monitor) {
      const vec3 = new Vector3()
      const screenPosition = getCursorPositionNormalized(new Vector2().copy(monitor.getClientOffset() as Vector2))
      getScreenSpacePosition(screenPosition, vec3)
      if ('componentJsonID' in item) {
        EditorControlFunctions.createObjectFromSceneElement([
          { name: item.componentJsonID },
          { name: TransformComponent.jsonID, props: { position: vec3 } }
        ])
        AuthoringState.snapshotEntities([getState(EditorState).rootEntity])
      } else if ('url' in item) {
        addMediaNode(
          item.url,
          undefined,
          undefined,
          [{ name: TransformComponent.jsonID, props: { position: vec3 } }],
          screenPosition
        )
      } else if ('files' in item) {
        const dropDataTransfer: DataTransfer = monitor.getItem()

        Promise.all(
          Array.from(dropDataTransfer.files).map(async (file) => {
            try {
              file = cleanFileNameFile(file)
              return uploadToFeathersService(fileBrowserUploadPath, [file], {
                args: [
                  {
                    project: projectName.value,
                    path: `assets/` + file.name,
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
            addMediaNode(
              url[0],
              undefined,
              undefined,
              [{ name: TransformComponent.jsonID, props: { position: vec3 } }],
              screenPosition
            )
          })
        })
      }
    }
  })

  return (
    <div ref={dropRef} className={twMerge('h-full w-full border border-white', 'border-none')}>
      {children}
    </div>
  )
}

const SceneLoadingProgress = ({ rootEntity }) => {
  const { t } = useTranslation()
  const progress = useComponent(rootEntity, GLTFComponent).progress.value
  const loaded = GLTFComponent.useSceneLoaded(rootEntity)
  const pendingResources = ResourceProgressComponent.useAllPendingResources()

  if (loaded) return null

  return (
    <LoadingView
      fullSpace
      className="block h-12 w-12"
      containerClassName="absolute bg-black bg-opacity-70"
      title={t('editor:loadingScenesWithProgress', { progress, assetsLeft: pendingResources })}
    />
  )
}

export function ViewportContainer() {
  const { sceneName, rootEntity, canvasRef } = useMutableState(EditorState)

  const { t } = useTranslation()
  const clientSettingQuery = useFind(engineSettingPath, {
    query: {
      category: 'client',
      key: EngineSettings.Client.AppTitle,
      paginate: false
    }
  })

  const clientSettings = clientSettingQuery.data[0]

  const ref = React.useRef<HTMLDivElement>(null)
  const toolbarRef = React.useRef<HTMLDivElement>(null)
  const itemsRef = React.useRef<HTMLDivElement>(null)
  const canvasReactRef = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!canvasReactRef.current) return
    canvasRef.set(canvasReactRef)
  }, [canvasReactRef.current])

  const [transformPivotFeatureFlag] = useFeatureFlags([FeatureFlags.Studio.UI.TransformPivot])

  const leftItems = [
    <TransformSpaceTool />,
    ...(transformPivotFeatureFlag ? [<TransformPivotTool />] : []),
    <TransformSnapTool />
  ]
  const rightItems = [<SceneHelpersTool />, <RenderModeTool />, <ScenePlaybackTool />]

  const getItemsByVisible = (items, visibleByIndex) => {
    return items.filter((element, index) => {
      return visibleByIndex[index]
    })
  }

  const getItemsByInvisible = (items, visibleByIndex) => {
    return items.filter((element, index) => {
      return !visibleByIndex[index]
    })
  }

  const [leftBarVisible, setLeftBarVisible] = useVisibleByIndex(leftItems)
  const [rightBarVisible, setRightBarVisible] = useVisibleByIndex(rightItems)

  const menuItems = React.useMemo(() => {
    const left = getItemsByInvisible(leftItems, leftBarVisible)
    const right = getItemsByInvisible(rightItems, rightBarVisible)

    return [...left, ...right]
  }, [leftBarVisible, rightBarVisible])

  const getItemsWithStyling = (items, visibleByIndex, key, side) => {
    return items.map((element: JSX.Element, index) => {
      const visible = visibleByIndex[index]

      return (
        <div
          key={key + index}
          className={twMerge(visible ? 'visible' : 'collapse', 'inline-flex')}
          data-targetid={index}
          data-side={side}
        >
          {element}
        </div>
      )
    })
  }

  const leftBarItems = getItemsWithStyling(leftItems, leftBarVisible, 'bar', 'left')
  const rightBarItems = getItemsWithStyling(rightItems, rightBarVisible, 'bar', 'right')

  const addDividersToItems = (items, visibleByIndex) => {
    const withDividers: JSX.Element[] = []

    items.forEach((item, index) => {
      const isNextVisible = visibleByIndex[index + 1]

      withDividers.push(item)
      withDividers.push(
        <div
          className={twMerge('h-full w-px bg-text-inactive', isNextVisible ? 'opacity-1' : 'opacity-0')}
          key={index + 'divider'}
        />
      )
    })

    return withDividers
  }

  const leftBarItemsWithDividers = addDividersToItems(leftBarItems, leftBarVisible)
  const rightBarItemsWithDividers = addDividersToItems(rightBarItems, rightBarVisible)

  const setVisibilityBySide = {
    left: setLeftBarVisible,
    right: setRightBarVisible
  }

  const handleIntersection = (entries) => {
    entries.map(({ target, isIntersecting }) => {
      const targetid = target.dataset.targetid
      const side = target.dataset.side

      const setVisibleBarItems = setVisibilityBySide[side]

      setVisibleBarItems((current) => {
        const next = [...current]

        next[targetid] = isIntersecting

        return next
      })
    })
  }

  const handleObserve = (observer) => {
    if (!itemsRef.current) {
      return
    }

    const [left, right] = itemsRef.current.children as HTMLCollection

    const observeChildren = (element) =>
      Array.from(element.children as HTMLCollection).map((element: HTMLElement) => {
        if (element.dataset.side) {
          observer.observe(element)
        }
      })

    observeChildren(left)
    observeChildren(right)
  }

  useIntersectionObserver(itemsRef, handleIntersection, handleObserve, {
    threshold: 1
  })

  const rendererState = useMutableState(RendererState)

  const handlePostProcessingChange = () => {
    rendererState.usePostProcessing.set(!rendererState.usePostProcessing.value)
    rendererState.automatic.set(false)
  }

  const hasMenuItems = !!menuItems.length

  return (
    <ViewportDnD>
      <div className="relative z-30 flex h-full w-full flex-col">
        <div ref={toolbarRef} className="relative z-20 bg-surface-4 px-5 py-3 pr-7">
          <div ref={itemsRef} className="flex justify-between gap-1">
            <div className={'flex justify-start gap-x-5'}>{leftBarItemsWithDividers}</div>
            <div className={'flex justify-start gap-x-5'}>{rightBarItemsWithDividers}</div>
          </div>
          {
            <div className="absolute bottom-0 right-0 top-0 inline-grid">
              <Popup
                keepInside
                trigger={
                  <button className="relative flex h-full w-10 items-center border-none bg-surface-4 px-2 text-2xl text-text-secondary outline-none">
                    <ChevronDownMd />
                  </button>
                }
              >
                <div className="inline-grid items-start gap-y-4 rounded-lg bg-surface-2 px-5 py-6">
                  {hasMenuItems &&
                    menuItems.map((element, index) => {
                      return <div key={index}>{element}</div>
                    })}
                  {hasMenuItems && <div className={'h-px w-full rounded-full bg-surface-3'} />}
                  <InputGroup
                    name="Use Post Processing"
                    label={t('editor:toolbar.render-settings.lbl-usePostProcessing')}
                    info={t('editor:toolbar.render-settings.info-usePostProcessing')}
                    containerClassName="justify-between p-0"
                    className="w-8"
                  >
                    <Checkbox checked={rendererState.usePostProcessing.value} onChange={handlePostProcessingChange} />
                  </InputGroup>
                  <InputGroup
                    name="Shadow Map Resolution"
                    label={t('editor:toolbar.render-settings.lbl-shadowMapResolution')}
                    info={t('editor:toolbar.render-settings.info-shadowMapResolution')}
                    containerClassName="justify-between gap-y-3 p-0"
                  >
                    <Select
                      options={ShadowMapResolutionOptions as { value: string; label: string }[]}
                      value={rendererState.shadowMapResolution.value}
                      onChange={(resolution: number) => rendererState.shadowMapResolution.set(resolution)}
                      disabled={rendererState.renderMode.value !== RenderModes.SHADOW}
                      width="full"
                    />
                  </InputGroup>
                </div>
              </Popup>
            </div>
          }
        </div>
        {sceneName.value ? <SelectionBox viewportRef={ref} toolbarRef={toolbarRef} /> : null}
        {sceneName.value ? <TransformGizmoTool /> : null}
        {sceneName.value ? <CameraGizmoTool viewportRef={ref} toolbarRef={toolbarRef} /> : null}
        <div id="engine-renderer-canvas-container" ref={canvasReactRef} className="absolute z-10 h-full w-full" />
        {sceneName.value ? (
          <>{rootEntity.value && <SceneLoadingProgress key={rootEntity.value} rootEntity={rootEntity.value} />}</>
        ) : (
          <div className="relative z-20 flex h-full w-full justify-center">
            <div className="flex max-w-[40rem] flex-col justify-center gap-5 px-6">
              <img src={clientSettings?.value} className="block" />
              <Text className="text-center dark:text-[#A3A3A3]">{t('editor:selectSceneMsg')}</Text>
            </div>
          </div>
        )}
      </div>
    </ViewportDnD>
  )
}

export const ViewportPanelTitle = () => {
  const { t } = useTranslation()

  return (
    <PanelDragContainer>
      <PanelTitle>{t('editor:viewport.title')}</PanelTitle>
    </PanelDragContainer>
  )
}

export const ViewportPanelTab: TabData = {
  id: 'viewPanel',
  closable: true,
  title: <ViewportPanelTitle />,
  content: (
    <ErrorBoundary fallback={<div>Error occured with the Viewport tab</div>}>
      <Suspense>
        <ViewportContainer />
      </Suspense>
    </ErrorBoundary>
  )
}
