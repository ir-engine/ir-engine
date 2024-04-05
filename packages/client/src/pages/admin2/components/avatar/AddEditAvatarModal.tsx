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
import { AvatarService } from '@etherealengine/client-core/src/user/services/AvatarService'
import { AvatarType } from '@etherealengine/common/src/schema.type.module'
import { AssetsPreviewPanel } from '@etherealengine/editor/src/components/assets/AssetsPreviewPanel'
import { ItemTypes } from '@etherealengine/editor/src/constants/AssetTypes'
import Button from '@etherealengine/ui/src/primitives/tailwind/Button'
import DragNDrop from '@etherealengine/ui/src/primitives/tailwind/DragNDrop'
import Input from '@etherealengine/ui/src/primitives/tailwind/Input'
import Modal from '@etherealengine/ui/src/primitives/tailwind/Modal'
import Radio from '@etherealengine/ui/src/primitives/tailwind/Radio'
import { useHookstate } from '@hookstate/core'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { HiArrowPath } from 'react-icons/hi2'

export default function AddEditAvatarModal({ avatar }: { avatar?: AvatarType }) {
  const { t } = useTranslation()
  const previewPanelRef = React.useRef()

  const avatarAssets = useHookstate({
    source: 'url',
    name: avatar?.name || '',
    modelURL: avatar?.modelResource?.url || '',
    thumbnailURL: avatar?.thumbnailResource?.url || '',
    model: undefined as File | undefined,
    thumbnail: undefined as File | undefined
  })

  const isAvatarSet = useHookstate(
    !!(avatarAssets.source.value === 'file' ? avatarAssets.model.value : avatarAssets.modelURL.value)
  )
  const isThumbnailSet = useHookstate(
    !!(avatarAssets.source.value === 'file' ? avatarAssets.thumbnail.value : avatarAssets.thumbnailURL.value)
  )

  useEffect(() => {
    if (avatarAssets.source.value === 'url') {
      isAvatarSet.set(!!avatarAssets.modelURL.value)
      isThumbnailSet.set(!!avatarAssets.thumbnailURL.value)
    } else {
      isAvatarSet.set(!!avatarAssets.model.value)
      isThumbnailSet.set(!!avatarAssets.thumbnail.value)
    }
  }, [
    avatarAssets.source,
    avatarAssets.model,
    avatarAssets.modelURL,
    avatarAssets.thumbnail,
    avatarAssets.thumbnailURL
  ])

  const handleSubmit = async () => {
    let avatarFile: File | undefined = undefined
    let avatarThumbnail: File | undefined = undefined

    if (avatarAssets.source.value === 'file') {
      avatarFile = avatarAssets.model.value
      avatarThumbnail = avatarAssets.thumbnail.value
    } else {
      const modelName = avatarAssets.modelURL.value.split('/').pop()!
      const avatarData = await fetch(avatarAssets.modelURL.value)
      avatarFile = new File([await avatarData.blob()], modelName)

      const thumbnailData = await fetch(avatarAssets.thumbnailURL.value)
      const thumbnailName = avatarAssets.thumbnailURL.value.split('/').pop()!
      avatarThumbnail = new File([await thumbnailData.blob()], thumbnailName)
    }

    if (avatarFile && avatarThumbnail) {
      if (avatar?.id) {
        try {
          await AvatarService.patchAvatar(avatar, avatarAssets.name.value, true, avatarFile, avatarThumbnail)
          PopoverState.hidePopupover()
        } catch (e) {
          console.error('Error updating avatar', e)
        }
      } else {
        try {
          await AvatarService.createAvatar(avatarFile, avatarThumbnail, avatarAssets.name.value, true)
          PopoverState.hidePopupover()
        } catch (e) {
          console.error('Error creating avatar', e)
        }
      }
    }
  }

  useEffect(() => {
    console.log('setting model preview')
    if (!avatarAssets.model.value || avatarAssets.source.value !== 'file') {
      console.log('early exit model preview')
      return
    }
    const modelType = avatarAssets.model.value.name.split('.').pop()

    ;(previewPanelRef as any).current?.onSelectionChanged({
      name: avatarAssets.model.value!.name,
      resourceUrl: URL.createObjectURL(avatarAssets.model.value) + '#' + avatarAssets.model.value.name,
      contentType: `model/${modelType}`
    })
  }, [avatarAssets.model])

  useEffect(() => {
    if (!avatarAssets.modelURL.value || avatarAssets.source.value !== 'url') return
    const modelName = avatarAssets.modelURL.value.split('/').pop()
    const modelType = avatarAssets.modelURL.value.split('.').pop()
    if (!modelName || !modelType) return
    ;(previewPanelRef as any).current?.onSelectionChanged({
      name: modelName,
      resourceUrl: avatarAssets.modelURL.value,
      contentType: `model/${modelType}`
    })
  }, [avatarAssets.modelURL])

  const clearAvatar = () => {
    if (avatarAssets.source.value === 'file') {
      avatarAssets.model.set(undefined)
    } else {
      avatarAssets.modelURL.set('')
    }
    ;(previewPanelRef as any).current?.onSelectionChanged({
      name: '',
      resourceUrl: '',
      contentType: 'model/glb'
    })
  }

  const clearThumbnail = () => {
    if (avatarAssets.source.value === 'file') {
      avatarAssets.thumbnail.set(undefined)
    } else {
      avatarAssets.thumbnailURL.set('')
    }
  }

  console.log('isavatarset: ', isAvatarSet.value)

  return (
    <Modal
      title={avatar?.id ? t('admin:components.avatar.update') : t('admin:components.avatar.add')}
      className="h-[90vh] w-[50vw]	overflow-y-scroll"
      onSubmit={() => {}}
      onClose={() => {
        PopoverState.hidePopupover()
      }}
    >
      <div className="grid gap-6">
        <Input
          label={t('admin:components.common.name')}
          value={avatarAssets.name.value}
          onChange={(event) => avatarAssets.name.set(event.target.value)}
        />
        <Radio
          currentValue={avatarAssets.source.value}
          options={[
            { name: 'URL', value: 'url' },
            { name: 'File', value: 'file' }
          ]}
          onChange={(value) => avatarAssets.source.set(value)}
          className="grid-flow-col"
        />
        {avatarAssets.source.value === 'url' && (
          <Input
            label={t('admin:components.avatar.avatarUrl')}
            value={avatarAssets.modelURL.value}
            onChange={(event) => avatarAssets.modelURL.set(event.target.value)}
            spellCheck={false}
          />
        )}
      </div>
      <DragNDrop
        onDropEvent={(files) => {
          avatarAssets.model.set(files[0])
        }}
        acceptedDropTypes={ItemTypes.Models}
        className="relative mt-5 h-64"
        acceptInput={!isAvatarSet.value && avatarAssets.source.value === 'file'}
        externalChildren={
          <Button startIcon={<HiArrowPath />} onClick={clearAvatar} className="absolute left-2 top-2">
            Replace avatar
          </Button>
        }
      >
        <AssetsPreviewPanel
          ref={previewPanelRef}
          previewPanelProps={{
            style: {
              width: isAvatarSet.value ? '100%' : '0'
            }
          }}
        />
        {!isAvatarSet.value && (
          <span className="z-20 w-full text-center">
            {avatarAssets.source.value === 'file' ? 'Upload avatar model' : 'Enter Avatar URL to preview'}
          </span>
        )}
      </DragNDrop>

      {avatarAssets.source.value === 'url' && (
        <Input
          containerClassname="mt-4"
          label={t('admin:components.avatar.thumbnailUrl')}
          value={avatarAssets.thumbnailURL.value}
          onChange={(event) => avatarAssets.thumbnailURL.set(event.target.value)}
          spellCheck={false}
        />
      )}
      <DragNDrop
        onDropEvent={(files) => {
          avatarAssets.thumbnail.set(files[0])
        }}
        acceptedDropTypes={ItemTypes.Images}
        className="relative mt-5 h-64"
        acceptInput={!isThumbnailSet.value && avatarAssets.source.value === 'file'}
        externalChildren={
          <Button startIcon={<HiArrowPath />} onClick={clearThumbnail} className="absolute left-2 top-2">
            Replace thumbnail
          </Button>
        }
      >
        {isThumbnailSet.value ? (
          <img
            className="mx-auto max-h-full max-w-full"
            src={
              avatarAssets.source.value === 'url'
                ? avatarAssets.thumbnailURL.value
                : avatarAssets.thumbnail.value
                ? URL.createObjectURL(avatarAssets.thumbnail.value)
                : ''
            }
            alt="thumbnail"
          />
        ) : (
          <span className="w-full text-center">
            {avatarAssets.source.value === 'file' ? 'Upload thumbnail' : 'Enter thumbnail URL to preview'}
          </span>
        )}
      </DragNDrop>

      <Button className="mt-3" onClick={handleSubmit}>
        Submit
      </Button>
    </Modal>
  )
}
