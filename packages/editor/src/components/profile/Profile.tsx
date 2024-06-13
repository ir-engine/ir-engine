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

import { DiscordIcon } from '@etherealengine/client-core/src/common/components/Icons/DiscordIcon'
import { GoogleIcon } from '@etherealengine/client-core/src/common/components/Icons/GoogleIcon'
import { LinkedInIcon } from '@etherealengine/client-core/src/common/components/Icons/LinkedInIcon'
import { MetaIcon } from '@etherealengine/client-core/src/common/components/Icons/MetaIcon'
import { XIcon } from '@etherealengine/client-core/src/common/components/Icons/XIcon'
import Text from '@etherealengine/client-core/src/common/components/Text'
import { initialAuthState, initialOAuthConnectedState } from '@etherealengine/client-core/src/common/initialAuthState'
import { UserMenus } from '@etherealengine/client-core/src/user/UserUISystem'
import { PopupMenuServices } from '@etherealengine/client-core/src/user/components/UserMenu/PopupMenuService'
import { AuthService, AuthState } from '@etherealengine/client-core/src/user/services/AuthService'
import { clientSettingPath } from '@etherealengine/common/src/schema.type.module'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { useFind } from '@etherealengine/spatial/src/common/functions/FeathersHooks'
import InputGroup from '@etherealengine/ui/src/components/editor/input/Group'
import StringInput from '@etherealengine/ui/src/components/editor/input/String'
import ContextMenu from '@etherealengine/ui/src/components/editor/layout/ContextMenu'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'
import IconButton from '@etherealengine/ui/src/primitives/mui/IconButton'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FaArrowRightToBracket } from 'react-icons/fa6'
import { LuSettings } from 'react-icons/lu'
import { MdOutlineKeyboardArrowDown } from 'react-icons/md'
import { PiEyeBold, PiEyeClosedBold, PiTrashSimple } from 'react-icons/pi'

