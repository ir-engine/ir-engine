import { EmptyLayout } from '@xrengine/client-core/src/common/components/Layout/EmptyLayout'
import { AuthService } from '@xrengine/client-core/src/user/state/AuthService'
import React, { useEffect } from 'react'
import { useDispatch } from '@xrengine/client-core/src/store'
import { bindActionCreators, Dispatch } from 'redux'
import { useTranslation } from 'react-i18next'
import AdminLogin from '../components/AdminLogin'

interface Props {}

export const IndexPage = (props: Props): any => {
  //const { doLoginAuto } = props
  const dispatch = useDispatch()
  const { t } = useTranslation()

  useEffect(() => {
    AuthService.doLoginAuto(true)
  }, [])

  // <Button className="right-bottom" variant="contained" color="secondary" aria-label="scene" onClick={(e) => { setSceneVisible(!sceneIsVisible); e.currentTarget.blur(); }}>scene</Button>

  return (
    <EmptyLayout pageTitle={t('login.pageTitle')}>
      {/* <style>
        {' '}
        {`
                [class*=menuPanel] {
                    top: 75px;
                    bottom: initial;
                }
            `}
      </style> */}
      <AdminLogin />
    </EmptyLayout>
  )
}

export default IndexPage
