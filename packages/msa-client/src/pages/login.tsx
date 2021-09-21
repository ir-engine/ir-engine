import { EmptyLayout } from '@xrengine/client-core/src/common/components/Layout/EmptyLayout'
import { AuthService } from '@xrengine/client-core/src/user/reducers/auth/AuthService'
import { selectInstanceConnectionState } from '../reducers/instanceConnection/selector'
import React, { useEffect } from 'react'
import { connect, useDispatch } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import ProfileMenu from '@xrengine/client-core/src/user/components/UserMenu/menus/ProfileMenu'
import { useTranslation } from 'react-i18next'

interface Props {
  instanceConnectionState?: any
}

const mapStateToProps = (state: any): any => {
  return {
    instanceConnectionState: selectInstanceConnectionState(state)
  }
}

export const IndexPage = (props: Props): any => {
  const dispatch = useDispatch()
  const { t } = useTranslation()

  useEffect(() => {
    dispatch(AuthService.doLoginAuto(true))
  }, [])

  // <Button className="right-bottom" variant="contained" color="secondary" aria-label="scene" onClick={(e) => { setSceneVisible(!sceneIsVisible); e.currentTarget.blur(); }}>scene</Button>

  return (
    <EmptyLayout pageTitle={t('login.pageTitle')}>
      <style>
        {' '}
        {`
                [class*=menuPanel] {
                    top: 75px;
                    bottom: initial;
                }
            `}
      </style>
      <ProfileMenu />
    </EmptyLayout>
  )
}

export default connect(mapStateToProps)(IndexPage)