const ProfileModal = ({ user }) => {
  const { t } = useTranslation()
  const selfUser = useHookstate(getMutableState(AuthState).user)

  useEffect(() => {
    oauthConnectedState.set(Object.assign({}, initialOAuthConnectedState))
    if (selfUser.identityProviders.get({ noproxy: true }))
      for (const ip of selfUser.identityProviders.get({ noproxy: true })!) {
        switch (ip.type) {
          case 'discord':
            oauthConnectedState.merge({ discord: true })
            break
          case 'facebook':
            oauthConnectedState.merge({ facebook: true })
            break
          case 'linkedin':
            oauthConnectedState.merge({ linkedin: true })
            break
          case 'google':
            oauthConnectedState.merge({ google: true })
            break
          case 'twitter':
            oauthConnectedState.merge({ twitter: true })
            break
          case 'github':
            oauthConnectedState.merge({ github: true })
            break
        }
      }
  }, [selfUser.identityProviders])

  const { inviteCode, name, id: userId, apiKey, avatar } = user
  const clientSetting = useFind(clientSettingPath).data.at(0)

  const authState = useHookstate(initialAuthState)
  const oauthConnectedState = useHookstate(Object.assign({}, initialOAuthConnectedState))
  const removeSocial = Object.values(oauthConnectedState.value).filter((value) => value).length >= 1
  const handleOAuthServiceClick = (e) => {
    AuthService.loginUserByOAuth(e.currentTarget.id, location)
  }
  const handleRemoveOAuthServiceClick = (e) => {
    AuthService.removeUserOAuth(e.currentTarget.id)
  }
  const enableSocial =
    authState?.value?.discord ||
    authState?.value?.facebook ||
    authState?.value?.github ||
    authState?.value?.google ||
    authState?.value?.linkedin ||
    authState?.value?.twitter

  const handleLogout = async () => {
    PopupMenuServices.showPopupMenu(UserMenus.Profile)
    await AuthService.logoutUser()
    oauthConnectedState.set(Object.assign({}, initialOAuthConnectedState))
  }

  const showKeys = useHookstate({
    apiKey: false,
    userId: false,
    inviteCode: false
  })

  const toggleKey = (type: string) => {
    switch (type) {
      case 'apiKey':
        showKeys.set({ ...showKeys.value, apiKey: !showKeys.apiKey.value })
        break
      case 'userId':
        showKeys.set({ ...showKeys.value, userId: !showKeys.userId.value })
        break
      case 'inviteCode':
        showKeys.set({ ...showKeys.value, inviteCode: !showKeys.inviteCode.value })
        break
    }
  }

  return (
    <>
      <div className="w-[350px]">
        <div className="flex gap-2 px-4 py-2">
          <div className="h-[60px] w-[60px] gap-2 overflow-hidden rounded-full">
            <img src={avatar.thumbnailResource.url.value} />
          </div>
          <span className="text-lg text-white">{name.value}</span>
        </div>
        <hr className="mx-4 text-[#A0A1A2] opacity-10" />
        <div className="px-4 py-2">
          <div className="grid grid-cols-1 gap-3">
            <InputGroup
              className="flex flex-row items-center justify-start"
              label="Invite Code"
              labelClassName="text-left w-32"
            >
              <StringInput
                type={showKeys.inviteCode.value ? 'text' : 'password'}
                className="w-full"
                value={inviteCode.value}
                endComponent={
                  <button
                    type="button"
                    className="m-0 h-5 w-5 flex-shrink-0 border-none p-0 hover:opacity-80"
                    onClick={() => toggleKey('inviteCode')}
                    name="inviteCode"
                  >
                    {showKeys.inviteCode.value ? (
                      <PiEyeBold className="font-small text-[#6B7280]" />
                    ) : (
                      <PiEyeClosedBold className="font-small text-[#6B7280]" />
                    )}
                  </button>
                }
              />
            </InputGroup>
            <InputGroup
              className="flex flex-row items-center justify-start"
              label="User ID"
              labelClassName="text-left w-32"
            >
              <StringInput
                type={showKeys.userId.value ? 'text' : 'password'}
                className="w-full"
                value={userId.value}
                endComponent={
                  <button
                    type="button"
                    className="m-0 h-5 w-5 flex-shrink-0 border-none p-0 hover:opacity-80"
                    onClick={() => toggleKey('userId')}
                    name="userId"
                  >
                    {showKeys.userId.value ? (
                      <PiEyeBold className="font-small text-[#6B7280]" />
                    ) : (
                      <PiEyeClosedBold className="font-small text-[#6B7280]" />
                    )}
                  </button>
                }
              />
            </InputGroup>
            <InputGroup
              className="flex flex-row items-center justify-start"
              label="API Key"
              labelClassName="text-left w-32"
            >
              <StringInput
                type={showKeys.apiKey.value ? 'text' : 'password'}
                className="w-full"
                value={apiKey.token.value}
                endComponent={
                  <button
                    type="button"
                    className="m-0 h-5 w-5 flex-shrink-0 border-none p-0 hover:opacity-80"
                    onClick={() => toggleKey('apiKey')}
                    name="apiKey"
                  >
                    {showKeys.apiKey.value ? (
                      <PiEyeBold className="font-small text-[#6B7280]" />
                    ) : (
                      <PiEyeClosedBold className="font-small text-[#6B7280]" />
                    )}
                  </button>
                }
              />
            </InputGroup>
          </div>
        </div>

        <hr className="mx-4 text-[#A0A1A2] opacity-10" />
        <div className="space-y-4 px-4 py-5">
          <span className="text-md ml-4 flex items-center gap-2 text-[#A0A1A2]">
            <LuSettings /> <span className="text-xs">Settings</span>
          </span>
          <span className="text-md ml-4 flex items-center gap-2 text-[#A0A1A2]" onClick={handleLogout}>
            <FaArrowRightToBracket /> <span className="text-xs">Log out</span>
          </span>
          <span className="text-md ml-4 flex items-center gap-2 text-[#A0A1A2]">
            <PiTrashSimple /> <span className="text-xs">Delete account</span>
          </span>
        </div>
        <hr className="mx-4 text-[#A0A1A2] opacity-10" />
        <div className="flex justify-center px-4 py-2">
          {
            <>
              <div>
                {
                  <IconButton
                    id="discord"
                    icon={<DiscordIcon viewBox="0 0 40 40" />}
                    onClick={handleOAuthServiceClick}
                  />
                }
                {<IconButton id="google" icon={<GoogleIcon viewBox="0 0 40 40" />} onClick={handleOAuthServiceClick} />}
                {
                  <IconButton
                    id="facebook"
                    icon={<MetaIcon width="40" height="40" viewBox="0 0 40 40" />}
                    onClick={handleOAuthServiceClick}
                  />
                }
                {
                  <IconButton
                    id="linkedin"
                    icon={<LinkedInIcon viewBox="0 0 40 40" />}
                    onClick={handleOAuthServiceClick}
                  />
                }
                {
                  <IconButton
                    id="twitter"
                    icon={<XIcon width="40" height="40" viewBox="0 0 40 40" />}
                    onClick={handleOAuthServiceClick}
                  />
                }
                {<IconButton id="github" icon={<Icon type="GitHub" />} onClick={handleOAuthServiceClick} />}
              </div>

              {!selfUser?.isGuest.value && removeSocial && (
                <>
                  <Text align="center" variant="body2" mb={1} mt={2}>
                    {t('user:usermenu.profile.removeSocial')}
                  </Text>

                  <div>
                    {authState?.discord.value && oauthConnectedState.discord.value && (
                      <IconButton
                        id="discord"
                        icon={<DiscordIcon viewBox="0 0 40 40" />}
                        onClick={handleRemoveOAuthServiceClick}
                      />
                    )}
                    {authState?.google.value && oauthConnectedState.google.value && (
                      <IconButton
                        id="google"
                        icon={<GoogleIcon viewBox="0 0 40 40" />}
                        onClick={handleRemoveOAuthServiceClick}
                      />
                    )}
                    {authState?.facebook.value && oauthConnectedState.facebook.value && (
                      <IconButton
                        id="facebook"
                        icon={<MetaIcon viewBox="0 0 40 40" />}
                        onClick={handleRemoveOAuthServiceClick}
                      />
                    )}
                    {authState?.linkedin.value && oauthConnectedState.linkedin.value && (
                      <IconButton
                        id="linkedin"
                        icon={<LinkedInIcon viewBox="0 0 40 40" />}
                        onClick={handleRemoveOAuthServiceClick}
                      />
                    )}
                    {authState?.twitter.value && oauthConnectedState.twitter.value && (
                      <IconButton
                        id="twitter"
                        icon={<XIcon viewBox="0 0 40 40" />}
                        onClick={handleRemoveOAuthServiceClick}
                      />
                    )}
                    {authState?.github.value && oauthConnectedState.github.value && (
                      <IconButton id="github" icon={<Icon type="GitHub" />} onClick={handleRemoveOAuthServiceClick} />
                    )}
                  </div>
                </>
              )}
            </>
          }
        </div>
        <hr className="mx-4 text-[#A0A1A2] opacity-10" />
        <div className="px-7 py-2">
          <a href={clientSetting?.privacyPolicy} className="text-xs text-[#A0A1A2] underline">
            {t('user:usermenu.profile.privacyPolicy')}
          </a>
        </div>
      </div>
    </>
  )
}

