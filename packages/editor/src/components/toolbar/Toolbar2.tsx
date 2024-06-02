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

import { NotificationService } from '@etherealengine/client-core/src/common/services/NotificationService'
import { PopoverState } from '@etherealengine/client-core/src/common/services/PopoverState'
import { RouterState } from '@etherealengine/client-core/src/common/services/RouterService'
import { GLTFModifiedState } from '@etherealengine/engine/src/gltf/GLTFDocumentState'
import { getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'
import ContextMenu from '@etherealengine/ui/src/components/editor/layout/ContextMenu'
import Button from '@etherealengine/ui/src/primitives/tailwind/Button'
import { t } from 'i18next'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { MdOutlineKeyboardArrowDown } from 'react-icons/md'
import { inputFileWithAddToScene } from '../../functions/assetFunctions'
import { onNewScene } from '../../functions/sceneFunctions'
import { cmdOrCtrlString } from '../../functions/utils'
import { EditorState } from '../../services/EditorServices'
import ImportSettingsPanel from '../dialogs/ImportSettingsPanelDialog2'
import { SaveNewSceneDialog, SaveSceneDialog } from '../dialogs/SaveSceneDialog2'

const onImportAsset = async () => {
  const { projectName } = getState(EditorState)

  if (projectName) {
    try {
      await inputFileWithAddToScene({ projectName })
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

const onCloseProject = () => {
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
      action: onNewScene
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
  const anchorEl = useHookstate<HTMLElement | null>(null)
  const anchorPosition = useHookstate({ left: 0, top: 0 })
  const anchorOpen = useHookstate(false)

  return (
    <>
      <div className="flex items-center justify-between bg-theme-primary">
        <div className="flex items-center">
          <Button
            endIcon={<MdOutlineKeyboardArrowDown size="1.5em" className="text-[#A3A3A3]" />}
            rounded="none"
            startIcon={
              <svg xmlns="http://www.w3.org/2000/svg" width="19" height="21" viewBox="0 0 19 21" fill="none">
                <path
                  d="M9.29664 18.4558L0.00390625 13.0986V15.061C0.00390625 15.5051 0.24025 15.9169 0.627 16.1353L8.68429 20.7405C8.87408 20.848 9.08536 20.9017 9.29664 20.9052V18.4594V18.4558Z"
                  fill="#FAFAFA"
                />
                <path
                  d="M9.9164 20.7363L17.9737 16.1311C18.3604 15.9091 18.5968 15.5009 18.5968 15.0568V13.123L9.29688 18.4552V20.901C9.50816 20.901 9.72302 20.8473 9.91281 20.7363H9.9164Z"
                  fill="#FAFAFA"
                />
                <path
                  d="M10.6365 17.6716L7.66063 19.4155C7.26671 19.6483 6.77612 19.6483 6.37863 19.4227L5.88086 19.1362L8.67048 20.7334C9.06081 20.9554 9.54067 20.9554 9.931 20.7334L17.9704 16.1318C18.3535 15.9133 18.5899 15.5051 18.5899 15.0646V13.1201L10.6329 17.668L10.6365 17.6716Z"
                  fill="#FAFAFA"
                />
                <path
                  d="M7.4887 8.33314L8.36247 8.85238C8.81009 9.11738 9.59075 8.97772 10.0455 8.71631L13.8629 6.48533L11.9435 5.3788C11.7036 5.23914 11.4063 5.24272 11.1664 5.3788L8.29084 7.06546C7.88619 7.29822 7.15924 7.44504 6.75458 7.2087L5.83427 6.67871C5.37948 6.41729 4.82084 6.41729 4.36963 6.67871L2.31055 7.8676V10.5283L6.38574 8.17557C6.79755 7.93922 7.08046 8.08605 7.4887 8.32956V8.33314Z"
                  fill="#FAFAFA"
                />
                <path
                  d="M17.9692 4.76902L9.91188 0.163832C9.53229 -0.0546105 9.06318 -0.0546105 8.68359 0.163832L9.27804 2.45568L18.5887 7.80931V5.8469C18.5923 5.40286 18.3559 4.99104 17.9692 4.7726V4.76902Z"
                  fill="#FAFAFA"
                />
                <path
                  d="M7.96126 3.22927L10.9371 1.48531C11.331 1.25255 11.8216 1.25254 12.2191 1.47815L12.7169 1.76463L9.92724 0.167494C9.53691 -0.0545292 9.05705 -0.0545292 8.66672 0.167494L0.627333 4.7691C0.244164 4.98755 0.0078125 5.39578 0.0078125 5.83625V9.22031L2.31399 10.531V7.16122C2.31399 6.74224 2.53959 6.35191 2.90485 6.14063L7.96483 3.22927H7.96126Z"
                  fill="#FAFAFA"
                />
                <path
                  d="M18.4422 5.24902L10.8899 9.54983C10.4852 9.7826 9.70814 9.86496 9.2999 9.62861L8.37958 9.09862C7.93553 8.84078 7.66338 8.762 7.21575 9.01983L0 13.095V15.0932C0 15.2866 0.0501356 15.4728 0.146823 15.6411L8.98477 10.6599C9.39659 10.4236 9.62577 10.506 10.034 10.7495L10.9078 11.2687C11.3554 11.5337 11.914 11.5409 12.3653 11.2795L18.5891 7.80945V5.83631C18.5926 5.65368 18.5497 5.47105 18.4709 5.30632L18.4422 5.24902Z"
                  fill="#FAFAFA"
                />
                <path
                  d="M16.3073 10.46L16.2893 10.4707L13.6107 11.9783C13.2061 12.2111 12.4111 12.34 12.0064 12.1072L11.0861 11.5772C10.6421 11.3194 10.3842 11.1941 9.9402 11.4483L4.67969 14.4886L6.60269 15.5987C6.83904 15.7348 7.13268 15.7348 7.36902 15.5987L11.7128 13.092C11.9635 12.9452 12.275 12.9488 12.5257 13.0992L13.6179 13.7509C14.0655 14.0159 14.6242 14.0231 15.0754 13.7616L16.2929 13.0848L18.5991 11.8064L16.3108 10.4671L16.3073 10.46Z"
                  fill="#FAFAFA"
                />
                <path d="M18.5956 11.7988L18.5884 13.1202L16.293 14.438V13.0808L18.5956 11.7988Z" fill="#FAFAFA" />
              </svg>
            }
            className="border-0 bg-transparent py-1 pl-2 pr-0"
            onClick={(event) => {
              anchorOpen.set(true)
              anchorPosition.set({ left: event.clientX - 5, top: event.clientY - 2 })
              anchorEl.set(event.currentTarget)
            }}
          />
          <Button
            endIcon={
              <MdOutlineKeyboardArrowDown
                size="1.5em"
                className={`m-0 text-[#A3A3A3]`}
                // onClick={toggleDropdown}
              />
            }
            rounded="none"
            startIcon={
              <svg xmlns="http://www.w3.org/2000/svg" width="19" height="21" viewBox="0 0 19 21" fill="none">
                <rect x="10.3477" y="0.5" width="7.75286" height="8.83776" rx="1.5" stroke="white" />
                <rect x="11.4414" y="12.7969" width="6.65875" height="7.60804" rx="1.5" stroke="white" />
                <rect x="0.5" y="0.5" width="6.65875" height="7.60804" rx="1.5" stroke="white" />
                <rect x="0.5" y="11.5674" width="7.75286" height="8.83776" rx="1.5" stroke="white" />
              </svg>
            }
            className="border-0 bg-transparent px-1 py-1"
            onClick={(event) => {
              // anchorOpen.set(true)
              // anchorPosition.set({ left: event.clientX - 5, top: event.clientY - 2 })
              // anchorEl.set(event.currentTarget)
            }}
          />
        </div>
        {/* TO BE ADDED */}
        {/* <div className="flex items-center gap-2.5 rounded-full bg-theme-surface-main p-0.5">
          <div className="rounded-2xl px-2.5">{t('editor:toolbar.lbl-simple')}</div>
          <div className="rounded-2xl bg-blue-primary px-2.5">{t('editor:toolbar.lbl-advanced')}</div>
        </div> */}
        <Button rounded="none" className="ml-auto">
          {t('editor:toolbar.lbl-publish')}
        </Button>
      </div>
      <ContextMenu
        anchorEl={anchorEl.value as HTMLElement}
        anchorPosition={anchorPosition.value}
        open={anchorOpen.value}
        panelId="toolbar-menu"
        onClose={() => anchorOpen.set(false)}
      >
        {toolbarMenu.map(({ name, action, hotkey }, index) => (
          <div key={index} className="m-1">
            <Button size="small" variant="outline" fullWidth onClick={action} endIcon={hotkey}>
              {name}
            </Button>
          </div>
        ))}
      </ContextMenu>
    </>
  )
}
