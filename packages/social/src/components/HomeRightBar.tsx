import React from 'react'
import { ProfilePic } from './ProfilePic'
import { RightBarSuggestions } from './RightBarSuggestions'
import { UsernameText } from './UsernameText'
import { useTranslation } from 'react-i18next'
import { LoginUserHook } from './GlobalHook'

export function HomeRightBar({ data }: any) {
  const loginUserData = LoginUserHook().data
  const { t } = useTranslation()

  return (
    <div className="suggestions hidden lg:flex lg:flex-col">
      {data && (
        <>
          <div className="right-bar-user-info flex items-center">
            <ProfilePic src={loginUserData?.image ?? null} size={56} username={loginUserData?.username ?? null} />
            <div className="user-info-texts ml-5 flex flex-col">
              <UsernameText style={{ paddingBottom: 2, paddingTop: 2 }} username={loginUserData.username} />
              <span className="text-12-light">{loginUserData.name || t('social:fullName')}</span>
            </div>
          </div>
          <RightBarSuggestions data={data} />
        </>
      )}
    </div>
  )
}
