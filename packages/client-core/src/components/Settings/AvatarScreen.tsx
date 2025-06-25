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

import React, { Fragment, useEffect } from 'react'

import { useHookstate } from '@hookstate/core'
import { useFind, useMutation } from '@ir-engine/common'
import { FeatureFlags } from '@ir-engine/common/src/constants/FeatureFlags'
import { AvatarID, avatarPath, userAvatarPath } from '@ir-engine/common/src/schema.type.module'
import { hasComponent, useOptionalComponent } from '@ir-engine/ecs'
import { AvatarComponent } from '@ir-engine/engine/src/avatar/components/AvatarComponent'
import { SpawnEffectComponent } from '@ir-engine/engine/src/avatar/components/SpawnEffectComponent'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { useMutableState } from '@ir-engine/hyperflux'
import Avatar from '../../common/components/Avatar/Avatar2'
import AvatarPreview from '../../common/components/AvatarPreview'
import { ModalState } from '../../common/services/ModalState'
import useFeatureFlags from '../../hooks/useFeatureFlags'
import AvatarCreatorMenu, { SupportedSdks } from '../../user/menus/avatar/AvatarCreatorMenu'
import AvatarModifyMenu from '../../user/menus/avatar/AvatarModifyMenu'
import { AuthService, AuthState } from '../../user/services/AuthService'
import { AVATAR_PAGE_LIMIT } from '../../user/services/AvatarService'
import { NavigateFuncProps } from '../Glass/NavigationProvider'
import { Inner } from '../Glass/ToolbarAndSidebar'
import { MenuItem } from './MenuItem'
import { Section } from './Section'

type AvatarScreenProps = NavigateFuncProps & {}

const AvatarScreen: React.FC<AvatarScreenProps> = ({ navigateTo }) => {
  const search = useHookstate('')
  const page = useHookstate(0)

  const { id: userId } = useMutableState(AuthState).user.value
  const { data: avatars } = useFind(avatarPath, {
    query: {
      name: {
        $like: `%${search.value}%`
      },
      $skip: page.value * AVATAR_PAGE_LIMIT,
      $limit: AVATAR_PAGE_LIMIT
    }
  })

  const initialAvatar = useFind(avatarPath, { query: { userId } }).data?.at(0)
  const selectedAvatarId = useHookstate(initialAvatar?.id || ('' as AvatarID))
  const selectedAvatar = avatars.find((avatar) => avatar.id === selectedAvatarId.value)

  const [createAvatarEnabled, uploadAvatarEnabled] = useFeatureFlags([
    FeatureFlags.Client.Menu.CreateAvatar,
    FeatureFlags.Client.Menu.UploadAvatar
  ])

  useEffect(() => {
    if (initialAvatar) {
      selectedAvatarId.set(initialAvatar.id)
    }
  }, [initialAvatar])

  AuthService.useAPIListeners()

  const userAvatarMutation = useMutation(userAvatarPath)
  const avatarEntity = AvatarComponent.useSelfAvatarEntity()
  const selfAvatarLoaded = useOptionalComponent(avatarEntity, GLTFComponent)?.progress?.value === 100

  const onAvatarThumbnailClicked = async (id: AvatarID) => {
    if (selectedAvatarId.value === id) return

    const selfAvatarEntity = AvatarComponent.getSelfAvatarEntity()
    if (!selfAvatarEntity || !hasComponent(selfAvatarEntity, SpawnEffectComponent)) {
      await userAvatarMutation.patch(null, { avatarId: selectedAvatarId.value }, { query: { userId } })
    }

    selectedAvatarId.set(id)
  }

  return (
    <Inner className="flex min-h-full flex-col gap-4">
      {/* Avatar Display Section */}
      <Section>
        <div className="relative aspect-square max-h-[250px] w-full overflow-hidden ">
          {selfAvatarLoaded && (
            <div className="relative h-full min-h-0 min-w-0 bg-gradient-to-b from-[#162941] to-[#114352]">
              <div className="stars absolute left-0 top-0 h-[2px] w-[2px] animate-twinkling bg-transparent" />
              <AvatarPreview fill avatarUrl={selectedAvatar?.modelResource?.url} />
            </div>
          )}
        </div>
      </Section>

      {/* Action Buttons */}
      <Section className={createAvatarEnabled || uploadAvatarEnabled ? '' : 'hidden'}>
        <MenuItem
          label="Create Avatar"
          onClick={() => {
            const Menu = AvatarCreatorMenu(SupportedSdks.ReadyPlayerMe)
            ModalState.openModal(<Menu showBackButton={false} previewEnabled={true} />, () => ModalState.closeModal())
          }}
          className={createAvatarEnabled ? '' : 'hidden'}
        />
        <div className="h-px bg-white/10"></div>
        <MenuItem
          label="Upload New Avatar"
          onClick={() => {
            ModalState.openModal(<AvatarModifyMenu />)
          }}
          className={uploadAvatarEnabled ? '' : 'hidden'}
        />
      </Section>
      <div className="flex-1 overflow-auto">
        <div className="grid grid-flow-row grid-cols-4 gap-4 p-4">
          {avatars.map((avatar) => (
            <Fragment key={avatar.id}>
              <Avatar
                imageSrc={avatar.thumbnailResource?.url || ''}
                isSelected={selectedAvatarId && avatar.id === selectedAvatarId.value}
                name={avatar.name}
                type="square"
                onClick={() => onAvatarThumbnailClicked(avatar.id)}
                playAudio={false}
              />
            </Fragment>
          ))}
        </div>
      </div>
    </Inner>
  )
}

export default AvatarScreen
