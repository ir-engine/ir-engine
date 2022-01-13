import { EmptyLayout } from '@xrengine/client-core/src/common/components/Layout/EmptyLayout'
import ProfileMenu from '@xrengine/client-core/src/user/components/UserMenu/menus/ProfileMenu'
import { AuthService } from '@xrengine/client-core/src/user/services/AuthService'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export const IndexPage = (): any => {
  const { t } = useTranslation()

  useEffect(() => {
    AuthService.doLoginAuto(true)
  }, [])

  // <Button className="right-bottom" variant="contained" color="secondary" aria-label="scene" onClick={(e) => { setSceneVisible(!sceneIsVisible); e.currentTarget.blur(); }}>scene</Button>

  return (
    <EmptyLayout pageTitle={t('login.pageTitle')}>
      <style>
        {`
          [class*=menuPanel] {
              top: 75px;
              bottom: initial;
              pointer-events: auto;
          }
        `}
      </style>
      <ProfileMenu />
    </EmptyLayout>
  )
}

export default IndexPage
