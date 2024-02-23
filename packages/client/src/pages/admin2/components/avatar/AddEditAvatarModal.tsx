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
import '@etherealengine/engine/src/EngineModule'
import Button from '@etherealengine/ui/src/primitives/tailwind/Button'
import DragNDrop from '@etherealengine/ui/src/primitives/tailwind/DragNDrop'
import Input from '@etherealengine/ui/src/primitives/tailwind/Input'
import Modal from '@etherealengine/ui/src/primitives/tailwind/Modal'
import { useHookstate } from '@hookstate/core'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export default function AddEditAvatarModal({ avatar }: { avatar?: AvatarType }) {
  const { t } = useTranslation()
  const avatarName = useHookstate(avatar?.name || '')
  const avatarUrl = useHookstate(avatar?.modelResource?.url || '')
  const previewPanelRef = React.useRef()

  const avatarAssets = useHookstate({
    modelURL: avatar?.modelResource?.url || '',
    thumbnailURL: avatar?.thumbnailResource?.url || '',
    model: undefined as File | undefined,
    thumbnail: undefined as File | undefined
  })

  const handleSubmit = async () => {
    if (avatarAssets.model.value && avatarAssets.thumbnail.value) {
      if (avatar?.id) {
        try {
          await AvatarService.patchAvatar(
            avatar,
            avatar.name,
            true,
            avatarAssets.model.value,
            avatarAssets.thumbnail.value
          )
          PopoverState.hidePopupover()
        } catch (e) {
          console.error('Error updating avatar', e)
        }
      } else {
        try {
          await AvatarService.createAvatar(
            avatarAssets.model.value,
            avatarAssets.thumbnail.value,
            avatarName.value,
            true
          )
          PopoverState.hidePopupover()
        } catch (e) {
          console.error('Error creating avatar', e)
        }
      }
    }
  }

  useEffect(() => {
    ;(previewPanelRef as any).current?.onSelectionChanged({
      name: avatarAssets.model.value!.name,
      resourceUrl: URL.createObjectURL(avatarAssets.model.value!) + '#' + avatarAssets.model.value!.name,
      contentType: 'model/glb'
    })
  }, [avatarAssets.model.value])

  return (
    <Modal
      title={avatar?.id ? t('admin:components.avatar.update') : t('admin:components.avatar.add')}
      className="w-[50vw]"
      onSubmit={() => {}}
      onClose={() => {
        PopoverState.hidePopupover()
      }}
    >
      <div className="grid gap-6">
        <Input
          label={t('admin:components.common.name')}
          value={avatarName.value}
          onChange={(event) => avatarName.set(event.target.value)}
        />
        <Input
          label={t('admin:components.avatar.avatarUrl')}
          value={avatarUrl.value}
          onChange={(event) => avatarUrl.set(event.target.value)}
        />
      </div>
      <DragNDrop
        onDropEvent={(files) => {
          avatarAssets.model.set(files[0])
        }}
        acceptedDropTypes={ItemTypes.Models}
        className="mt-5 h-64"
      >
        {avatarAssets.model.value ? <AssetsPreviewPanel ref={previewPanelRef} /> : 'Upload avatar model'}
      </DragNDrop>

      <DragNDrop
        onDropEvent={(files) => {
          avatarAssets.thumbnail.set(files[0])
        }}
        acceptedDropTypes={ItemTypes.Images}
        className="mt-5 h-64"
      >
        {avatarAssets.thumbnail.value ? (
          <img
            className="max-h-full max-w-full"
            src={URL.createObjectURL(avatarAssets.thumbnail.value)}
            alt="thumbnail"
          />
        ) : (
          'Upload avatar thumbnail'
        )}
      </DragNDrop>

      <Button onClick={handleSubmit} disabled={!avatarAssets.model.value || !avatarAssets.thumbnail.value}>
        Submit
      </Button>
    </Modal>
  )
}
