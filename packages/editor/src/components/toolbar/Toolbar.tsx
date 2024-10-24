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

import AddEditLocationModal from '@ir-engine/client-core/src/admin/components/locations/AddEditLocationModal'
import { NotificationService } from '@ir-engine/client-core/src/common/services/NotificationService'
import { PopoverState } from '@ir-engine/client-core/src/common/services/PopoverState'
import { RouterState } from '@ir-engine/client-core/src/common/services/RouterService'
import { AuthState } from '@ir-engine/client-core/src/user/services/AuthService'
import { useProjectPermissions } from '@ir-engine/client-core/src/user/useUserProjectPermission'
import { useUserHasAccessHook } from '@ir-engine/client-core/src/user/userHasAccess'
import { useFind } from '@ir-engine/common'
import { locationPath } from '@ir-engine/common/src/schema.type.module'
import { GLTFModifiedState } from '@ir-engine/engine/src/gltf/GLTFDocumentState'
import { getMutableState, getState, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { DropdownItem } from '@ir-engine/ui'
import { ContextMenu } from '@ir-engine/ui/src/components/tailwind/ContextMenu'
import { Popup } from '@ir-engine/ui/src/components/tailwind/Popup'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import { t } from 'i18next'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { MdOutlineKeyboardArrowDown } from 'react-icons/md'
import { RxHamburgerMenu } from 'react-icons/rx'
import { twMerge } from 'tailwind-merge'
import { inputFileWithAddToScene } from '../../functions/assetFunctions'
import { onNewScene } from '../../functions/sceneFunctions'
import { cmdOrCtrlString } from '../../functions/utils'
import { EditorHelperState } from '../../services/EditorHelperState'
import { EditorState } from '../../services/EditorServices'
import { UIAddonsState } from '../../services/UIAddonsState'
import CreateSceneDialog from '../dialogs/CreateScenePanelDialog'
import ImportSettingsPanel from '../dialogs/ImportSettingsPanelDialog'
import { SaveNewSceneDialog, SaveSceneDialog } from '../dialogs/SaveSceneDialog'

const onImportAsset = async () => {
  const { projectName } = getState(EditorState)

  if (projectName) {
    try {
      await inputFileWithAddToScene({ projectName, directoryPath: 'projects/' + projectName + '/assets/' })
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

export const confirmSceneSaveIfModified = async () => {
  const isModified = EditorState.isModified()

  if (isModified) {
    return new Promise((resolve) => {
      PopoverState.showPopupover(
        <SaveSceneDialog isExiting onConfirm={() => resolve(true)} onCancel={() => resolve(false)} />
      )
    })
  }
  return true
}

const onClickNewScene = async () => {
  if (!(await confirmSceneSaveIfModified())) return

  const newSceneUIAddons = getState(UIAddonsState).editor.newScene

  if (Object.keys(newSceneUIAddons).length > 0) {
    PopoverState.showPopupover(<CreateSceneDialog />)
  } else {
    onNewScene()
  }
}

export const onCloseProject = async () => {
  if (getMutableState(EditorHelperState).gizmoEnabled.value) {
    if (!(await confirmSceneSaveIfModified())) return
  }

  const editorState = getMutableState(EditorState)
  getMutableState(GLTFModifiedState).set({})
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
      action: () => PopoverState.showPopupover(<SaveSceneDialog />)
    },
    {
      name: t('editor:menubar.saveAs'),
      action: () => PopoverState.showPopupover(<SaveNewSceneDialog />)
    },
    {
      name: t('editor:menubar.importSettings'),
      action: () => PopoverState.showPopupover(<ImportSettingsPanel />)
    },
    {
      name: t('editor:menubar.importAsset'),
      action: onImportAsset
    },
    {
      name: t('editor:menubar.quit'),
      action: onCloseProject
    }
  ]
}

const toolbarMenu = generateToolbarMenu()

export default function Toolbar() {
  const { t } = useTranslation()
  const anchorEvent = useHookstate<null | React.MouseEvent<HTMLElement>>(null)
  const anchorPosition = useHookstate({ left: 0, top: 0 })

  const { projectName, sceneName, sceneAssetID } = useMutableState(EditorState)

  const hasLocationWriteScope = useUserHasAccessHook('location:write')
  const permission = useProjectPermissions(projectName.value!)
  const hasPublishAccess = hasLocationWriteScope || permission?.type === 'owner' || permission?.type === 'editor'
  const locationQuery = useFind(locationPath, { query: { action: 'studio', sceneId: sceneAssetID.value } })
  const currentLocation = locationQuery.data[0]

  return (
    <>
      <div className="flex h-10 items-center justify-between bg-theme-primary">
        <div className="flex items-center">
          <div className="ml-3 mr-6 cursor-pointer" onClick={onCloseProject}>
            <img src="ir-studio-icon.svg" alt="iR Engine Logo" className={`h-6 w-6`} />
          </div>
          <Button
            endIcon={<MdOutlineKeyboardArrowDown size="1em" className="-ml-3 text-[#A3A3A3]" />}
            iconContainerClassName="ml-2 mr-1"
            rounded="none"
            startIcon={<RxHamburgerMenu size={24} className="text-theme-input" />}
            className="-mr-1 border-0 bg-transparent p-0"
            onClick={(event) => {
              anchorPosition.set({ left: event.clientX - 5, top: event.clientY - 2 })
              anchorEvent.set(event)
            }}
          />
        </div>
        {/* TO BE ADDED */}
        {/* <div className="flex items-center gap-2.5 rounded-full bg-[#212226] p-0.5">
          <div className="rounded-2xl px-2.5">{t('editor:toolbar.lbl-simple')}</div>
          <div className="rounded-2xl bg-blue-primary px-2.5">{t('editor:toolbar.lbl-advanced')}</div>
        </div> */}
        <div className="flex items-center gap-2.5">
          <span className="text-[#B2B5BD]">{projectName.value}</span>
          <span>/</span>
          <span>{sceneName.value}</span>
        </div>

        <div className="flex items-center justify-center gap-2">
          <ProfilePill />

          {sceneAssetID.value && (
            <div className="p-2">
              <Button
                rounded="full"
                disabled={!hasPublishAccess}
                onClick={() =>
                  PopoverState.showPopupover(
                    <AddEditLocationModal action="studio" sceneID={sceneAssetID.value} location={currentLocation} />
                  )
                }
                className="py-1 text-base"
              >
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
          {toolbarMenu.map(({ name, action, hotkey }, index) => (
            <DropdownItem
              className={twMerge(index === 0 && 'rounded-t-lg', index === toolbarMenu.length - 1 && 'rounded-b-lg')}
              title={name}
              secondaryText={hotkey}
              onClick={() => {
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

const ProfilePill = () => {
  const user = getMutableState(AuthState).user
  const email = user.value.identityProviders.find((ip) => ip.type === 'email')?.accountIdentifier
  return (
    <Popup
      trigger={
        <button className="flex h-8 items-center justify-center gap-1.5 rounded-full bg-[#191B1F] focus:ring-1 focus:ring-blue-primary">
          <div className="ml-1 h-6 w-6 overflow-hidden rounded-full">
            <img src={user.value?.avatar?.thumbnailResource?.url} className="h-full w-full" />
          </div>

          <div className="cursor-pointer pr-2">
            <MdOutlineKeyboardArrowDown size="1.2em" />
          </div>
        </button>
      }
    >
      <div className="flex w-fit min-w-44 flex-col gap-1 truncate rounded-lg bg-neutral-900 p-8 shadow-lg">
        <div className="flex items-center justify-center gap-2">
          <div className="h-14 w-14 overflow-hidden rounded-full">
            <img src={user.value?.avatar?.thumbnailResource?.url} />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xl font-medium text-[#F5F5F5]">{user.value.name}</span>
            <span className="text-base text-[#B2B5BD]">{email}</span>
          </div>
        </div>
        <div className="pb-1 pt-4">
          <hr className="border border-[#212226]" />
        </div>
      </div>
    </Popup>
  )
}