export const Profile = ({ user }) => {
  console.log(user)
  const { avatar } = user
  const anchorEl = useHookstate<HTMLElement | null>(null)
  const anchorPosition = useHookstate({ left: 0, top: 0 })

  const showProfile = useHookstate(true)

  const toggleDropdown = (event) => {
    showProfile.set((v) => !v)
    anchorPosition.set({ left: event.clientX - 5, top: event.clientY - 2 })
    anchorEl.set(event.currentTarget)
  }

  return (
    <>
      <div className="flex items-center justify-center gap-2 rounded-full bg-[#1F1F1F] px-1 py-0.5">
        <div className="overflow-hideen h-[26px] w-[26px] rounded-full px-1">
          <img src={avatar.thumbnailResource.url.value} alt="Image" className="h-full w-full object-contain" />
        </div>
        <MdOutlineKeyboardArrowDown
          size="1.5em"
          className={`text-theme-primary transition-transform ${showProfile.value ? 'rotate-180' : ''}`}
          onClick={(event) => toggleDropdown(event)}
        />
      </div>
      <ContextMenu
        anchorEl={anchorEl.value as HTMLElement}
        anchorPosition={anchorPosition.value}
        open={showProfile.value}
        panelId="profile-menu"
        onClose={() => showProfile.set(false)}
      >
        <ProfileModal user={user} />
      </ContextMenu>
    </>
  )
}
export default Profile
