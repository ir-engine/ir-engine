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

import AddEditLocationModal from '@ir-engine/client-core/src/admin/components/locations/AddEditLocationModal'
import ProfilePill from '@ir-engine/client-core/src/common/components/ProfilePill'
import { ModalState } from '@ir-engine/client-core/src/common/services/ModalState'
import { NotificationService } from '@ir-engine/client-core/src/common/services/NotificationService'
import { RouterState } from '@ir-engine/client-core/src/common/services/RouterService'
import { ThemeState } from '@ir-engine/client-core/src/common/services/ThemeService'
import { useProjectPermissions } from '@ir-engine/client-core/src/hooks/useUserProjectPermission'
import irStudioIconDark from '@ir-engine/client/src/assets/ir-studio-icon-dark.svg'
import irStudioIconLight from '@ir-engine/client/src/assets/ir-studio-icon-light.svg'
import { useFind } from '@ir-engine/common'
import { ScopeType, locationPath, scopePath } from '@ir-engine/common/src/schema.type.module'
import { Engine } from '@ir-engine/ecs'
import { AssetModifiedState } from '@ir-engine/engine/src/gltf/GLTFState'
import { getMutableState, getState, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { Button, DropdownItem } from '@ir-engine/ui'
import { AddScene } from '@ir-engine/ui/src/components/editor/AddScene/AddScene'
import { ContextMenu } from '@ir-engine/ui/src/components/tailwind/ContextMenu'
import { ChevronDownSm, File04Sm, UploadCloud02Sm } from '@ir-engine/ui/src/icons'
import { t } from 'i18next'
import React, { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import {
  confirmSceneExists,
  onNewScene,
  onSaveScene,
  saveSceneGLTF,
  useCanSaveScene
} from '../../functions/sceneFunctions'
import { cmdOrCtrlString } from '../../functions/utils'
import { uploadFiles } from '../../panels/assets/topbar'
import { EditorState } from '../../services/EditorServices'
import { UIAddonsState } from '../../services/UIAddonsState'
import CreatePrefabPanel from '../dialogs/CreatePrefabPanelDialog'
import ImportSettingsPanel from '../dialogs/ImportSettingsPanelDialog'
import SaveNewSceneDialog from '../dialogs/SaveNewSceneDialog'
import QuitToDashboardConfirmationDialog from './../dialogs/QuitToDashboardConfirmationDialog'

const onImportAsset = async () => {
  const { projectName } = getState(EditorState)

  if (projectName) {
    try {
      uploadFiles()
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

export const confirmSceneSaveIfModified = async () => {
  const { sceneName } = getState(EditorState)
  const isSceneExists = sceneName ? await confirmSceneExists(sceneName) : false

  const isModified = EditorState.isModified()

  if (isModified && isSceneExists) {
    return new Promise((resolve) => {
      ModalState.openModal(<QuitToDashboardConfirmationDialog resolve={resolve} />)
    })
  }
  return true
}

const onClickNewScene = async () => {
  if (!(await confirmSceneSaveIfModified())) return

  const newSceneUIAddons = getState(UIAddonsState).editor.newScene

  if (Object.keys(newSceneUIAddons).length > 0) {
    const { projectName } = getState(EditorState)
    ModalState.openModal(<AddScene projectName={projectName!} />)
  } else {
    onNewScene()
  }
}

export const onCloseProject = async () => {
  if (!(await confirmSceneSaveIfModified())) return

  const editorState = getMutableState(EditorState)
  getMutableState(AssetModifiedState).set({})
  editorState.projectName.set(null)
  editorState.scenePath.set(null)
  editorState.sceneName.set(null)
  RouterState.navigate('/studio')

  const parsed = new URL(window.location.href)
  const query = parsed.searchParams

  query.delete('project')
  query.delete('scenePath')

  parsed.search = query.toString()
  if (typeof history.pushState !== 'undefined') {
    window.history.replaceState({}, '', parsed.toString())
  }
}

const generateToolbarMenu = () => {
  return [
    {
      name: t('editor:menubar.newScene'),
      action: onClickNewScene
    },
    {
      name: t('editor:menubar.saveScene'),
      hotkey: `${cmdOrCtrlString}+s`,
      action: onSaveScene,
      enabledHook: useCanSaveScene,
      showSpinner: true
    },
    {
      name: t('editor:menubar.saveAs'),
      action: () => ModalState.openModal(<SaveNewSceneDialog />),
      enabledHook: useCanSaveScene,
      showSpinner: true
    },
    {
      name: t('editor:menubar.importSettings'),
      action: () => ModalState.openModal(<ImportSettingsPanel />)
    },
    {
      name: t('editor:menubar.importAsset'),
      action: onImportAsset
    },
    {
      name: t('editor:menubar.exportLookdev'),
      action: () => ModalState.openModal(<CreatePrefabPanel isExportLookDev={true} />, () => {})
    },
    {
      name: t('editor:menubar.documentation'),
      href: 'https://docs.ir.world'
    },
    {
      name: t('editor:menubar.quit'),
      action: onCloseProject
    }
  ]
}

const toolbarMenu = generateToolbarMenu()

const onPublish = async () => {
  const sceneModified = EditorState.isModified()

  if (!sceneModified) return

  const { sceneAssetID, projectName, sceneName, rootEntity } = getState(EditorState)
  if (!sceneAssetID || !projectName || !sceneName || !rootEntity)
    throw new Error('Cannot save scene without scene data')
  const abortController = new AbortController()
  await saveSceneGLTF(sceneAssetID, projectName, sceneName, abortController.signal)
}

export default function Toolbar() {
  const { t } = useTranslation()
  const anchorEvent = useHookstate<null | React.MouseEvent<HTMLElement>>(null)
  const anchorPosition = useHookstate({ left: 0, top: 0 })
  const themeState = useMutableState(ThemeState)

  const { projectName, sceneName, sceneAssetID } = useMutableState(EditorState)
  const sceneNameSimplified = sceneName.value?.split('.').slice(0, -1).join('.')

  const isModified = EditorState.useIsModified()

  const locationScopeQuery = useFind(scopePath, {
    query: {
      userId: Engine.instance.userID,
      type: 'location:write' as ScopeType
    }
  })

  const hasLocationWriteScope = locationScopeQuery.data.length > 0
  const permission = useProjectPermissions(projectName.value!)
  const hasPublishAccess = hasLocationWriteScope || permission?.type === 'owner' || permission?.type === 'editor'
  const locationQuery = useFind(locationPath, { query: { action: 'studio', sceneId: sceneAssetID.value } })
  const currentLocation = locationQuery.data[0]

  // This is fine as long as toolbarMenu is a static object
  const toolbarItemsEnabled = toolbarMenu.map((item) => {
    if (!item.enabledHook) return true
    return item.enabledHook()
  })

  return (
    <>
      <div className="flex h-10 items-center justify-between px-4 py-0.5">
        <div className="flex items-center">
          <div className="cursor-pointer" data-testid="back-to-dashboard-button" onClick={onCloseProject}>
            <img
              src={themeState.theme.value === 'dark' ? irStudioIconDark : irStudioIconLight}
              alt="iR Engine Logo"
              className="h-6 w-6"
            />
          </div>
          <button
            data-testid="editor-main-menu-button"
            onClick={(event) => {
              anchorPosition.set({ left: event.clientX - 20, top: event.clientY - 20 })
              anchorEvent.set(event)
            }}
          >
            <ChevronDownSm />
          </button>
        </div>
        {/* TO BE ADDED */}
        {/* <div className="flex items-center gap-2.5 rounded-full bg-[#212226] p-0.5">
          <div className="rounded-2xl px-2.5">{t('editor:toolbar.lbl-simple')}</div>
          <div className="rounded-2xl px-2.5">{t('editor:toolbar.lbl-advanced')}</div>
        </div> */}
        <div className="flex items-center gap-2.5" data-testid="editor-breadcrumbs-container">
          <File04Sm />
          {projectName.value!.split('/').map((part, index) => (
            <Fragment key={index}>
              <span className="text-text-secondary" data-testid="editor-breadcrumbs-item">
                {part}
              </span>
              <span className="text-text-secondary">{' / '}</span>
            </Fragment>
          ))}
          <span className="text-text-primary" data-testid="editor-breadcrumbs-scene-name">
            {sceneNameSimplified}
          </span>
        </div>

        <div className="flex items-center justify-center gap-2">
          <ProfilePill />

          {sceneAssetID.value && (
            <div className="p-2">
              <Button
                data-testid="publish-button"
                disabled={!hasPublishAccess}
                onClick={() =>
                  ModalState.openModal(
                    <AddEditLocationModal
                      action="studio"
                      sceneID={sceneAssetID.value}
                      location={currentLocation}
                      inStudio={true}
                      sceneModified={isModified}
                      onPublish={onPublish}
                    />,
                    () => {}
                  )
                }
                className="rounded-[8px] py-1 text-base"
              >
                <UploadCloud02Sm />
                {t('editor:toolbar.lbl-publish')}
              </Button>
            </div>
          )}
        </div>
      </div>
      <ContextMenu
        anchorEvent={anchorEvent.value as React.MouseEvent<HTMLElement>}
        onClose={() => anchorEvent.set(null)}
      >
        <div className="w-[180px]" tabIndex={0}>
          {toolbarMenu.map(({ name, href, action = () => {}, hotkey, showSpinner = false }, index) => (
            <DropdownItem
              key={name + '' + index}
              disabled={!toolbarItemsEnabled[index]}
              showSpinner={showSpinner}
              label={name}
              href={href}
              secondaryText={hotkey}
              data-testid={`editor-main-menu-item-${name.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => {
                if (!toolbarItemsEnabled[index]) return
                action()
                anchorEvent.set(null)
              }}
            />
          ))}
        </div>
      </ContextMenu>
    </>
  )
}
