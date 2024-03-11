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

import { PopoverState } from '@etherealengine/client-core/src/common/services/PopoverState'
import { StaticResourceType } from '@etherealengine/common/src/schema.type.module'
import { AssetsPreviewPanel } from '@etherealengine/editor/src/components/assets/AssetsPreviewPanel'
import {
  AssetTypeToMimeType,
  ExtensionToAssetType,
  MimeTypeToAssetType
} from '@etherealengine/engine/src/assets/constants/fileTypes'
import Button from '@etherealengine/ui/src/primitives/tailwind/Button'
import Input from '@etherealengine/ui/src/primitives/tailwind/Input'
import Modal from '@etherealengine/ui/src/primitives/tailwind/Modal'
import Radio from '@etherealengine/ui/src/primitives/tailwind/Radio'
import { useHookstate } from '@hookstate/core'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ResourceService } from '../../../admin/services/ResourceService'

const getNameAndType = async (url: string) => {
  const urlParts = url.split('/')
  const fileName = urlParts[urlParts.length - 1]

  const response = await fetch(url)
  const blob = await response.blob()
  if (!blob.type) {
    const extension = fileName.split('.').pop()
    const assetType = ExtensionToAssetType[extension!]
    const mimeType = AssetTypeToMimeType[assetType]
    return {
      name: fileName,
      mimeType: mimeType,
      assetType: assetType
    }
  }

  return {
    name: fileName,
    mimeType: blob.type,
    assetType: MimeTypeToAssetType[blob.type]
  }
}

export default function CreateResourceModal({
  selectedResource,
  mode
}: {
  selectedResource?: StaticResourceType
  mode: 'create' | 'edit'
}) {
  const { t } = useTranslation()

  const modalProcessing = useHookstate(false)
  const error = useHookstate('')

  const state = useHookstate({
    id: selectedResource?.id ? selectedResource.id : '',
    name: selectedResource?.key ? selectedResource.key : '',
    mimeType: selectedResource?.mimeType ? selectedResource.mimeType : '',
    project: selectedResource?.project ? selectedResource.project : '',
    source: 'url' as 'url' | 'file',
    resourceFile: undefined as File | undefined,
    resourceURL: selectedResource?.url ? selectedResource.url : ''
  })

  const previewPanelRef = React.useRef()

  useEffect(() => {
    if (state.source.value === 'file' && state.resourceFile.value) {
      state.name.set(state.resourceFile.value.name)
      if (state.resourceFile.value.type) {
        state.mimeType.set(state.resourceFile.value.type)
      } else {
        const extension = state.resourceFile.value.name.split('.').pop()!
        const assetType = ExtensionToAssetType[extension]
        const mimeType = AssetTypeToMimeType[assetType]
        state.mimeType.set(mimeType)
      }

      ;(previewPanelRef as any).current?.onSelectionChanged({
        name: state.resourceFile.value.name,
        resourceUrl: URL.createObjectURL(state.resourceFile.value) + '#' + state.resourceFile.value.name,
        contentType: MimeTypeToAssetType[state.mimeType.value]
      })
    } else {
      getNameAndType(state.resourceURL.value).then(({ name, mimeType, assetType }) => {
        state.name.set(name)
        state.mimeType.set(mimeType)
        ;(previewPanelRef as any).current?.onSelectionChanged({
          name: name,
          resourceUrl: state.resourceURL.value,
          contentType: assetType
        })
      })
    }
  }, [state.source, state.resourceFile, state.resourceURL])

  const handleSubmit = async () => {
    try {
      if (state.source.value === 'file' && state.resourceFile.value) {
        ResourceService.createOrUpdateResource(
          { path: state.name.value, project: state.project.value },
          state.resourceFile.value
        )
      } else if (state.source.value === 'url' && state.resourceURL.value) {
        const response = await fetch(state.resourceURL.value)
        const blob = await response.blob()
        const resourceFile = new File([blob], state.resourceURL.value.split('/').pop()!, {
          type: state.mimeType.value
        })

        ResourceService.createOrUpdateResource({ path: state.name.value, project: state.project.value }, resourceFile)
      }
      PopoverState.hidePopupover()
    } catch (e) {
      error.set(e.message)
    }
  }

  return (
    <Modal
      title={t('admin:components.resources.createResource')}
      onClose={!modalProcessing.value ? () => PopoverState.hidePopupover() : undefined}
      hideFooter={modalProcessing.value}
      className="w-[50vw]"
      onSubmit={handleSubmit}
    >
      <Input
        value={state.name.value}
        label={t('admin:components.resources.resourceName')}
        onChange={(e) => {
          state.name.set(e.target.value)
        }}
        className="mb-4"
      />
      <Input
        value={state.mimeType.value}
        label={t('admin:components.resources.columns.mimeType')}
        disabled
        className="mb-4"
      />
      <Input
        value={state.project.value}
        label={t('admin:components.resources.columns.project')}
        onChange={(e) => {
          state.project.set(e.target.value)
        }}
        className="mb-4"
      />
      <Radio
        currentValue={state.source.value}
        options={[
          { name: 'URL', value: 'url' },
          { name: 'File', value: 'file' }
        ]}
        onChange={(value) => state.source.set(value)}
        className="mb-4 grid-flow-col"
      />
      <Button fullWidth className="mb-4">
        <label className="block w-full cursor-pointer">
          {t('admin:components.resources.selectFile')}
          <input
            className="mb-4 hidden"
            type="file"
            onChange={(e) => {
              e.preventDefault()
              if (e.target.files) {
                state.resourceFile.set(e.target.files[0])
              }
            }}
          />
        </label>
      </Button>

      {state.source.value === 'url' && (
        <Input
          value={state.resourceURL.value}
          onChange={(e) => {
            state.resourceURL.set(e.target.value)
          }}
          label="Resource URL"
          className="mb-4"
        />
      )}

      <AssetsPreviewPanel ref={previewPanelRef} />
      {error.value && <p className="mt-4 text-rose-800">{error.value}</p>}
    </Modal>
  )
}
