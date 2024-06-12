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
import { PiTrashSimple } from 'react-icons/pi'

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

  return (
    <>
      <div className="w-[400px]">
        <div className="flex gap-2 px-4 py-5">
          <div className="h-[60px] w-[60px] gap-2 overflow-hidden rounded-full">
            <img src={avatar.thumbnailResource.url.value} />
          </div>
          <span className="text-lg text-white">{name.value}</span>
        </div>
        <hr className="m-4 text-[#A0A1A2] opacity-10" />
        <div className="px-4 py-5">
          <div className="grid grid-cols-1 gap-3">
            <InputGroup
              className="flex flex-row items-center justify-start"
              label="Invite Code"
              labelClassName="text-left w-32"
            >
              <StringInput className="w-full" value={inviteCode.value} disabled />
            </InputGroup>
            <InputGroup
              className="flex flex-row items-center justify-start"
              label="User ID"
              labelClassName="text-left w-32"
            >
              <StringInput className="w-full" value={userId.value} disabled />
            </InputGroup>
            <InputGroup
              className="flex flex-row items-center justify-start"
              label="API Key"
              labelClassName="text-left w-32"
            >
              <StringInput className="w-full" value={apiKey.token.value} disabled />
            </InputGroup>
          </div>
        </div>

        <hr className="m-4 text-[#A0A1A2] opacity-10" />
        <div className="px-4 py-5">
          <span className="text-md mb-6 ml-4 flex items-center gap-2 text-[#A0A1A2]">
            <LuSettings /> <span className="text-xs">Settings</span>
          </span>
          <span className="text-md mb-6 ml-4 flex items-center gap-2 text-[#A0A1A2]" onClick={handleLogout}>
            <FaArrowRightToBracket /> <span className="text-xs">Log out</span>
          </span>
          <span className="text-md mb-6 ml-4 flex items-center gap-2 text-[#A0A1A2]">
            <PiTrashSimple /> <span className="text-xs">Delete account</span>
          </span>
        </div>
        <hr className="m-4 text-[#A0A1A2] opacity-10" />
        <div className="flex justify-center px-4 py-5">
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
        <hr className="m-4 text-[#A0A1A2] opacity-10" />
        <div className="px-7 py-5">
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
